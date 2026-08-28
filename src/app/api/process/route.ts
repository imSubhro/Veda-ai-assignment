import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { fileToImageUrl } from "@/lib/server-pdf-utils";

export const runtime = "nodejs";
export const maxDuration = 60;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

interface Question {
  id: string;
  number: string;
  subPart?: string;
  text: string;
  page: number;
  bbox: [number, number, number, number];
}

interface AnswerBlock {
  id: string;
  detectedLabel?: string;
  text: string;
  pages: {
    page: number;
    bbox: [number, number, number, number];
  }[];
}

interface Mapping {
  questionId: string;
  answerBlockIds: string[];
  matchConfidence: number;
  matchMethod: "label" | "semantic" | "manual" | "none";
  marksAwarded?: number;
  maxMarks?: number;
  isCorrect?: boolean;
  feedback?: string;
}

function parseJson<T>(text: string, fallback: T): T {
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start < 0 || end < start) return fallback;

  try {
    return JSON.parse(text.slice(start, end + 1)) as T;
  } catch {
    return fallback;
  }
}

function clampBbox(bbox: unknown): [number, number, number, number] {
  if (!Array.isArray(bbox) || bbox.length !== 4) return [0, 0, 1, 1];
  const values = bbox.map((value) => Number(value));
  if (values.some((value) => !Number.isFinite(value))) return [0, 0, 1, 1];
  const x = Math.min(1, Math.max(0, values[0]));
  const y = Math.min(1, Math.max(0, values[1]));
  const width = Math.min(1 - x, Math.max(0.01, values[2]));
  const height = Math.min(1 - y, Math.max(0.01, values[3]));
  return [x, y, width, height];
}

async function filesToAnalysisImages(files: File[]) {
  const images: { data: string; mimeType: string }[] = [];
  for (const file of files) {
    const pages = await fileToImageUrl(file);
    for (const page of pages) {
      const [header, data] = page.split(",");
      images.push({
        data,
        mimeType: header.match(/^data:(.*?);base64/)?.[1] || "image/jpeg",
      });
    }
  }
  return images;
}

async function extractQuestions(
  images: { data: string; mimeType: string }[]
): Promise<Question[]> {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-lite",
    generationConfig: { responseMimeType: "application/json" },
  });

  const prompt = `You are an exam paper analyzer. Extract ALL questions from this question paper image(s).

Return ONLY a valid JSON array (no markdown, no explanation) with this exact structure:
[
  {
    "id": "q1",
    "number": "1",
    "subPart": null,
    "text": "Full question text here",
    "page": 1,
    "bbox": [x, y, w, h]
  }
]

Rules:
- Preserve original question numbering exactly as printed and keep page order
- Sub-parts like 11(a), 11(b) should be separate entries with subPart field
- Read the complete printed question, including options, marks, and sub-question text
- Treat each supplied image as one page, in the exact order supplied (page is 1-based)
- bbox should be normalized coordinates [x, y, width, height] in range 0-1 relative to page dimensions
- If no bbox is visible, use approximate coordinates
- Include ALL questions, don't skip any
- Return ONLY the JSON array, nothing else`;

  const imageParts = images.map((img) => ({
    inlineData: { mimeType: img.mimeType, data: img.data },
  }));

  const result = await model.generateContent([prompt, ...imageParts]);
  const text = result.response.text();

  let cleaned = text.trim();
  if (cleaned.startsWith("```json")) cleaned = cleaned.slice(7);
  if (cleaned.startsWith("```")) cleaned = cleaned.slice(3);
  if (cleaned.endsWith("```")) cleaned = cleaned.slice(0, -3);
  cleaned = cleaned.trim();

  const parsed = parseJson<Partial<Question>[]>(cleaned, []);
  return parsed
    .filter((q) => q.text && q.number)
    .map((q, index) => ({
      id: q.id || `q${index + 1}`,
      number: String(q.number),
      ...(q.subPart ? { subPart: String(q.subPart) } : {}),
      text: String(q.text),
      page: Math.max(1, Number(q.page) || 1),
      bbox: clampBbox(q.bbox),
    }));
}

async function extractAnswers(
  images: { data: string; mimeType: string }[]
): Promise<AnswerBlock[]> {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-lite",
    generationConfig: { responseMimeType: "application/json" },
  });

  const prompt = `You are a handwriting analyzer. Extract ALL answer blocks from this student answer sheet image(s).

Return ONLY a valid JSON array (no markdown, no explanation) with this exact structure:
[
  {
    "id": "a1",
    "detectedLabel": "Q1",
    "text": "Transcribed answer text here",
    "pages": [
      {
        "page": 0,
        "bbox": [x, y, w, h]
      }
    ]
  }
]

Rules:
- Detect question labels like "Q1", "Q2", "1.", "2.", "a)", "b)" etc.
- Use one answer block for one complete answer, including continuation pages
- Do not merge unrelated answers just because they are on the same page
- Transcribe the handwritten text as accurately as possible
- bbox should be normalized coordinates [x, y, width, height] in range 0-1
- If an answer spans multiple pages, include multiple page entries
- Group related content as one answer block
- Return ONLY the JSON array, nothing else`;

  const imageParts = images.map((img) => ({
    inlineData: { mimeType: img.mimeType, data: img.data },
  }));

  const result = await model.generateContent([prompt, ...imageParts]);
  const text = result.response.text();

  let cleaned = text.trim();
  if (cleaned.startsWith("```json")) cleaned = cleaned.slice(7);
  if (cleaned.startsWith("```")) cleaned = cleaned.slice(3);
  if (cleaned.endsWith("```")) cleaned = cleaned.slice(0, -3);
  cleaned = cleaned.trim();

  const parsed = parseJson<Partial<AnswerBlock>[]>(cleaned, []);
  return parsed
    .filter((a) => a.text)
    .map((a, index) => ({
      id: a.id || `a${index + 1}`,
      ...(a.detectedLabel ? { detectedLabel: String(a.detectedLabel) } : {}),
      text: String(a.text),
      pages: Array.isArray(a.pages)
        ? a.pages.map((p) => ({
            page: Math.max(0, Number(p.page) || 0),
            bbox: clampBbox(p.bbox),
          }))
        : [],
    }));
}

async function mapAnswers(
  questions: Question[],
  answerBlocks: AnswerBlock[]
): Promise<Mapping[]> {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-lite",
    generationConfig: { responseMimeType: "application/json" },
  });

  const questionsJson = JSON.stringify(
    questions.map((q) => ({
      id: q.id,
      number: q.number,
      subPart: q.subPart,
      text: q.text,
    }))
  );
  const answersJson = JSON.stringify(
    answerBlocks.map((a) => ({
      id: a.id,
      detectedLabel: a.detectedLabel,
      text: a.text,
    }))
  );

  const prompt = `You are an answer-to-question mapper and careful exam evaluator. Match each answer to the correct question, then evaluate whether the answer is correct based only on the question and the student's transcribed answer.

Questions: ${questionsJson}

Answers: ${answersJson}

Return ONLY a valid JSON array (no markdown, no explanation) with this exact structure:
[
  {
    "questionId": "q1",
    "answerBlockIds": ["a1"],
    "matchConfidence": 0.95,
    "matchMethod": "label",
    "marksAwarded": 2,
    "maxMarks": 2,
    "isCorrect": true,
    "feedback": "Correct: the answer identifies ..."
  }
]

Rules:
- Match by explicit label first (e.g., "Q1" matches question number "1")
- Fall back to semantic/content similarity for unlabeled answers
- Questions with no matching answer should have answerBlockIds: []
- Answer blocks with no matching question should NOT be included
- matchConfidence: 0.0 to 1.0
- matchMethod: "label" | "semantic" | "none"
- Evaluate only matched answers. Set isCorrect false when the answer is wrong, incomplete, or contradicts the question.
- Set marksAwarded and maxMarks using marks stated in the question when visible; otherwise use maxMarks 2.
- Feedback must be specific to this question and answer. Explain the error briefly and state what a correct answer should include. Never use generic feedback.
- For unanswered questions use marksAwarded 0, isCorrect false, and feedback "Not answered."
- Return ONLY the JSON array, nothing else`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  let cleaned = text.trim();
  if (cleaned.startsWith("```json")) cleaned = cleaned.slice(7);
  if (cleaned.startsWith("```")) cleaned = cleaned.slice(3);
  if (cleaned.endsWith("```")) cleaned = cleaned.slice(0, -3);
  cleaned = cleaned.trim();

  try {
    const mappings = parseJson<Mapping[]>(cleaned, []);
    const mappedIds = new Set(mappings.map((m) => m.questionId));
    for (const q of questions) {
      if (!mappedIds.has(q.id)) {
        mappings.push({
          questionId: q.id,
          answerBlockIds: [],
          matchConfidence: 0,
          matchMethod: "none",
          marksAwarded: 0,
          maxMarks: 2,
          isCorrect: false,
          feedback: "Not answered.",
        });
      }
    }
    return mappings;
  } catch {
    console.error("Failed to parse mappings JSON:", cleaned);
    return questions.map((q) => ({
      questionId: q.id,
      answerBlockIds: [],
      matchConfidence: 0,
      matchMethod: "none" as const,
      marksAwarded: 0,
      maxMarks: 2,
      isCorrect: false,
      feedback: "Not answered.",
    }));
  }
}

const ALLOWED_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/gif",
  "image/bmp",
  "image/tiff",
]);
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(request: NextRequest) {
  let stage = "request validation";
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    // Accept files directly via multipart form data
    const formData = await request.formData();

    const questionPaperFiles: File[] = [];
    const answerSheetFiles: File[] = [];

    for (const [key, value] of formData.entries()) {
      if (!(value instanceof File)) continue;
      if (key === "questionPaper") questionPaperFiles.push(value);
      else if (key === "answerSheet") answerSheetFiles.push(value);
    }

    if (questionPaperFiles.length === 0) {
      return NextResponse.json(
        { error: "No question paper files provided" },
        { status: 400 }
      );
    }
    if (answerSheetFiles.length === 0) {
      return NextResponse.json(
        { error: "No answer sheet files provided" },
        { status: 400 }
      );
    }

    for (const file of [...questionPaperFiles, ...answerSheetFiles]) {
      if (!ALLOWED_TYPES.has(file.type)) {
        return NextResponse.json(
          {
            error: `Invalid file type: ${file.type}. Allowed: PDF, PNG, JPG, GIF, BMP, TIFF`,
          },
          { status: 400 }
        );
      }
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File ${file.name} exceeds 10 MB limit` },
          { status: 400 }
        );
      }
    }

    stage = "converting question paper pages";
    const questionPaperImages = await filesToAnalysisImages(questionPaperFiles);

    stage = "converting answer sheet pages";
    const answerSheetImages = await filesToAnalysisImages(answerSheetFiles);

    stage = "extracting questions";
    console.log("Extracting questions...");
    const questions = await extractQuestions(questionPaperImages);

    stage = "extracting answers";
    console.log("Extracting answers...");
    const answerBlocks = await extractAnswers(answerSheetImages);

    stage = "mapping and evaluating answers";
    console.log("Mapping answers...");
    const mappings = await mapAnswers(questions, answerBlocks);

    const matchedAnswerIds = new Set(mappings.flatMap((m) => m.answerBlockIds));
    const unmatchedAnswers = answerBlocks
      .filter((b) => !matchedAnswerIds.has(b.id))
      .map((b) => ({ answerBlockId: b.id, reason: "No matching question found" }));

    const questionPaperImageUrls = questionPaperImages.map(
      (img) => `data:${img.mimeType};base64,${img.data}`
    );
    const answerSheetImageUrls = answerSheetImages.map(
      (img) => `data:${img.mimeType};base64,${img.data}`
    );

    return NextResponse.json({
      status: "completed",
      questionPaperImages: questionPaperImageUrls,
      answerSheetImages: answerSheetImageUrls,
      questions,
      answerBlocks,
      mappings,
      unmatchedAnswers,
    });
  } catch (error) {
    console.error("Processing error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed during ${stage}: ${message}` },
      { status: 500 }
    );
  }
}

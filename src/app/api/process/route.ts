import { NextRequest, NextResponse } from "next/server";
import { sessions } from "@/lib/session-store";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini
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
}

async function fileToGenerativePart(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());
  return {
    inlineData: {
      mimeType: file.type,
      data: buffer.toString("base64"),
    },
  };
}

async function extractQuestions(images: { data: string; mimeType: string }[]): Promise<Question[]> {
  const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });

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
- Preserve original question numbering exactly as printed
- Sub-parts like 11(a), 11(b) should be separate entries with subPart field
- bbox should be normalized coordinates [x, y, width, height] in range 0-1 relative to page dimensions
- If no bbox is visible, use approximate coordinates
- Include ALL questions, don't skip any
- Return ONLY the JSON array, nothing else`;

  const imageParts = images.map((img) => ({
    inlineData: {
      mimeType: img.mimeType,
      data: img.data,
    },
  }));

  const result = await model.generateContent([prompt, ...imageParts]);
  const response = result.response;
  const text = response.text();

  // Clean the response - remove markdown code blocks if present
  let cleaned = text.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.slice(7);
  }
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.slice(0, -3);
  }
  cleaned = cleaned.trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    console.error("Failed to parse questions JSON:", cleaned);
    return [];
  }
}

async function extractAnswers(images: { data: string; mimeType: string }[]): Promise<AnswerBlock[]> {
  const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });

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
- Transcribe the handwritten text as accurately as possible
- bbox should be normalized coordinates [x, y, width, height] in range 0-1
- If an answer spans multiple pages, include multiple page entries
- Group related content as one answer block
- Return ONLY the JSON array, nothing else`;

  const imageParts = images.map((img) => ({
    inlineData: {
      mimeType: img.mimeType,
      data: img.data,
    },
  }));

  const result = await model.generateContent([prompt, ...imageParts]);
  const response = result.response;
  const text = response.text();

  let cleaned = text.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.slice(7);
  }
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.slice(0, -3);
  }
  cleaned = cleaned.trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    console.error("Failed to parse answers JSON:", cleaned);
    return [];
  }
}

async function mapAnswers(
  questions: Question[],
  answerBlocks: AnswerBlock[]
): Promise<Mapping[]> {
  const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });

  const questionsJson = JSON.stringify(questions.map((q) => ({ id: q.id, number: q.number, subPart: q.subPart, text: q.text })));
  const answersJson = JSON.stringify(answerBlocks.map((a) => ({ id: a.id, detectedLabel: a.detectedLabel, text: a.text })));

  const prompt = `You are an answer-to-question mapper. Match each answer to the correct question.

Questions: ${questionsJson}

Answers: ${answersJson}

Return ONLY a valid JSON array (no markdown, no explanation) with this exact structure:
[
  {
    "questionId": "q1",
    "answerBlockIds": ["a1"],
    "matchConfidence": 0.95,
    "matchMethod": "label"
  }
]

Rules:
- Match by explicit label first (e.g., "Q1" matches question number "1")
- Fall back to semantic/content similarity for unlabeled answers
- Questions with no matching answer should have answerBlockIds: []
- Answer blocks with no matching question should NOT be included
- matchConfidence: 0.0 to 1.0
- matchMethod: "label" | "semantic" | "none"
- Return ONLY the JSON array, nothing else`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();

  let cleaned = text.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.slice(7);
  }
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.slice(0, -3);
  }
  cleaned = cleaned.trim();

  try {
    const mappings = JSON.parse(cleaned) as Mapping[];

    // Add unanswered questions
    const mappedIds = new Set(mappings.map((m) => m.questionId));
    for (const q of questions) {
      if (!mappedIds.has(q.id)) {
        mappings.push({
          questionId: q.id,
          answerBlockIds: [],
          matchConfidence: 0,
          matchMethod: "none",
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
    }));
  }
}

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    const session = sessions.get(sessionId);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    session.status = "processing";

    // Convert files to base64 for Gemini
    const questionPaperImages = await Promise.all(
      session.questionPaperFiles.map(async (file) => {
        const buffer = Buffer.from(await file.arrayBuffer());
        return {
          data: buffer.toString("base64"),
          mimeType: file.type,
        };
      })
    );

    const answerSheetImages = await Promise.all(
      session.answerSheetFiles.map(async (file) => {
        const buffer = Buffer.from(await file.arrayBuffer());
        return {
          data: buffer.toString("base64"),
          mimeType: file.type,
        };
      })
    );

    // Step 1: Extract questions
    console.log("Extracting questions...");
    const questions = await extractQuestions(questionPaperImages);

    // Step 2: Extract answers
    console.log("Extracting answers...");
    const answerBlocks = await extractAnswers(answerSheetImages);

    // Step 3: Map answers to questions
    console.log("Mapping answers...");
    const mappings = await mapAnswers(questions, answerBlocks);

    // Find unmatched answers
    const matchedAnswerIds = new Set(mappings.flatMap((m) => m.answerBlockIds));
    const unmatchedAnswers = answerBlocks
      .filter((b) => !matchedAnswerIds.has(b.id))
      .map((b) => ({
        answerBlockId: b.id,
        reason: "No matching question found",
      }));

    // Create image URLs for the client
    const questionPaperImageUrls = session.questionPaperFiles.map((file) =>
      URL.createObjectURL(file)
    );
    const answerSheetImageUrls = session.answerSheetFiles.map((file) =>
      URL.createObjectURL(file)
    );

    session.status = "completed";

    return NextResponse.json({
      sessionId,
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
    return NextResponse.json(
      { error: `Failed to process documents: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 }
    );
  }
}
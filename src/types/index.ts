export interface Question {
  id: string;
  number: string;
  subPart?: string;
  text: string;
  page: number;
  bbox: [number, number, number, number]; // normalized x, y, w, h
}

export interface AnswerBlock {
  id: string;
  detectedLabel?: string;
  text: string;
  pages: {
    page: number;
    bbox: [number, number, number, number];
  }[];
}

export interface Mapping {
  questionId: string;
  answerBlockIds: string[];
  matchConfidence: number;
  matchMethod: "label" | "semantic" | "manual" | "none";
  marksAwarded?: number;
  maxMarks?: number;
  isCorrect?: boolean;
  feedback?: string;
}

export interface UnmatchedAnswer {
  answerBlockId: string;
  reason: string;
}

export interface SessionData {
  id: string;
  questionPaperImages: string[]; // base64 or blob URLs
  answerSheetImages: string[];
  questions: Question[];
  answerBlocks: AnswerBlock[];
  mappings: Mapping[];
  unmatchedAnswers: UnmatchedAnswer[];
  status: "uploading" | "processing" | "extracting_questions" | "extracting_answers" | "mapping" | "completed" | "error";
  progress: number;
  error?: string;
}

export interface ProcessingStage {
  stage: "uploading" | "extracting_questions" | "extracting_answers" | "mapping" | "completed";
  label: string;
  status: "pending" | "in_progress" | "completed" | "error";
}
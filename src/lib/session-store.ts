// In-memory session store
export const sessions = new Map<string, {
  id: string;
  questionPaperFiles: File[];
  answerSheetFiles: File[];
  status: string;
  createdAt: Date;
}>();
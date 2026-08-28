"use client";

import { useState, useCallback } from "react";
import { AppLayout } from "@/components/app-layout";
import { UploadScreen } from "@/components/upload-screen";
import { ProcessingScreen } from "@/components/processing-screen";
import { ReviewScreen } from "@/components/review-screen";
import { SessionData } from "@/types";
import { filesToImages } from "@/lib/pdf-utils";

type AppScreen = "upload" | "processing" | "review";

async function readApiError(response: Response, fallback: string): Promise<Error> {
  const body = await response.text();
  if (!body) {
    return new Error(`${fallback} (HTTP ${response.status})`);
  }

  try {
    const parsed = JSON.parse(body) as { error?: string };
    return new Error(parsed.error || `${fallback} (HTTP ${response.status})`);
  } catch {
    return new Error(`${fallback} (HTTP ${response.status}): ${body.slice(0, 160)}`);
  }
}

export default function Home() {
  const [screen, setScreen] = useState<AppScreen>("upload");
  const [session, setSession] = useState<SessionData | null>(null);
  const [processingStage, setProcessingStage] = useState("uploading");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFilesReady = useCallback(async (questionPaper: File[], answerSheet: File[]) => {
    setScreen("processing");
    setProcessingStage("uploading");
    setProgress(10);
    setError(null);

    try {
      // Convert PDFs/images to base64 data URLs in the browser where pdfjs
      // has a real canvas — this avoids any server-side PDF rendering entirely.
      setProcessingStage("uploading");
      setProgress(15);
      const questionPaperImages = await filesToImages(questionPaper, 1200);

      setProgress(25);
      const answerSheetImages = await filesToImages(answerSheet, 1200);

      setProcessingStage("extracting_questions");
      setProgress(35);

      const processResponse = await fetch("/api/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionPaperImages, answerSheetImages }),
      });

      if (!processResponse.ok) {
        throw await readApiError(processResponse, "Failed to process documents");
      }

      setProcessingStage("completed");
      setProgress(100);

      const result = await processResponse.json();
      setSession(result);

      await new Promise((resolve) => setTimeout(resolve, 500));
      setScreen("review");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to connect to the processing server.";
      console.error("Processing failed:", err);
      setError(message === "Failed to fetch" ? "Unable to connect to the server. Please try again." : message);
      setScreen("upload");
    }
  }, []);

  const handleBack = useCallback(() => {
    setScreen("upload");
    setSession(null);
    setProgress(0);
    setError(null);
  }, []);

  return (
    <AppLayout
      key={screen}
      showBack
      hideBackOnMobile={screen === "processing"}
      onBack={handleBack}
      showSidebar
      defaultSidebarCollapsed={screen !== "upload"}
    >
      {screen === "upload" && (
        <UploadScreen onFilesReady={handleFilesReady} error={error} />
      )}
      {screen === "processing" && (
        <ProcessingScreen currentStage={processingStage} progress={progress} />
      )}
      {screen === "review" && session && (
        <ReviewScreen session={session} onBack={handleBack} />
      )}
    </AppLayout>
  );
}
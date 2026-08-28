"use client";

import { useState, useCallback } from "react";
import { AppLayout } from "@/components/app-layout";
import { UploadScreen } from "@/components/upload-screen";
import { ProcessingScreen } from "@/components/processing-screen";
import { ReviewScreen } from "@/components/review-screen";
import { SessionData } from "@/types";

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
      // Single request: send files directly to /api/process
      const formData = new FormData();
      questionPaper.forEach((file) => formData.append("questionPaper", file));
      answerSheet.forEach((file) => formData.append("answerSheet", file));

      setProcessingStage("extracting_questions");
      setProgress(30);

      const processResponse = await fetch("/api/process", {
        method: "POST",
        body: formData,
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
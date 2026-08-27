"use client";

import { useState, useCallback } from "react";
import { AppLayout } from "@/components/app-layout";
import { UploadScreen } from "@/components/upload-screen";
import { ProcessingScreen } from "@/components/processing-screen";
import { ReviewScreen } from "@/components/review-screen";
import { SessionData } from "@/types";

type AppScreen = "upload" | "processing" | "review";

export default function Home() {
  const [screen, setScreen] = useState<AppScreen>("upload");
  const [session, setSession] = useState<SessionData | null>(null);
  const [processingStage, setProcessingStage] = useState("uploading");
  const [progress, setProgress] = useState(0);

  const handleFilesReady = useCallback(async (questionPaper: File[], answerSheet: File[]) => {
    setScreen("processing");
    setProcessingStage("uploading");
    setProgress(10);

    try {
      // Step 1: Upload files
      const formData = new FormData();
      questionPaper.forEach((file) => formData.append("questionPaper", file));
      answerSheet.forEach((file) => formData.append("answerSheet", file));

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        const uploadError = await uploadResponse.json();
        throw new Error(uploadError.error || "Failed to upload files");
      }

      const { sessionId } = await uploadResponse.json();
      setProcessingStage("extracting_questions");
      setProgress(30);

      // Step 2: Process documents
      const processResponse = await fetch("/api/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      if (!processResponse.ok) {
        const processError = await processResponse.json();
        throw new Error(processError.error || "Failed to process documents");
      }

      setProcessingStage("completed");
      setProgress(100);

      const result = await processResponse.json();
      setSession(result);

      await new Promise((resolve) => setTimeout(resolve, 500));
      setScreen("review");
    } catch (err) {
      console.error("Processing failed:", err);
      setScreen("upload");
    }
  }, []);

  const handleBack = useCallback(() => {
    setScreen("upload");
    setSession(null);
    setProgress(0);
  }, []);

  return (
    <AppLayout
      showBack={screen === "review"}
      onBack={handleBack}
      showSidebar={screen !== "processing"}
    >
      {screen === "upload" && (
        <UploadScreen onFilesReady={handleFilesReady} />
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
import { NextRequest, NextResponse } from "next/server";
import { sessions } from "@/lib/session-store";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Extract files
    const questionPaperFiles: File[] = [];
    const answerSheetFiles: File[] = [];
    
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        if (key === "questionPaper") {
          questionPaperFiles.push(value);
        } else if (key === "answerSheet") {
          answerSheetFiles.push(value);
        }
      }
    }

    // Validate files
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

    // Validate file types
    const allowedTypes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/gif",
      "image/bmp",
      "image/tiff",
    ];

    const allFiles = [...questionPaperFiles, ...answerSheetFiles];
    for (const file of allFiles) {
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: `Invalid file type: ${file.type}. Allowed: PDF, PNG, JPG, GIF, BMP, TIFF` },
          { status: 400 }
        );
      }

      // Check file size (max 10MB per file)
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: `File ${file.name} exceeds 10MB limit` },
          { status: 400 }
        );
      }
    }

    // Generate session ID
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Store in memory
    sessions.set(sessionId, {
      id: sessionId,
      questionPaperFiles,
      answerSheetFiles,
      status: "uploaded",
      createdAt: new Date(),
    });

    return NextResponse.json({
      sessionId,
      status: "uploaded",
      message: "Files uploaded successfully",
      questionPaperCount: questionPaperFiles.length,
      answerSheetCount: answerSheetFiles.length,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload files" },
      { status: 500 }
    );
  }
}


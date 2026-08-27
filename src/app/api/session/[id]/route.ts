import { NextRequest, NextResponse } from "next/server";
import { sessions } from "@/lib/session-store";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = sessions.get(id);

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: session.id,
      status: session.status,
      questionPaperCount: session.questionPaperFiles.length,
      answerSheetCount: session.answerSheetFiles.length,
      createdAt: session.createdAt,
    });
  } catch (error) {
    console.error("Session fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch session" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!sessions.has(id)) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    sessions.delete(id);

    return NextResponse.json({
      message: "Session deleted successfully",
    });
  } catch (error) {
    console.error("Session delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete session" },
      { status: 500 }
    );
  }
}
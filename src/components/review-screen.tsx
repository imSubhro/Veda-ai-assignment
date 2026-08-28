"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, ZoomIn, ZoomOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Question, SessionData } from "@/types";

interface ReviewScreenProps {
  session: SessionData;
  onBack?: () => void;
}

export function ReviewScreen({ session, onBack: _onBack }: ReviewScreenProps) {
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<"questions" | "answerSheet">("questions");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const questions = useMemo(() => session.questions || [], [session.questions]);
  const answerBlocks = useMemo(() => session.answerBlocks || [], [session.answerBlocks]);
  const mappings = useMemo(() => session.mappings || [], [session.mappings]);

  const selectedMapping = selectedQuestionId
    ? mappings.find((m) => m.questionId === selectedQuestionId)
    : null;

  const selectedAnswerBlocks = useMemo(() => {
    return selectedMapping
      ? answerBlocks.filter((b) => selectedMapping.answerBlockIds.includes(b.id))
      : [];
  }, [selectedMapping, answerBlocks]);

  const drawHighlights = useCallback(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    selectedAnswerBlocks.forEach((block) => {
      block.pages.forEach((pageData) => {
        if (pageData.page === currentPage) {
          const [x, y, w, h] = pageData.bbox;
          const rectX = x * canvas.width;
          const rectY = y * canvas.height;
          const rectW = w * canvas.width;
          const rectH = h * canvas.height;

          // Green highlight
          ctx.fillStyle = "rgba(144, 238, 144, 0.35)";
          ctx.strokeStyle = "rgba(34, 197, 94, 0.9)";
          ctx.lineWidth = 4;

          const radius = 12;
          ctx.beginPath();
          ctx.roundRect(rectX, rectY, rectW, rectH, radius);
          ctx.fill();
          ctx.stroke();

          // Green label
          ctx.fillStyle = "#22c55e";
          ctx.font = "bold 28px sans-serif";
          ctx.fillText(`Q${block.detectedLabel || "?"}`, rectX + 10, rectY - 12);
        }
      });
    });
  }, [selectedAnswerBlocks, currentPage]);

  useEffect(() => {
    drawHighlights();
  }, [drawHighlights]);

  const handleQuestionClick = (questionId: string) => {
    setSelectedQuestionId(questionId);
    setActiveTab("answerSheet");

    const mapping = mappings.find((m) => m.questionId === questionId);
    if (mapping && mapping.answerBlockIds.length > 0) {
      const firstAnswerBlock = answerBlocks.find((b) => mapping.answerBlockIds.includes(b.id));
      if (firstAnswerBlock && firstAnswerBlock.pages.length > 0) {
        setCurrentPage(firstAnswerBlock.pages[0].page);
      }
    }
  };

  const toggleExpand = (questionId: string) => {
    setExpandedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedQuestions(new Set(questions.map((q) => q.id)));
  };

  const getScoreInfo = (question: Question) => {
    const mapping = mappings.find((m) => m.questionId === question.id);
    if (!mapping || mapping.answerBlockIds.length === 0) {
      return { score: "0/2", color: "text-[#ff5722]", bg: "bg-[#ff5722]/10", feedback: "Not answered." };
    }
    const marksAwarded = mapping.marksAwarded ?? (mapping.isCorrect ? 2 : 0);
    const maxMarks = mapping.maxMarks ?? 2;
    const isCorrect = mapping.isCorrect ?? mapping.matchConfidence >= 0.8;
    return {
      score: `${marksAwarded}/${maxMarks}`,
      color: isCorrect ? "text-green-600" : "text-[#ff5722]",
      bg: isCorrect ? "bg-green-50" : "bg-[#ff5722]/10",
      feedback: mapping.feedback || (isCorrect ? "Answer appears correct." : "Review this answer carefully."),
    };
  };

  const totalPages = session.answerSheetImages?.length || 1;

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-56px)]">
      {/* Mobile Tab Bar - shown at top on mobile */}
      <div className="flex lg:hidden px-3 py-3 bg-[#e8e8e8]">
        <div className="flex w-full h-[54px] bg-white rounded-full p-1 border border-gray-200 shadow-sm">
          <button
            className={cn(
              "flex-1 py-2.5 text-[14px] font-medium rounded-full transition-all",
              activeTab === "questions" ? "bg-gray-900 text-white" : "text-gray-500"
            )}
            onClick={() => setActiveTab("questions")}
          >
            Questions
          </button>
          <button
            className={cn(
              "flex-1 py-2.5 text-[14px] font-medium rounded-full transition-all",
              activeTab === "answerSheet" ? "bg-gray-900 text-white" : "text-gray-500"
            )}
            onClick={() => setActiveTab("answerSheet")}
          >
            Answer Sheet
          </button>
        </div>
      </div>

      {/* Questions Panel */}
      <div className={cn(
        "w-full lg:w-[672px] xl:w-[672px] flex flex-col bg-[#e8e8e8] lg:bg-white lg:border-r border-gray-100",
        activeTab === "answerSheet" && "hidden lg:flex"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200 lg:border-gray-100">
          <h2 className="text-[14px] font-semibold text-gray-900 tracking-tight">
            Extracted Questions (from question paper)
          </h2>
          <button
            onClick={expandAll}
            className="bg-white rounded-full px-5 py-3 text-[14px] font-medium text-gray-900 hover:bg-gray-50 transition-colors"
          >
            Expand All
          </button>
        </div>

        {/* Questions List */}
        <div className="flex-1 overflow-y-auto px-[10px] py-3 space-y-3">
          {questions.map((question) => {
            const scoreInfo = getScoreInfo(question);
            const isExpanded = expandedQuestions.has(question.id);
            const isSelected = selectedQuestionId === question.id;

            return (
              <div
                key={question.id}
                className={cn(
                  "rounded-[17px] transition-all",
                  isExpanded
                    ? "bg-white lg:border-2 lg:border-[#ff7a2f]"
                    : isSelected
                      ? "bg-white"
                      : "bg-white hover:bg-gray-50"
                )}
              >
                {/* Question Row */}
                <div
                  onClick={() => handleQuestionClick(question.id)}
                  className="flex items-start gap-2.5 px-3 py-3 cursor-pointer"
                >
                  {/* Number Circle */}
                  <div className="w-8 h-8 bg-[#626262] text-white rounded-full flex items-center justify-center text-[15px] font-bold shrink-0 mt-0.5 shadow-[inset_0_0_0_2px_#8a8a8a,0_2px_4px_rgba(0,0,0,0.16)]">
                    {question.number}
                  </div>

                  {/* Sub-part */}
                  {question.subPart && (
                    <span className="text-[13px] font-semibold text-gray-700 mt-1">
                      {question.subPart}.
                    </span>
                  )}

                  {/* Question Text */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-gray-600 leading-relaxed">
                      {question.text}
                    </p>
                  </div>

                  {/* Score + Arrow */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={cn("text-[14px] font-bold px-3 py-1 rounded-full", scoreInfo.color, scoreInfo.bg)}>
                      {scoreInfo.score}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(question.id);
                      }}
                      className="p-0.5 hover:bg-gray-100 rounded"
                    >
                      {isExpanded ? (
                        <ChevronUp size={15} className="text-gray-400" />
                      ) : (
                        <ChevronDown size={15} className="text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* AI Feedback - Expanded */}
                {isExpanded && (
                  <div className="px-4 pb-3 pt-0">
                    <div className="bg-[#f4f4f4] rounded-[16px] p-3.5 ml-0">
                      <p className="text-[13px] font-bold text-gray-900 mb-1">AI Feedback</p>
                      <p className="text-[13px] text-gray-600 leading-relaxed">
                        {scoreInfo.feedback}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Answer Sheet Panel */}
      <div className={cn(
        "flex-1 flex flex-col bg-[#2a2a2a]",
        activeTab === "questions" && "hidden lg:flex"
      )}>
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-3 mx-4 mt-4 bg-[#333] rounded-t-xl">
          <h2 className="hidden lg:block text-[16px] font-semibold text-white">Answer Sheet</h2>
          <div className="flex items-center bg-[#444] rounded-lg">
            <button
              onClick={() => setZoom((z) => Math.max(50, z - 10))}
              className="p-1.5 hover:bg-[#555] rounded-l-lg"
            >
              <span className="text-white text-[14px] font-bold">−</span>
            </button>
            <span className="text-[12px] font-semibold text-white min-w-[44px] text-center">
              {zoom}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(200, z + 10))}
              className="p-1.5 hover:bg-[#555] rounded-r-lg"
            >
              <span className="text-white text-[14px] font-bold">+</span>
            </button>
          </div>
          <div className="flex items-center bg-[#444] rounded-lg">
            <button
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="p-1.5 hover:bg-[#555] rounded-l-lg disabled:opacity-30"
            >
              <ChevronLeft size={14} className="text-white" />
            </button>
            <span className="text-[12px] font-semibold text-white px-1.5">
              Page {currentPage + 1} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage === totalPages - 1}
              className="p-1.5 hover:bg-[#555] rounded-r-lg disabled:opacity-30"
            >
              <ChevronRight size={14} className="text-white" />
            </button>
          </div>
        </div>

        {/* Answer Sheet Image */}
        <div className="flex-1 overflow-auto px-4 pb-4">
          <div
            className="bg-white rounded-b-xl overflow-hidden shadow-lg"
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}
          >
            {session.answerSheetImages && session.answerSheetImages[currentPage] ? (
              <div className="relative">
                {session.answerSheetImages[currentPage].startsWith("data:application/pdf") ? (
                  <iframe
                    src={session.answerSheetImages[currentPage]}
                    className="w-full h-[800px] border-0"
                    title={`Answer sheet page ${currentPage + 1}`}
                  />
                ) : (
                  <>
                    <img
                      ref={imageRef}
                      src={session.answerSheetImages[currentPage]}
                      alt={`Answer sheet page ${currentPage + 1}`}
                      className="w-full h-auto"
                      onLoad={drawHighlights}
                    />
                    <canvas
                      ref={canvasRef}
                      className="absolute inset-0 w-full h-full pointer-events-none"
                    />
                  </>
                )}
              </div>
            ) : (
              <div className="w-full h-96 flex items-center justify-center bg-gray-50">
                <p className="text-gray-400 text-[14px]">No image available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
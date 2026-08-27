"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface UploadZoneProps {
  titleHighlight: string;
  onDrop: (files: File[]) => void;
  files: File[];
  onRemove: (index: number) => void;
}

function UploadZone({ titleHighlight, onDrop, files, onRemove }: UploadZoneProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/*": [".png", ".jpg", ".jpeg"],
    },
    multiple: true,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border border-dashed border-gray-200 rounded-2xl p-6 text-center cursor-pointer transition-all duration-200",
        "hover:border-orange-300 hover:bg-orange-50/20",
        isDragActive && "border-orange-400 bg-orange-50",
        files.length > 0 && "border-gray-200 bg-gray-50/30"
      )}
    >
      <input {...getInputProps()} />
      {files.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-6">
          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
            <Upload className="w-5 h-5 text-gray-400" strokeWidth={2} />
          </div>
          <div>
            <p className="text-[15px] font-semibold text-gray-900">
              Upload <span className="text-[#ff5722]">{titleHighlight}</span>
            </p>
            <p className="text-[13px] text-gray-400 mt-0.5">Max 10MB</p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100"
            >
              <div className="w-10 h-10 bg-[#ff5722]/10 rounded-lg flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-[#ff5722]" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-[14px] font-semibold text-gray-900 truncate">{file.name}</p>
                <p className="text-[12px] text-gray-400">
                  {(file.size / 1024 / 1024).toFixed(0)}MB • {Math.max(1, Math.ceil(file.size / 1024 / 100))} Pages
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(index);
                }}
                className="w-7 h-7 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center shrink-0 transition-colors"
              >
                <X className="w-3.5 h-3.5 text-gray-500" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface UploadScreenProps {
  onFilesReady: (questionPaper: File[], answerSheet: File[]) => void;
}

export function UploadScreen({ onFilesReady }: UploadScreenProps) {
  const [questionPaperFiles, setQuestionPaperFiles] = useState<File[]>([]);
  const [answerSheetFiles, setAnswerSheetFiles] = useState<File[]>([]);

  const handleQuestionPaperDrop = useCallback((files: File[]) => {
    setQuestionPaperFiles((prev) => [...prev, ...files]);
  }, []);

  const handleAnswerSheetDrop = useCallback((files: File[]) => {
    setAnswerSheetFiles((prev) => [...prev, ...files]);
  }, []);

  const handleRemoveQuestionPaper = useCallback((index: number) => {
    setQuestionPaperFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleRemoveAnswerSheet = useCallback((index: number) => {
    setAnswerSheetFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleStartMapping = () => {
    if (questionPaperFiles.length > 0 && answerSheetFiles.length > 0) {
      onFilesReady(questionPaperFiles, answerSheetFiles);
    }
  };

  const isReady = questionPaperFiles.length > 0 && answerSheetFiles.length > 0;

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center p-6 lg:p-10">
      <div className="w-full max-w-[750px] space-y-5 lg:space-y-6">
        {/* Title */}
        <div className="space-y-1 text-center lg:text-left">
          <h1 className="text-[26px] sm:text-[32px] lg:text-[40px] font-bold text-gray-900 leading-tight whitespace-nowrap">
            Upload{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-[#ff5722]">Question Paper & Answer Sheets</span>
              <span className="absolute inset-0 bg-[#ff5722]/8 rounded-md" />
            </span>
          </h1>
          <p className="text-[14px] lg:text-[15px] text-gray-500 text-center">Upload both files to get started</p>
        </div>

        {/* Model Image */}
        <div className="flex justify-center">
          <div className="relative w-[120px] h-[120px]">
            {/* Outer ring */}
            <div className="absolute inset-0 rounded-full border-[1.5px] border-[#ff5722]/20" />
            {/* Middle ring */}
            <div className="absolute inset-3 rounded-full border border-[#ff5722]/15" />
            {/* Inner circle with image */}
            <div className="absolute inset-5 rounded-full overflow-hidden bg-[#ffecd2]">
              <Image
                src="/model.png"
                alt="AI Assistant"
                fill
                className="object-cover"
              />
            </div>
            {/* Floating icons */}
            <div className="absolute -top-0.5 right-2 w-5 h-5 bg-[#ff5722] rounded-full flex items-center justify-center shadow-sm">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M13 2L3 14h9l-1 10 10-12h-9l1-10z"/></svg>
            </div>
            <div className="absolute top-1/2 -left-2 w-5 h-5 bg-[#ff5722] rounded-full flex items-center justify-center shadow-sm">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <div className="absolute bottom-1 left-1/4 w-4 h-4 bg-[#ff8a65] rounded-full flex items-center justify-center shadow-sm">
              <svg width="8" height="8" viewBox="0 0 24 24" fill="white"><path d="M5 13l4 4L19 7"/></svg>
            </div>
          </div>
        </div>

        {/* Upload Zones Container */}
        <div className="border border-dashed border-gray-200 rounded-2xl p-3 bg-white/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <UploadZone
              titleHighlight="Question Paper"
              onDrop={handleQuestionPaperDrop}
              files={questionPaperFiles}
              onRemove={handleRemoveQuestionPaper}
            />
            <UploadZone
              titleHighlight="Answer Sheet"
              onDrop={handleAnswerSheetDrop}
              files={answerSheetFiles}
              onRemove={handleRemoveAnswerSheet}
            />
          </div>
        </div>

        {/* Start Button */}
        <div className="flex flex-col items-center gap-3 pt-2">
          <Button
            size="lg"
            className={cn(
              "px-8 py-5 h-12 text-[15px] font-semibold rounded-full transition-all",
              isReady
                ? "bg-gray-900 hover:bg-gray-800 text-white"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            )}
            disabled={!isReady}
            onClick={handleStartMapping}
          >
            Start Mapping
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <p className="text-[13px] text-gray-400">
            Once both files are uploaded, you&apos;ll able to map answers with questions
          </p>
        </div>
      </div>
    </div>
  );
}

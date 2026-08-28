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
        "border border-dashed border-gray-300 rounded-2xl p-6 text-center cursor-pointer transition-all duration-200",
        "hover:border-[#ff5722]/50 hover:bg-[#ff5722]/5",
        isDragActive && "border-[#ff5722] bg-[#ff5722]/5",
        files.length > 0 && "bg-gray-50/50"
      )}
    >
      <input {...getInputProps()} />
      {files.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-4">
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
                className="w-7 h-7 bg-gray-800 hover:bg-gray-900 rounded-full flex items-center justify-center shrink-0 transition-colors"
              >
                <X className="w-3.5 h-3.5 text-white" />
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
    <div className="min-h-[calc(100vh-60px)] flex items-center justify-center p-5 lg:p-10">
      <div className="w-full max-w-[700px] space-y-5 lg:space-y-6">
        {/* Title */}
        <div className="space-y-1 text-center">
          <h1 className="text-[26px] sm:text-[32px] lg:text-[40px] font-bold text-gray-900 leading-tight">
            Upload{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-[#ff5722]">Question Paper & Answer Sheets</span>
              <span className="absolute inset-0 bg-[#ff5722]/8 rounded-md" />
            </span>
          </h1>
          <p className="text-[14px] lg:text-[15px] text-gray-500">Upload both files to get started</p>
        </div>

        {/* Model Image */}
        <div className="flex justify-center">
          <div className="relative w-[110px] h-[110px] lg:w-[130px] lg:h-[130px]">
            <div className="w-full h-full rounded-full overflow-hidden bg-[#ffecd2]">
              <Image
                src="/model.png"
                alt="AI Assistant"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>

        {/* Upload Zones Container */}
        <div className="border border-dashed border-gray-300 rounded-2xl p-3">
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
        <div className="flex flex-col items-center gap-3 pt-1">
          <Button
            size="lg"
            className={cn(
              "px-8 h-12 text-[15px] font-semibold rounded-full transition-all",
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
          <p className="text-[13px] text-gray-400 text-center">
            Once both files are uploaded, you&apos;ll able to map answers with questions
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import Image from "next/image";

interface ProcessingScreenProps {
  currentStage: string;
  progress: number;
}

export function ProcessingScreen({ currentStage: _currentStage, progress: _progress }: ProcessingScreenProps) {
  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center p-6">
      <div className="w-full max-w-[400px]">
        <div className="bg-white rounded-[20px] p-12 lg:p-16 text-center">
          {/* Sparkle Image */}
          <div className="flex justify-center mb-10">
            <div className="relative w-[140px] h-[140px]">
              <Image
                src="/Container.png"
                alt="Processing"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* Text */}
          <h2 className="text-[22px] font-bold text-gray-900 mb-1.5">Extracting...</h2>
          <p className="text-[14px] text-gray-400">This may take a while</p>
        </div>
      </div>
    </div>
  );
}

"use client";

import Image from "next/image";

interface ProcessingScreenProps {
  currentStage: string;
  progress: number;
}

export function ProcessingScreen({ currentStage: _currentStage, progress: _progress }: ProcessingScreenProps) {
  return (
    <div className="min-h-full flex items-center justify-center p-[10px] pt-3 sm:p-6 lg:p-3">
      <div className="w-full max-w-[400px] h-[calc(100vh-90px)] max-h-[642px] lg:max-w-none lg:h-full lg:max-h-none">
        <div className="h-full bg-white rounded-[22px] p-10 lg:p-16 lg:rounded-[24px] text-center flex flex-col items-center justify-center">
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

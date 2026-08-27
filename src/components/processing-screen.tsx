"use client";

interface ProcessingScreenProps {
  currentStage: string;
  progress: number;
}

export function ProcessingScreen({ currentStage: _currentStage, progress: _progress }: ProcessingScreenProps) {
  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center p-6">
      <div className="w-full max-w-[400px]">
        <div className="bg-white rounded-[20px] p-12 lg:p-16 text-center">
          {/* Sparkle Animation */}
          <div className="flex justify-center mb-10">
            <div className="relative w-28 h-28">
              {/* Main 4-pointed star */}
              <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" width="64" height="64" viewBox="0 0 64 64" fill="none">
                <path d="M32 0C32 0 36 28 32 32C28 28 32 0 32 0Z" fill="#FF5722"/>
                <path d="M64 32C64 32 36 36 32 32C36 28 64 32 64 32Z" fill="#FF5722"/>
                <path d="M32 64C32 64 28 36 32 32C36 36 32 64 32 64Z" fill="#FF5722"/>
                <path d="M0 32C0 32 28 28 32 32C28 36 0 32 0 32Z" fill="#FF5722"/>
                <circle cx="32" cy="32" r="6" fill="#FF5722"/>
              </svg>
              {/* Small star top-right */}
              <svg className="absolute -top-1 -right-2" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 0C12 0 14 10 12 12C10 10 12 0 12 0Z" fill="#FF8A65"/>
                <path d="M24 12C24 12 14 14 12 12C14 10 24 12 24 12Z" fill="#FF8A65"/>
                <path d="M12 24C12 24 10 14 12 12C14 14 12 24 12 24Z" fill="#FF8A65"/>
                <path d="M0 12C0 12 10 10 12 12C10 14 0 12 0 12Z" fill="#FF8A65"/>
                <circle cx="12" cy="12" r="2.5" fill="#FF8A65"/>
              </svg>
              {/* Small star bottom-left */}
              <svg className="absolute bottom-0 -left-3" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 0C10 0 12 8 10 10C8 8 10 0 10 0Z" fill="#FFAB91"/>
                <path d="M20 10C20 10 12 12 10 10C12 8 20 10 20 10Z" fill="#FFAB91"/>
                <path d="M10 20C10 20 8 12 10 10C12 12 10 20 10 20Z" fill="#FFAB91"/>
                <path d="M0 10C0 10 8 8 10 10C8 12 0 10 0 10Z" fill="#FFAB91"/>
                <circle cx="10" cy="10" r="2" fill="#FFAB91"/>
              </svg>
              {/* Dot */}
              <div className="absolute top-3 left-4 w-2.5 h-2.5 bg-[#FFAB91] rounded-full" />
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
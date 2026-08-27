"use client";

import { ArrowLeft, HelpCircle, Bell, Sparkles, Menu, FileText, ChevronDown } from "lucide-react";
import Image from "next/image";

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  onMenuToggle?: () => void;
}

export function Header({ title = "Exams", showBack = true, onBack, onMenuToggle }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 lg:px-6 h-[60px] border-b-[1.5px] border-gray-200 bg-white shrink-0">
      {/* Left */}
      <div className="flex items-center gap-3">
        {showBack && (
          <button
            onClick={onBack}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
        )}
        {/* Mobile: Logo */}
        <div className="flex items-center gap-2 lg:hidden">
          <div className="w-8 h-8 bg-[#1a1a1a] rounded-[10px] flex items-center justify-center shrink-0 overflow-hidden">
            <Image src="/logo.png" alt="VedaAI" width={20} height={20} className="object-contain" />
          </div>
          <span className="font-bold text-[17px] text-gray-900">VedaAI</span>
        </div>
        {/* Desktop: Breadcrumb */}
        <div className="hidden lg:flex items-center gap-2 text-gray-500">
          <FileText size={16} strokeWidth={1.8} />
          <span className="text-[14px] font-medium">{title}</span>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1">
        {/* Desktop only icons */}
        <button className="hidden lg:block p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <HelpCircle size={20} className="text-gray-500" strokeWidth={1.8} />
        </button>
        <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell size={20} className="text-gray-600" strokeWidth={1.8} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ff5722] rounded-full" />
        </button>
        <button className="hidden lg:block p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Sparkles size={20} className="text-gray-500" strokeWidth={1.8} />
        </button>
        {/* User */}
        <div className="hidden lg:flex items-center gap-2 pl-3 ml-1 border-l border-gray-200">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center text-white text-[13px] font-semibold">
            M
          </div>
          <span className="text-[14px] font-medium text-gray-700">Madhur Rastogi</span>
          <ChevronDown size={14} className="text-gray-400" />
        </div>
        {/* Mobile: Avatar + Hamburger */}
        <div className="flex lg:hidden items-center gap-1.5">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
          <button
            onClick={onMenuToggle}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu size={22} className="text-gray-700" />
          </button>
        </div>
      </div>
    </header>
  );
}

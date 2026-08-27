"use client";

import { 
  BookOpen, ClipboardList, FileText, Library, 
  X, Sparkles, LayoutGrid
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
}

const navItems = [
  { icon: LayoutGrid, label: "Home", active: false },
  { icon: BookOpen, label: "My Classroom", active: false },
  { icon: ClipboardList, label: "Assignments", active: false },
  { icon: FileText, label: "Exams", active: true },
  { icon: Library, label: "My Library", active: false },
];

export function MobileDrawer({ open, onClose }: MobileDrawerProps) {
  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={cn(
          "fixed top-0 left-0 h-full w-[280px] bg-white z-50 lg:hidden transition-transform duration-300 flex flex-col rounded-r-[24px]",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 pb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-[#1a1a1a] rounded-[10px] flex items-center justify-center shrink-0">
              <Image src="/logo.png" alt="VedaAI" width={22} height={22} className="object-contain" />
            </div>
            <span className="text-[18px] font-bold tracking-tight text-gray-900">VedaAI</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* AI Teacher's Toolkit Button */}
        <div className="px-3 py-3">
          <button className="w-full flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#1a1a1a] text-white font-medium text-[13px] border-2 border-[#ff5722] hover:bg-[#2a2a2a] transition-all">
            <Sparkles size={14} className="text-white" />
            <span>AI Teacher&apos;s Toolkit</span>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-0.5">
          {navItems.map((item) => (
            <button
              key={item.label}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-[14px] font-medium transition-colors",
                item.active
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              <item.icon size={18} strokeWidth={1.8} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* School Info */}
        <div className="p-3">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 overflow-hidden bg-green-50 border border-green-200">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-green-600">
                <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M12 22V12" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M22 7L12 12L2 7" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M17 9.5L7 4.5" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-gray-900 truncate">Delhi Public School</p>
              <p className="text-[11px] text-gray-500 truncate">Bokaro Steel City</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

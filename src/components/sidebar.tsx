"use client";

import { 
  Home, BookOpen, ClipboardList, FileText, Library, 
  Settings, ChevronDown, Sparkles, LayoutGrid, PanelLeftClose
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

const navItems = [
  { icon: LayoutGrid, label: "Home", active: false },
  { icon: BookOpen, label: "My Classroom", active: false },
  { icon: ClipboardList, label: "Assignments", active: false },
  { icon: FileText, label: "Exams", active: true },
  { icon: Library, label: "My Library", active: false },
];

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  return (
    <aside
      className={cn(
        "h-full bg-[#1e1e1e] rounded-[20px] lg:rounded-[24px] flex flex-col transition-all duration-300",
        collapsed ? "w-[72px]" : "w-[240px]"
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-4 pb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-white rounded-[10px] flex items-center justify-center shrink-0">
            <Image src="/logo.png" alt="VedaAI" width={22} height={22} className="object-contain" />
          </div>
          {!collapsed && (
            <span className="text-[18px] font-bold tracking-tight text-white">VedaAI</span>
          )}
        </div>
        <button
          onClick={onToggle}
          className="text-gray-500 hover:text-white transition-colors p-1"
        >
          {collapsed ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <line x1="9" y1="3" x2="9" y2="21"/>
            </svg>
          ) : (
            <PanelLeftClose size={16} />
          )}
        </button>
      </div>

      {/* AI Teacher's Toolkit Button */}
      <div className="px-3 py-3">
        <button
          className={cn(
            "w-full flex items-center gap-2 px-4 py-2.5 rounded-full",
            "bg-[#2a2a2a] text-white font-medium text-[13px] border border-[#ff5722]",
            "hover:bg-[#333] transition-all",
            collapsed && "justify-center px-2"
          )}
        >
          <Sparkles size={14} className="text-[#ff5722]" />
          {!collapsed && <span>AI Teacher&apos;s Toolkit</span>}
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
                ? "bg-white text-gray-900"
                : "text-gray-400 hover:text-white hover:bg-white/5",
              collapsed && "justify-center px-2"
            )}
          >
            <item.icon size={18} strokeWidth={1.8} />
            {!collapsed && <span>{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Settings */}
      <div className="px-3 py-2">
        <button
          className={cn(
            "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-[14px] font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors",
            collapsed && "justify-center px-2"
          )}
        >
          <Settings size={18} strokeWidth={1.8} />
          {!collapsed && <span>Settings</span>}
        </button>
      </div>

      {/* School Info */}
      <div className={cn(
        "p-3",
        collapsed && "flex justify-center"
      )}>
        {collapsed ? (
          <div className="w-10 h-10 bg-[#2a2a2a] rounded-xl flex items-center justify-center overflow-hidden">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-green-600">
              <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M12 22V12" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M22 7L12 12L2 7" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </div>
        ) : (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#2a2a2a]">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 overflow-hidden bg-green-800/30">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-green-500">
                <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M12 22V12" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M22 7L12 12L2 7" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M17 9.5L7 4.5" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-white truncate">Delhi Public School</p>
              <p className="text-[11px] text-gray-500 truncate">Bokaro Steel City</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

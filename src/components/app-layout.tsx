"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { MobileDrawer } from "./mobile-drawer";

interface AppLayoutProps {
  children: React.ReactNode;
  showBack?: boolean;
  onBack?: () => void;
  headerTitle?: string;
  showSidebar?: boolean;
}

export function AppLayout({ children, showBack, onBack, headerTitle, showSidebar = true }: AppLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#e0e0e0] overflow-hidden p-2 lg:p-3 gap-2 lg:gap-3">
      {/* Sidebar - Desktop only */}
      {showSidebar && (
        <div className="hidden lg:block shrink-0">
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </div>
      )}

      {/* Main Content - White rounded card */}
      <div className="flex-1 flex flex-col bg-white rounded-[20px] lg:rounded-[24px] overflow-hidden min-w-0">
        <Header
          title={headerTitle}
          showBack={showBack}
          onBack={onBack}
          onMenuToggle={() => setMobileMenuOpen(true)}
        />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      {/* Mobile Drawer */}
      {showSidebar && (
        <MobileDrawer
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}

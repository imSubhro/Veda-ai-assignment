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
  hideBackOnMobile?: boolean;
  defaultSidebarCollapsed?: boolean;
}

export function AppLayout({ children, showBack, onBack, headerTitle, showSidebar = true, hideBackOnMobile = false, defaultSidebarCollapsed = false }: AppLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(defaultSidebarCollapsed);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#e8e8e8] overflow-hidden p-0 lg:p-3 gap-0 lg:gap-3">
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
      <div className="flex-1 flex flex-col bg-[#e8e8e8] rounded-none lg:bg-white lg:rounded-[24px] overflow-hidden min-w-0">
        <Header
          title={headerTitle}
          showBack={showBack}
          hideBackOnMobile={hideBackOnMobile}
          onBack={onBack}
          onMenuToggle={() => setMobileMenuOpen(true)}
        />
        <main className="flex-1 overflow-auto bg-[#e8e8e8]">
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

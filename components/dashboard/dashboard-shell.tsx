"use client";

import * as React from "react";

import { ActiveConnectionProvider } from "@/components/dashboard/active-connection-context";
import { useDashboardActiveConnection } from "@/components/dashboard/active-connection-context";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { cn } from "@/lib/utils";

interface DashboardShellProps {
  children: React.ReactNode;
}

function DashboardShellContent({ children }: DashboardShellProps) {
  const activeConnectionState = useDashboardActiveConnection();
  const isSwitchingDatabase = Boolean(activeConnectionState?.isUpdatingConnection);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  React.useEffect(() => {
    if (!sidebarOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [sidebarOpen]);

  React.useEffect(() => {
    if (!sidebarOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSidebarOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [sidebarOpen]);

  return (
    <div className="relative flex h-[100dvh] min-h-0 flex-col overflow-hidden bg-[var(--background)]">
      <Topbar className="shrink-0" onMenuClick={() => setSidebarOpen(true)} />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <Sidebar className="hidden w-[260px] shrink-0 border-r lg:flex" />

        <main className="flex-1 min-h-0 min-w-0 overflow-y-auto bg-[#fdfaf5] px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
          {children}
        </main>
      </div>

      <div
        className={cn(
          "fixed inset-0 z-40 lg:hidden",
          sidebarOpen ? "pointer-events-auto" : "pointer-events-none"
        )}
        aria-hidden={!sidebarOpen}
      >
        <div
          className={cn(
            "absolute inset-0 bg-black/40 transition-opacity duration-200",
            sidebarOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={() => setSidebarOpen(false)}
        />
        <Sidebar
          className={cn(
            "absolute left-0 top-0 h-full w-[260px] max-w-[85vw] border-r shadow-xl transition-transform duration-200",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
          onNavigate={() => setSidebarOpen(false)}
        />
      </div>

      {isSwitchingDatabase ? (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#fdfaf5]/70 backdrop-blur-[1px]">
          <div className="flex items-center gap-3 rounded-lg border border-[#e4d2ad] bg-[#fffaf0] px-4 py-3 text-sm font-medium text-[#5f513a] shadow">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#d8b06b] border-t-transparent" />
            Switching database...
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <ActiveConnectionProvider>
      <DashboardShellContent>{children}</DashboardShellContent>
    </ActiveConnectionProvider>
  );
}

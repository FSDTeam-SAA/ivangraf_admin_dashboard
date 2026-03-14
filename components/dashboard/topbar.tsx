"use client";

import * as React from "react";
import { Menu } from "lucide-react";
import { useSession } from "next-auth/react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useDashboardActiveConnection } from "@/components/dashboard/active-connection-context";
import { LogoBadge } from "@/components/dashboard/logo-badge";
import { useConnectionSelection } from "@/components/dashboard/use-connection-selection";
import { cn } from "@/lib/utils";

interface TopbarProps {
  className?: string;
  onMenuClick?: () => void;
}

function getInitials(name?: string | null) {
  if (!name) return "NA";
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function Topbar({ className, onMenuClick }: TopbarProps) {
  const { data: session } = useSession();
  const { activeConnectionId } = useConnectionSelection();
  const activeConnectionState = useDashboardActiveConnection();
  const isSwitchingDatabase = Boolean(activeConnectionState?.isUpdatingConnection);

  return (
    <header
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4 lg:px-8",
        className
      )}
      style={{ backgroundColor: "rgba(255, 231, 169, 1)" }}
    >
      <div className="flex items-center gap-3">
        {onMenuClick ? (
          <button
            type="button"
            onClick={onMenuClick}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[#d3b57a] bg-white/80 text-[#4b4030] shadow-sm transition hover:bg-white lg:hidden"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
        ) : null}
        <LogoBadge className="px-3 py-2 sm:px-4" />
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right leading-tight">
          <div className="text-sm font-semibold text-[#2f2a21]">{session?.user?.name || "User"}</div>
          <div className="text-xs text-[#7b6a48]">
            {isSwitchingDatabase
              ? "Switching database..."
              : activeConnectionId
                ? "Database selected"
                : "Select a database"}
          </div>
        </div>
        <Avatar className="h-9 w-9 sm:h-12 sm:w-12">
          <AvatarImage src="/avatar.svg" alt={session?.user?.name || "User avatar"} />
          <AvatarFallback>{getInitials(session?.user?.name)}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}

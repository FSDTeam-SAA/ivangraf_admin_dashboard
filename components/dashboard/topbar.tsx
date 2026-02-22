import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogoBadge } from "@/components/dashboard/logo-badge";
import { cn } from "@/lib/utils";

interface TopbarProps {
  className?: string;
}

export function Topbar({ className }: TopbarProps) {
  return (
    <header
      className={cn("flex items-center justify-between px-8 py-4", className)}
      style={{ backgroundColor: "rgba(255, 231, 169, 1)" }}
    >
      <LogoBadge />
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src="/avatar.svg" alt="Madiha Aroa" />
          <AvatarFallback>MA</AvatarFallback>
        </Avatar>
        <div className="leading-tight">
          <div className="text-sm font-semibold text-[#2f2a21]">Madiha Aroa</div>
          <div className="text-xs text-[#7b6a48]">Welcome back</div>
        </div>
      </div>
    </header>
  );
}

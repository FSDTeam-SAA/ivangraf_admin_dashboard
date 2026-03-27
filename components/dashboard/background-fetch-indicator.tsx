import { cn } from "@/lib/utils";

interface BackgroundFetchIndicatorProps {
  label?: string;
  className?: string;
}

export function BackgroundFetchIndicator({
  label = "",
  className,
}: BackgroundFetchIndicatorProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 text-xs font-medium text-[#7b6a48]",
        className
      )}
    >
      <span
        aria-hidden="true"
        className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#d8b06b] border-t-transparent"
      />
      <span>{label}</span>
    </div>
  );
}

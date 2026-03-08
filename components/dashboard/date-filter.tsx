"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  DATE_FILTER_OPTIONS,
  type DateFilterPreset,
  type DateFilterValue,
  createDateFilterValue,
} from "@/lib/date-filter";

interface DateFilterProps {
  value: DateFilterValue;
  onChange: (nextValue: DateFilterValue) => void;
  className?: string;
}

export function DateFilter({ value, onChange, className }: DateFilterProps) {
  const handlePresetChange = (preset: DateFilterPreset) => {
    if (preset === value.preset) return;

    if (preset === "custom") {
      onChange({
        preset,
        from: value.from || createDateFilterValue("custom").from,
        to: value.to || createDateFilterValue("custom").to,
      });
      return;
    }

    onChange(createDateFilterValue(preset));
  };

  return (
    <div className={cn("flex flex-wrap items-center justify-end gap-2", className)}>
      {DATE_FILTER_OPTIONS.map((option) => (
        <Button
          key={option.value}
          type="button"
          variant={value.preset === option.value ? "gold" : "soft"}
          size="sm"
          onClick={() => handlePresetChange(option.value)}
        >
          {option.label}
        </Button>
      ))}

      {value.preset === "custom" ? (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[#e4d0a1] bg-[#fff8e7] p-2">
          <Input
            type="date"
            value={value.from}
            onChange={(event) => onChange({ ...value, from: event.target.value })}
            className="h-9 w-[150px] bg-white"
          />
          <span className="text-xs font-medium text-[#6f5b35]">to</span>
          <Input
            type="date"
            value={value.to}
            onChange={(event) => onChange({ ...value, to: event.target.value })}
            className="h-9 w-[150px] bg-white"
          />
        </div>
      ) : null}
    </div>
  );
}

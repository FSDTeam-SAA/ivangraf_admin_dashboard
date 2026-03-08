export type DateFilterPreset = "all" | "today" | "yesterday" | "last7Days" | "custom";

export interface DateFilterValue {
  preset: DateFilterPreset;
  from: string;
  to: string;
}

export const DATE_FILTER_OPTIONS: { label: string; value: DateFilterPreset }[] = [
  { label: "All", value: "all" },
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "7 Days", value: "last7Days" },
  { label: "Custom", value: "custom" },
];

function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

export function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function createDateFilterValue(preset: DateFilterPreset = "all", reference = new Date()): DateFilterValue {
  const today = toDateInputValue(reference);
  const yesterday = toDateInputValue(addDays(reference, -1));
  const last7DaysStart = toDateInputValue(addDays(reference, -6));

  if (preset === "today") {
    return { preset, from: today, to: today };
  }

  if (preset === "yesterday") {
    return { preset, from: yesterday, to: yesterday };
  }

  if (preset === "last7Days") {
    return { preset, from: last7DaysStart, to: today };
  }

  if (preset === "custom") {
    return { preset, from: today, to: today };
  }

  return { preset: "all", from: "", to: "" };
}

export function buildDateFilterParams(filter: DateFilterValue) {
  if (filter.preset === "all") {
    return {};
  }

  if (filter.preset === "custom") {
    return {
      period: "custom" as const,
      from: filter.from || undefined,
      to: filter.to || undefined,
    };
  }

  return {
    period: filter.preset,
    from: filter.from || undefined,
    to: filter.to || undefined,
  };
}

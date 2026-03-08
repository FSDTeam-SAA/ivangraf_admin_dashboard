import type { DatasetSummary } from "@/lib/api";
import { formatCurrency, formatNumber } from "@/lib/format";

export function formatSummaryValue(summary?: DatasetSummary, fallbackCount = 0) {
  if (!summary) {
    return formatNumber(fallbackCount, 0);
  }

  if (summary.type === "amount" || summary.type === "price") {
    return formatCurrency(summary.value);
  }

  return formatNumber(summary.value);
}

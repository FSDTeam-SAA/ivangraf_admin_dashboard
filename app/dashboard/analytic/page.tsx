"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { toast } from "sonner";

import { DateFilter } from "@/components/dashboard/date-filter";
import { ExportDialog } from "@/components/dashboard/export-dialog";
import { PageHeader } from "@/components/dashboard/page-header";
import { PaginationBar } from "@/components/dashboard/pagination-bar";
import { RowDetailsDialog } from "@/components/dashboard/row-details-dialog";
import { useConnectionSelection } from "@/components/dashboard/use-connection-selection";
import { usePagination } from "@/components/dashboard/use-pagination";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  getRevenueAnalysis,
  getTopSoldItems,
  getTypeOfPayment,
  type RevenueAnalysisItem,
} from "@/lib/api";
import { buildDateFilterParams, createDateFilterValue } from "@/lib/date-filter";
import { getErrorMessage } from "@/lib/error";
import { formatCurrency } from "@/lib/format";

function buildConicStops(items: { value: number; color: string }[]) {
  const total = items.reduce((sum, item) => sum + item.value, 0);

  return items.reduce<{ start: number; end: number; color: string }[]>((acc, item) => {
    const start = acc.length ? acc[acc.length - 1].end : 0;
    const end = start + (total ? (item.value / total) * 100 : 0);
    acc.push({ start, end, color: item.color });
    return acc;
  }, []);
}

function AnalyticCardSkeleton() {
  return (
    <Card>
      <CardHeader className="space-y-3">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-36" />
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6">
        <Skeleton className="h-44 w-44 rounded-full" />
        <div className="w-full space-y-2">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-24" />
        </div>
      </CardContent>
    </Card>
  );
}

const PAYMENT_CHART_COLORS = [
  "#2563eb",
  "#16a34a",
  "#dc2626",
  "#f59e0b",
  "#7c3aed",
  "#0891b2",
  "#ea580c",
  "#be123c",
  "#4d7c0f",
  "#0f766e",
];

const TOP_SOLD_CHART_COLORS = [
  "#0f766e",
  "#9333ea",
  "#e11d48",
  "#2563eb",
  "#65a30d",
  "#d97706",
  "#0284c7",
  "#b91c1c",
  "#4f46e5",
  "#059669",
];

export default function AnalyticPage() {
  const [dateFilter, setDateFilter] = React.useState(() => createDateFilterValue("all"));
  const [exportOpen, setExportOpen] = React.useState(false);
  const [selectedRow, setSelectedRow] = React.useState<RevenueAnalysisItem | null>(null);
  const { activeConnectionId, isConnectionReady } = useConnectionSelection();

  const queryParams = React.useMemo(() => buildDateFilterParams(dateFilter), [dateFilter]);
  const referenceDate = queryParams.to || queryParams.from || undefined;
  const referenceYear = referenceDate ? new Date(referenceDate).getFullYear() : undefined;

  const paymentQuery = useQuery({
    queryKey: ["dashboard", "type-of-payment", activeConnectionId, queryParams],
    queryFn: () => getTypeOfPayment(queryParams),
    enabled: isConnectionReady && Boolean(activeConnectionId),
  });

  const revenueAnalysisQuery = useQuery({
    queryKey: ["dashboard", "revenue-analysis", activeConnectionId, referenceYear],
    queryFn: () => getRevenueAnalysis(referenceYear ? { year: referenceYear } : undefined),
    enabled: isConnectionReady && Boolean(activeConnectionId),
  });

  const topSoldQuery = useQuery({
    queryKey: ["dashboard", "top-sold-items", activeConnectionId, queryParams],
    queryFn: () => getTopSoldItems({ ...queryParams, limit: 10 }),
    enabled: isConnectionReady && Boolean(activeConnectionId),
  });

  React.useEffect(() => {
    const firstError = paymentQuery.error || revenueAnalysisQuery.error || topSoldQuery.error;
    if (firstError) {
      toast.error(getErrorMessage(firstError, "Failed to load analytics"));
    }
  }, [paymentQuery.error, revenueAnalysisQuery.error, topSoldQuery.error]);

  const paymentItems = paymentQuery.data?.data || [];
  const revenueRows = revenueAnalysisQuery.data?.data || [];
  const topSoldRows = topSoldQuery.data?.data || [];
  const thisYearLabel = revenueRows[0]?.thisYear ?? referenceYear ?? new Date().getFullYear();
  const lastYearLabel = revenueRows[0]?.lastYear ?? thisYearLabel - 1;

  const paymentStops = buildConicStops(
    paymentItems.map((item, index) => ({
      value: item.totalAmount,
      color: PAYMENT_CHART_COLORS[index % PAYMENT_CHART_COLORS.length],
    }))
  );
  const topSoldStops = buildConicStops(
    topSoldRows.map((item, index) => ({
      value: item.totalAmount,
      color: TOP_SOLD_CHART_COLORS[index % TOP_SOLD_CHART_COLORS.length],
    }))
  );
  const topSoldGrand = topSoldRows.reduce((sum, row) => sum + row.totalAmount, 0);

  const maxRevenue = Math.max(
    1,
    ...revenueRows.flatMap((item) => [item.thisYearTotal || 0, item.lastYearTotal || 0])
  );

  const {
    page: revenuePage,
    setPage: setRevenuePage,
    totalPages: revenueTotalPages,
    totalItems: revenueTotalItems,
    items: pagedRevenueRows,
  } = usePagination(revenueRows, 6);

  React.useEffect(() => {
    setRevenuePage(1);
  }, [referenceYear, setRevenuePage]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytic"
        description="Explore organized analytics data. View data in clear lists. Get useful insights"
        actions={
          <>
            <DateFilter value={dateFilter} onChange={setDateFilter} />
            <Button variant="soft" onClick={() => setExportOpen(true)}>
              <Download className="h-4 w-4" />
              Export
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {!isConnectionReady || paymentQuery.isLoading ? (
          <AnalyticCardSkeleton />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Type of Payment</CardTitle>
              <p className="text-sm text-[#7b6a48]">See the type of payment.</p>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-6">
              <div
                className="relative h-44 w-44 rounded-full"
                style={{
                  background: `conic-gradient(${paymentStops
                    .map((stop) => `${stop.color} ${stop.start}% ${stop.end}%`)
                    .join(", ")})`,
                }}
              >
                <div className="absolute inset-10 rounded-full bg-white" />
              </div>
              <div className="w-full space-y-2">
                {paymentItems.map((item, index) => (
                  <div key={`${item.paymentType}-${index}`} className="flex items-center justify-between gap-3 text-sm text-[#4c4231]">
                    <span className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ background: PAYMENT_CHART_COLORS[index % PAYMENT_CHART_COLORS.length] }}
                      />
                      {item.paymentType}
                    </span>
                    <span>{item.percent}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {!isConnectionReady || topSoldQuery.isLoading ? (
          <AnalyticCardSkeleton />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Top Sold Items (Top 10)</CardTitle>
              <p className="text-sm text-[#7b6a48]">Top sold items split in pie chart.</p>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-6">
              <div
                className="relative h-44 w-44 rounded-full"
                style={{
                  background: `conic-gradient(${topSoldStops
                    .map((stop) => `${stop.color} ${stop.start}% ${stop.end}%`)
                    .join(", ")})`,
                }}
              >
                <div className="absolute inset-10 rounded-full bg-white" />
              </div>
              <div className="w-full space-y-2">
                {topSoldRows.map((item, index) => {
                  const percent = topSoldGrand ? Number(((item.totalAmount * 100) / topSoldGrand).toFixed(2)) : 0;
                  return (
                    <div key={`${item.articleId}-${item.rank}`} className="flex items-center justify-between gap-3 text-sm text-[#4c4231]">
                      <span className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ background: TOP_SOLD_CHART_COLORS[index % TOP_SOLD_CHART_COLORS.length] }}
                        />
                        {item.itemName}
                      </span>
                      <span>{percent}%</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Analysis</CardTitle>
            <p className="text-sm text-[#7b6a48]">Bottom-origin monthly bar chart for year comparison.</p>
          </CardHeader>
          <CardContent>
            {!isConnectionReady || revenueAnalysisQuery.isLoading ? (
              <Skeleton className="h-[260px] w-full" />
            ) : (
              <>
                <div className="relative rounded-xl border border-[#f1dfb7] bg-[#fff8ea] px-3 pb-3 pt-4">
                  <div className="grid grid-cols-6 gap-2 sm:grid-cols-12">
                    {revenueRows.map((item) => (
                      <div key={item.monthNumber} className="flex flex-col items-center">
                        <div className="flex h-[230px] items-end gap-1">
                          <div
                            className="w-2 rounded-sm bg-[#f4d58a]"
                            style={{ height: `${Math.max(((item.lastYearTotal || 0) / maxRevenue) * 200, 2)}px` }}
                          />
                          <div
                            className="w-2 rounded-sm bg-[#c18b1f]"
                            style={{ height: `${Math.max(((item.thisYearTotal || 0) / maxRevenue) * 200, 2)}px` }}
                          />
                        </div>
                        <div className="mt-2 text-center text-[10px] text-[#7b6a48]">{item.monthName.slice(0, 3)}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-5 text-xs text-[#7b6a48]">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#f4d58a]" />
                    {lastYearLabel}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#c18b1f]" />
                    {thisYearLabel}
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Revenue Comparison Table</CardTitle>
            <p className="text-sm text-[#7b6a48]">
              Month by month: {lastYearLabel} vs {thisYearLabel} with differences.
            </p>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto pr-2">
            {!isConnectionReady || revenueAnalysisQuery.isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={index} className="h-10 w-full" />
                ))}
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead className="text-right">{lastYearLabel}</TableHead>
                      <TableHead className="text-right">{thisYearLabel}</TableHead>
                      <TableHead className="text-right">Difference</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pagedRevenueRows.map((item) => {
                      const hasGrowth = item.differenceAmount >= 0;
                      return (
                        <TableRow
                          key={item.monthNumber}
                          className="cursor-pointer"
                          onClick={() => setSelectedRow(item)}
                        >
                          <TableCell>{item.monthName}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.lastYearTotal)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.thisYearTotal)}</TableCell>
                          <TableCell className={`text-right ${hasGrowth ? "text-[#128a3a]" : "text-[#b33a2f]"}`}>
                            {`${hasGrowth ? "+" : ""}${formatCurrency(item.differenceAmount)} (${item.differencePercent}%)`}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                <div className="mt-4">
                  <PaginationBar
                    page={revenuePage}
                    totalPages={revenueTotalPages}
                    totalItems={revenueTotalItems}
                    itemsPerPage={6}
                    onPageChange={setRevenuePage}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <ExportDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        title="Export"
        subtitle="Analytic dashboard"
        reportPath="/api/analytics/analytic-dashboard/export"
        params={{
          ...queryParams,
          limit: 10,
          year: referenceYear,
        }}
      />

      <RowDetailsDialog
        open={Boolean(selectedRow)}
        onOpenChange={(open) => {
          if (!open) setSelectedRow(null);
        }}
        title={selectedRow?.monthName || "Revenue comparison details"}
        description="Selected revenue comparison details"
        details={
          selectedRow
            ? [
                { label: "Month", value: selectedRow.monthName },
                { label: `${selectedRow.lastYear} total`, value: formatCurrency(selectedRow.lastYearTotal) },
                { label: `${selectedRow.thisYear} total`, value: formatCurrency(selectedRow.thisYearTotal) },
                { label: "Difference", value: formatCurrency(selectedRow.differenceAmount) },
                { label: "Difference %", value: `${selectedRow.differencePercent}%` },
              ]
            : []
        }
      />
    </div>
  );
}

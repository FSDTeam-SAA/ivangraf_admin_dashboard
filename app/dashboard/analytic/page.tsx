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
import { usePagination } from "@/components/dashboard/use-pagination";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  getRevenueAnalysis,
  getTimePeriods,
  getTopSoldItems,
  getTypeOfPayment,
  type TopSoldItem,
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

export default function AnalyticPage() {
  const [dateFilter, setDateFilter] = React.useState(() => createDateFilterValue("last7Days"));
  const [exportOpen, setExportOpen] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<TopSoldItem | null>(null);

  const queryParams = React.useMemo(() => buildDateFilterParams(dateFilter), [dateFilter]);
  const referenceDate = queryParams.to || queryParams.from || undefined;
  const referenceYear = referenceDate ? new Date(referenceDate).getFullYear() : undefined;

  const paymentQuery = useQuery({
    queryKey: ["dashboard", "type-of-payment", queryParams],
    queryFn: () => getTypeOfPayment(queryParams),
  });

  const timePeriodsQuery = useQuery({
    queryKey: ["dashboard", "time-periods", referenceDate],
    queryFn: () => getTimePeriods({ referenceDate }),
  });

  const revenueAnalysisQuery = useQuery({
    queryKey: ["dashboard", "revenue-analysis", referenceYear],
    queryFn: () => getRevenueAnalysis(referenceYear ? { year: referenceYear } : undefined),
  });

  const topSoldQuery = useQuery({
    queryKey: ["dashboard", "top-sold-items", queryParams],
    queryFn: () => getTopSoldItems({ ...queryParams, limit: 50 }),
  });

  React.useEffect(() => {
    const firstError =
      paymentQuery.error || timePeriodsQuery.error || revenueAnalysisQuery.error || topSoldQuery.error;

    if (firstError) {
      toast.error(getErrorMessage(firstError, "Failed to load analytics"));
    }
  }, [paymentQuery.error, revenueAnalysisQuery.error, timePeriodsQuery.error, topSoldQuery.error]);

  const paymentItems = paymentQuery.data?.data || [];
  const timeItems = timePeriodsQuery.data?.data || [];
  const revenueRows = revenueAnalysisQuery.data?.data || [];
  const topSoldRows = topSoldQuery.data?.data || [];

  const paymentStops = buildConicStops(
    paymentItems.map((item, index) => ({
      value: item.totalAmount,
      color: ["#c18b1f", "#d9a441", "#f1c66b", "#ab7a1a", "#e8b85c"][index % 5],
    }))
  );

  const timeStops = buildConicStops(
    timeItems.map((item, index) => ({
      value: item.total,
      color: ["#e28a00", "#f3c774", "#cfa344"][index % 3],
    }))
  );

  const maxRevenue = Math.max(
    1,
    ...revenueRows.flatMap((item) => [item.thisYearTotal || 0, item.lastYearTotal || 0])
  );

  const {
    page: topPage,
    setPage: setTopPage,
    totalPages: topTotalPages,
    totalItems: topTotalItems,
    items: pagedTopRows,
  } = usePagination(topSoldRows, 6);

  React.useEffect(() => {
    setTopPage(1);
  }, [dateFilter, setTopPage]);

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
        {paymentQuery.isLoading ? (
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
                        style={{ background: ["#c18b1f", "#d9a441", "#f1c66b", "#ab7a1a", "#e8b85c"][index % 5] }}
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

        {timePeriodsQuery.isLoading ? (
          <AnalyticCardSkeleton />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Time Periods</CardTitle>
              <p className="text-sm text-[#7b6a48]">See time period split.</p>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-6">
              <div
                className="relative h-44 w-44 rounded-full"
                style={{
                  background: `conic-gradient(${timeStops
                    .map((stop) => `${stop.color} ${stop.start}% ${stop.end}%`)
                    .join(", ")})`,
                }}
              >
                <div className="absolute inset-10 rounded-full bg-white" />
              </div>
              <div className="w-full space-y-2">
                {timeItems.map((item, index) => (
                  <div key={`${item.label}-${index}`} className="flex items-center justify-between gap-3 text-sm text-[#4c4231]">
                    <span className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ background: ["#e28a00", "#f3c774", "#cfa344"][index % 3] }}
                      />
                      {item.label}
                    </span>
                    <span>{item.percent}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Analysis</CardTitle>
            <p className="text-sm text-[#7b6a48]">Monthly comparison of this year vs last year.</p>
          </CardHeader>
          <CardContent>
            {revenueAnalysisQuery.isLoading ? (
              <Skeleton className="h-[240px] w-full" />
            ) : (
              <>
                <div className="grid grid-cols-6 gap-2 sm:grid-cols-12">
                  {revenueRows.map((item) => (
                    <div key={item.monthNumber} className="flex flex-col items-center gap-2">
                      <div className="flex items-end gap-1">
                        <div
                          className="w-2 rounded-sm bg-[#f4d58a]"
                          style={{ height: `${((item.lastYearTotal || 0) / maxRevenue) * 140}px` }}
                        />
                        <div
                          className="w-2 rounded-sm bg-[#c18b1f]"
                          style={{ height: `${((item.thisYearTotal || 0) / maxRevenue) * 140}px` }}
                        />
                      </div>
                      <div className="text-[10px] text-[#7b6a48]">{item.monthName.slice(0, 3)}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-5 text-xs text-[#7b6a48]">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#f4d58a]" />
                    Last year
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#c18b1f]" />
                    This year
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Top sold items</CardTitle>
            <p className="text-sm text-[#7b6a48]">Most sold items for selected period.</p>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto pr-2">
            {topSoldQuery.isLoading ? (
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
                      <TableHead>Item</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pagedTopRows.map((item) => (
                      <TableRow
                        key={`${item.articleId}-${item.rank}`}
                        className="cursor-pointer"
                        onClick={() => setSelectedItem(item)}
                      >
                        <TableCell>{item.itemName}</TableCell>
                        <TableCell>{item.totalQty}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.totalAmount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="mt-4">
                  <PaginationBar
                    page={topPage}
                    totalPages={topTotalPages}
                    totalItems={topTotalItems}
                    itemsPerPage={6}
                    onPageChange={setTopPage}
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
          limit: 50,
        }}
      />

      <RowDetailsDialog
        open={Boolean(selectedItem)}
        onOpenChange={(open) => {
          if (!open) setSelectedItem(null);
        }}
        title={selectedItem?.itemName || "Top sold item details"}
        description="Selected top sold item details"
        details={
          selectedItem
            ? [
                { label: "Rank", value: selectedItem.rank },
                { label: "Article ID", value: selectedItem.articleId || "-" },
                { label: "Item", value: selectedItem.itemName },
                { label: "Quantity", value: selectedItem.totalQty },
                { label: "Amount", value: formatCurrency(selectedItem.totalAmount) },
              ]
            : []
        }
      />
    </div>
  );
}

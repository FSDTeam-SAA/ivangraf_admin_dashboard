"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { toast } from "sonner";

import { ExportDialog } from "@/components/dashboard/export-dialog";
import { PageHeader } from "@/components/dashboard/page-header";
import { TableFooter } from "@/components/dashboard/table-footer";
import { TableSkeleton } from "@/components/dashboard/table-skeleton";
import { usePagination } from "@/components/dashboard/use-pagination";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getRevenuePerWaiter, type PeriodParams } from "@/lib/api";
import { getErrorMessage } from "@/lib/error";
import { formatCurrency } from "@/lib/format";

const ITEMS_PER_PAGE = 12;
const periodOptions: { label: string; value: NonNullable<PeriodParams["period"]> }[] = [
  { label: "This month", value: "thisMonth" },
  { label: "This year", value: "thisYear" },
  { label: "Last year", value: "lastYear" },
];

export default function RevenuePerWaiterPage() {
  const [period, setPeriod] = React.useState<NonNullable<PeriodParams["period"]>>("thisMonth");
  const [search, setSearch] = React.useState("");
  const [exportOpen, setExportOpen] = React.useState(false);

  const waiterQuery = useQuery({
    queryKey: ["dashboard", "revenue-waiter", period],
    queryFn: () => getRevenuePerWaiter({ period }),
  });

  React.useEffect(() => {
    if (!waiterQuery.error) return;
    toast.error(getErrorMessage(waiterQuery.error, "Failed to load waiter revenue"));
  }, [waiterQuery.error]);

  const filteredRows = React.useMemo(() => {
    const rows = waiterQuery.data?.data || [];
    if (!search.trim()) return rows;

    const term = search.toLowerCase();
    return rows.filter((item) => item.waiterName.toLowerCase().includes(term));
  }, [waiterQuery.data?.data, search]);

  const { page, setPage, totalPages, totalItems, items } = usePagination(filteredRows, ITEMS_PER_PAGE);

  React.useEffect(() => {
    setPage(1);
  }, [period, search, setPage]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Revenue Per Waiter"
        description="See waiter performance and contribution for the selected period."
        actions={
          <>
            <Button variant="soft" onClick={() => setExportOpen(true)}>
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Select value={period} onChange={(event) => setPeriod(event.target.value as NonNullable<PeriodParams["period"]>)}>
              {periodOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </>
        }
      />

      <Card className="p-4">
        {waiterQuery.isLoading ? (
          <TableSkeleton headers={["Name of Waiter", "Total", "% of all Waiters"]} rows={ITEMS_PER_PAGE} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name of Waiter</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="text-right">% of all Waiters</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={`${item.waiterId}-${item.waiterName}`}>
                  <TableCell className="font-medium">{item.waiterName}</TableCell>
                  <TableCell>{formatCurrency(item.total)}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-3">
                      <Progress
                        value={Math.min(item.percentOfAllWaiters, 100)}
                        indicatorClassName={item.percentOfAllWaiters >= 50 ? "bg-[#22c55e]" : "bg-[#ef4444]"}
                      />
                      <span className="text-xs text-[#4d4332]">{item.percentOfAllWaiters}%</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <TableFooter
          search={search}
          onSearchChange={setSearch}
          totalLabel="Total of all"
          totalValue={`${totalItems} Waiters`}
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setPage}
        />
      </Card>

      <ExportDialog open={exportOpen} onOpenChange={setExportOpen} title="Export" subtitle="Revenue Per Waiter" />
    </div>
  );
}
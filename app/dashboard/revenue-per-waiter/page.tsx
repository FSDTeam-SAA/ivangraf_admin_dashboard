"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { toast } from "sonner";

import { DateFilter } from "@/components/dashboard/date-filter";
import { ExportDialog } from "@/components/dashboard/export-dialog";
import { PageHeader } from "@/components/dashboard/page-header";
import { RowDetailsDialog } from "@/components/dashboard/row-details-dialog";
import { TableFooter } from "@/components/dashboard/table-footer";
import { TableSkeleton } from "@/components/dashboard/table-skeleton";
import { usePagination } from "@/components/dashboard/use-pagination";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getRevenuePerWaiter, type RevenueWaiterItem } from "@/lib/api";
import { buildDateFilterParams, createDateFilterValue } from "@/lib/date-filter";
import { getErrorMessage } from "@/lib/error";
import { formatCurrency } from "@/lib/format";

const ITEMS_PER_PAGE = 12;

export default function RevenuePerWaiterPage() {
  const [search, setSearch] = React.useState("");
  const [dateFilter, setDateFilter] = React.useState(() => createDateFilterValue("all"));
  const [exportOpen, setExportOpen] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<RevenueWaiterItem | null>(null);

  const queryParams = React.useMemo(() => buildDateFilterParams(dateFilter), [dateFilter]);

  const waiterQuery = useQuery({
    queryKey: ["dashboard", "revenue-waiter", queryParams],
    queryFn: () => getRevenuePerWaiter(queryParams),
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

  const totalAmount = React.useMemo(
    () => filteredRows.reduce((sum, item) => sum + item.total, 0),
    [filteredRows]
  );

  const { page, setPage, totalPages, totalItems, items } = usePagination(filteredRows, ITEMS_PER_PAGE);

  React.useEffect(() => {
    setPage(1);
  }, [dateFilter, search, setPage]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Revenue Per Waiter"
        description="See waiter performance and contribution for the selected period."
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
                <TableRow
                  key={`${item.waiterId}-${item.waiterName}`}
                  className="cursor-pointer"
                  onClick={() => setSelectedItem(item)}
                >
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
          totalLabel="Total amount"
          totalValue={formatCurrency(totalAmount)}
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setPage}
        />
      </Card>

      <ExportDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        title="Export"
        subtitle="Revenue per waiter"
        reportPath="/api/analytics/revenue-waiter/export"
        params={{
          search: search || undefined,
          ...queryParams,
        }}
      />

      <RowDetailsDialog
        open={Boolean(selectedItem)}
        onOpenChange={(open) => {
          if (!open) setSelectedItem(null);
        }}
        title={selectedItem?.waiterName || "Waiter details"}
        description="Selected waiter revenue details"
        details={
          selectedItem
            ? [
                { label: "Waiter ID", value: selectedItem.waiterId || "-" },
                { label: "Waiter", value: selectedItem.waiterName },
                { label: "Total", value: formatCurrency(selectedItem.total) },
                { label: "Percent of all waiters", value: `${selectedItem.percentOfAllWaiters}%` },
              ]
            : []
        }
      />
    </div>
  );
}

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
import { useConnectionSelection } from "@/components/dashboard/use-connection-selection";
import { usePagination } from "@/components/dashboard/use-pagination";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getRevenueByPayment, type RevenueByPaymentItem } from "@/lib/api";
import { buildDateFilterParams, createDateFilterValue } from "@/lib/date-filter";
import { getErrorMessage } from "@/lib/error";
import { formatCurrency } from "@/lib/format";

const ITEMS_PER_PAGE = 12;

export default function RevenuePage() {
  const [search, setSearch] = React.useState("");
  const [dateFilter, setDateFilter] = React.useState(() => createDateFilterValue("all"));
  const [exportOpen, setExportOpen] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<RevenueByPaymentItem | null>(null);
  const { activeConnectionId, isConnectionReady } = useConnectionSelection();

  const queryParams = React.useMemo(() => buildDateFilterParams(dateFilter), [dateFilter]);

  const revenueQuery = useQuery({
    queryKey: ["dashboard", "revenue-by-payment", activeConnectionId, queryParams],
    queryFn: () => getRevenueByPayment(queryParams, activeConnectionId),
    enabled: isConnectionReady && Boolean(activeConnectionId),
  });

  React.useEffect(() => {
    if (!revenueQuery.error) return;
    toast.error(getErrorMessage(revenueQuery.error, "Failed to load revenue"));
  }, [revenueQuery.error]);

  const filteredRows = React.useMemo(() => {
    const rows = revenueQuery.data?.data || [];
    if (!search.trim()) return rows;

    const term = search.toLowerCase();
    return rows.filter((item) => item.paymentTypeName.toLowerCase().includes(term));
  }, [revenueQuery.data?.data, search]);

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
        title="Revenue"
        description="See revenue by payment type for the selected period."
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
        {revenueQuery.isLoading || !isConnectionReady ? (
          <TableSkeleton headers={["Type of Payment", "Total", "% of all Items"]} rows={ITEMS_PER_PAGE} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type of Payment</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>% of all Items</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow
                  key={`${item.paymentTypeId}-${item.paymentTypeName}`}
                  className="cursor-pointer"
                  onClick={() => setSelectedItem(item)}
                >
                  <TableCell className="font-medium">{item.paymentTypeName}</TableCell>
                  <TableCell>{formatCurrency(item.total)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Progress
                        value={Math.min(item.percent, 100)}
                        indicatorClassName={item.percent >= 50 ? "bg-[#22c55e]" : "bg-[#ef4444]"}
                      />
                      <span className="text-xs text-[#4d4332]">{item.percent}%</span>
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
        subtitle="Revenue"
        reportPath="/api/analytics/revenue-by-payment/export"
        params={{
          connectionId: activeConnectionId || undefined,
          search: search || undefined,
          ...queryParams,
        }}
      />

      <RowDetailsDialog
        open={Boolean(selectedItem)}
        onOpenChange={(open) => {
          if (!open) setSelectedItem(null);
        }}
        title={selectedItem?.paymentTypeName || "Revenue details"}
        description="Selected payment type details"
        details={
          selectedItem
            ? [
                { label: "Payment Type", value: selectedItem.paymentTypeName },
                { label: "Total", value: formatCurrency(selectedItem.total) },
                { label: "Percent of all items", value: `${selectedItem.percent}%` },
              ]
            : []
        }
      />
    </div>
  );
}

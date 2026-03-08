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
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getCancelOrders, type CancelOrderItem } from "@/lib/api";
import { buildDateFilterParams, createDateFilterValue } from "@/lib/date-filter";
import { getErrorMessage } from "@/lib/error";
import { formatCurrency, formatDate } from "@/lib/format";
import { formatSummaryValue } from "@/lib/summary";

const ITEMS_PER_PAGE = 12;

export default function CancelOrdersPage() {
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState("");
  const [dateFilter, setDateFilter] = React.useState(() => createDateFilterValue("last7Days"));
  const [exportOpen, setExportOpen] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<CancelOrderItem | null>(null);
  const deferredSearch = React.useDeferredValue(search);

  const queryParams = React.useMemo(
    () => ({
      page,
      limit: ITEMS_PER_PAGE,
      search: deferredSearch || undefined,
      ...buildDateFilterParams(dateFilter),
    }),
    [page, deferredSearch, dateFilter]
  );

  React.useEffect(() => {
    setPage(1);
  }, [deferredSearch, dateFilter]);

  const cancelOrdersQuery = useQuery({
    queryKey: ["lists", "cancel-orders", queryParams],
    queryFn: () => getCancelOrders(queryParams),
    placeholderData: (previousData) => previousData,
  });

  React.useEffect(() => {
    if (!cancelOrdersQuery.error) return;
    toast.error(getErrorMessage(cancelOrdersQuery.error, "Failed to load cancel orders"));
  }, [cancelOrdersQuery.error]);

  const rows = cancelOrdersQuery.data?.data || [];
  const totalItems = cancelOrdersQuery.data?.meta?.total || 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const summary = cancelOrdersQuery.data?.meta?.summary;

  React.useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cancel Orders"
        description="Review cancelled orders and cancellation values."
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
        {cancelOrdersQuery.isLoading ? (
          <TableSkeleton headers={["Order", "Time", "Waiter", "Amount"]} rows={ITEMS_PER_PAGE} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Waiter</TableHead>
                <TableHead>Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((item) => (
                <TableRow key={item.id} className="cursor-pointer" onClick={() => setSelectedItem(item)}>
                  <TableCell className="font-medium">{item.orderNumber}</TableCell>
                  <TableCell>{formatDate(item.time)}</TableCell>
                  <TableCell>{item.waiter || "-"}</TableCell>
                  <TableCell>{formatCurrency(item.amount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <TableFooter
          search={search}
          onSearchChange={setSearch}
          totalLabel={summary?.label || "Total"}
          totalValue={formatSummaryValue(summary, totalItems)}
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
        subtitle="Cancel orders"
        reportPath="/api/lists/cancel-orders/export"
        params={{
          search: deferredSearch || undefined,
          ...buildDateFilterParams(dateFilter),
        }}
      />

      <RowDetailsDialog
        open={Boolean(selectedItem)}
        onOpenChange={(open) => {
          if (!open) setSelectedItem(null);
        }}
        title={selectedItem?.orderNumber || "Cancel order details"}
        description="Selected cancel order details"
        details={
          selectedItem
            ? [
                { label: "Order ID", value: selectedItem.id },
                { label: "Order Number", value: selectedItem.orderNumber },
                { label: "Time", value: formatDate(selectedItem.time) },
                { label: "Waiter", value: selectedItem.waiter || "-" },
                { label: "Amount", value: formatCurrency(selectedItem.amount) },
              ]
            : []
        }
      />
    </div>
  );
}

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
import { getBills, type BillItem } from "@/lib/api";
import { buildDateFilterParams, createDateFilterValue } from "@/lib/date-filter";
import { getErrorMessage } from "@/lib/error";
import { formatCurrency, formatDate } from "@/lib/format";
import { formatSummaryValue } from "@/lib/summary";

const ITEMS_PER_PAGE = 12;

export default function BillsPage() {
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState("");
  const [dateFilter, setDateFilter] = React.useState(() => createDateFilterValue("last7Days"));
  const [exportOpen, setExportOpen] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<BillItem | null>(null);
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

  const billsQuery = useQuery({
    queryKey: ["lists", "bills", queryParams],
    queryFn: () => getBills(queryParams),
    placeholderData: (previousData) => previousData,
  });

  React.useEffect(() => {
    if (!billsQuery.error) return;
    toast.error(getErrorMessage(billsQuery.error, "Failed to load bills"));
  }, [billsQuery.error]);

  const rows = billsQuery.data?.data || [];
  const totalItems = billsQuery.data?.meta?.total || 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const summary = billsQuery.data?.meta?.summary;

  React.useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bills"
        description="Track and reconcile generated bills."
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
        {billsQuery.isLoading ? (
          <TableSkeleton headers={["Bill", "Time", "Waiter", "Payment", "Total"]} rows={ITEMS_PER_PAGE} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bill</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Waiter</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((item) => (
                <TableRow key={item.id} className="cursor-pointer" onClick={() => setSelectedItem(item)}>
                  <TableCell className="font-medium">{item.invoiceNumber}</TableCell>
                  <TableCell>{formatDate(item.timeOfBill)}</TableCell>
                  <TableCell>{item.waiter || "-"}</TableCell>
                  <TableCell>{item.paymentType || "-"}</TableCell>
                  <TableCell>{formatCurrency(item.total)}</TableCell>
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
        subtitle="Bills"
        reportPath="/api/lists/bills/export"
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
        title={selectedItem?.invoiceNumber || "Bill details"}
        description="Selected bill details"
        details={
          selectedItem
            ? [
                { label: "Bill ID", value: selectedItem.id },
                { label: "Bill Number", value: selectedItem.invoiceNumber },
                { label: "Time", value: formatDate(selectedItem.timeOfBill) },
                { label: "Waiter", value: selectedItem.waiter || "-" },
                { label: "Payment", value: selectedItem.paymentType || "-" },
                { label: "Total", value: formatCurrency(selectedItem.total) },
              ]
            : []
        }
      />
    </div>
  );
}

"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowDownRight, ArrowUpRight, Download } from "lucide-react";
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
import { getSalesItems, type SalesItem } from "@/lib/api";
import { buildDateFilterParams, createDateFilterValue } from "@/lib/date-filter";
import { getErrorMessage } from "@/lib/error";
import { formatCurrency } from "@/lib/format";

const ITEMS_PER_PAGE = 12;

export default function SalesOfItemsPage() {
  const [search, setSearch] = React.useState("");
  const [dateFilter, setDateFilter] = React.useState(() => createDateFilterValue("all"));
  const [exportOpen, setExportOpen] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<SalesItem | null>(null);
  const { activeConnectionId, isConnectionReady } = useConnectionSelection();

  const queryParams = React.useMemo(() => buildDateFilterParams(dateFilter), [dateFilter]);

  const salesQuery = useQuery({
    queryKey: ["dashboard", "sales-items", activeConnectionId, queryParams],
    queryFn: () => getSalesItems(queryParams, activeConnectionId),
    enabled: isConnectionReady && Boolean(activeConnectionId),
  });

  React.useEffect(() => {
    if (!salesQuery.error) return;
    toast.error(getErrorMessage(salesQuery.error, "Failed to load sales items"));
  }, [salesQuery.error]);

  const filteredRows = React.useMemo(() => {
    const rows = salesQuery.data?.data || [];
    if (!search.trim()) return rows;

    const term = search.toLowerCase();
    return rows.filter((item) => item.itemName.toLowerCase().includes(term));
  }, [salesQuery.data?.data, search]);

  const totalAmount = React.useMemo(
    () => filteredRows.reduce((sum, item) => sum + item.total, 0),
    [filteredRows]
  );

  const { page, setPage, totalPages, totalItems, items } = usePagination(filteredRows, ITEMS_PER_PAGE);

  React.useEffect(() => {
    setPage(1);
  }, [search, dateFilter, setPage]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales of items"
        description="See sold item quantities and value share across the selected period."
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
        {salesQuery.isLoading || !isConnectionReady ? (
          <TableSkeleton headers={["Name of Items", "Quantity", "Total", "% of all Items"]} rows={ITEMS_PER_PAGE} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name of Items</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>% of all Items</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const trend = item.percentOfAllItems >= 50;

                return (
                  <TableRow key={`${item.articleId}-${item.itemName}`} className="cursor-pointer" onClick={() => setSelectedItem(item)}>
                    <TableCell className="font-medium">{item.itemName}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>
                      <div className="text-sm font-semibold">{formatCurrency(item.total)}</div>
                      <div className={trend ? "flex items-center gap-1 text-xs text-[#22c55e]" : "flex items-center gap-1 text-xs text-[#ef4444]"}>
                        {trend ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                        {trend ? "+" : ""}
                        {item.percentOfAllItems}%
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Progress
                          value={Math.min(item.percentOfAllItems, 100)}
                          indicatorClassName={trend ? "bg-[#22c55e]" : "bg-[#ef4444]"}
                        />
                        <span className="text-xs text-[#4d4332]">{item.percentOfAllItems}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
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
        subtitle="Sales of items"
        reportPath="/api/analytics/sales-items/export"
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
        title={selectedItem?.itemName || "Sales details"}
        description="Selected sales item details"
        details={
          selectedItem
            ? [
                { label: "Article ID", value: selectedItem.articleId || "-" },
                { label: "Item", value: selectedItem.itemName },
                { label: "Quantity", value: selectedItem.quantity },
                { label: "Total", value: formatCurrency(selectedItem.total) },
                { label: "Percent of all items", value: `${selectedItem.percentOfAllItems}%` },
              ]
            : []
        }
      />
    </div>
  );
}

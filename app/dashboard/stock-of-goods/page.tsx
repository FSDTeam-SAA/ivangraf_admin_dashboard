"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { toast } from "sonner";

import { ExportDialog } from "@/components/dashboard/export-dialog";
import { PageHeader } from "@/components/dashboard/page-header";
import { RowDetailsDialog } from "@/components/dashboard/row-details-dialog";
import { TableFooter } from "@/components/dashboard/table-footer";
import { TableSkeleton } from "@/components/dashboard/table-skeleton";
import { useConnectionSelection } from "@/components/dashboard/use-connection-selection";
import { useServerPagination } from "@/components/dashboard/use-server-pagination";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getStockGoods, type StockGoodItem } from "@/lib/api";
import { getErrorMessage } from "@/lib/error";
import { formatCurrency, formatDate, formatQuantity } from "@/lib/format";
import { formatSummaryValue } from "@/lib/summary";

const ITEMS_PER_PAGE = 12;

export default function StockOfGoodsPage() {
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState("");
  const [exportOpen, setExportOpen] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<StockGoodItem | null>(null);
  const { activeConnectionId, isConnectionReady } = useConnectionSelection();
  const deferredSearch = React.useDeferredValue(search);

  const queryParams = React.useMemo(
    () => ({
      page,
      limit: ITEMS_PER_PAGE,
      search: deferredSearch || undefined,
    }),
    [page, deferredSearch]
  );

  React.useEffect(() => {
    setPage(1);
  }, [deferredSearch]);

  const stockGoodsQuery = useQuery({
    queryKey: ["lists", "stock-goods", activeConnectionId, queryParams],
    queryFn: () => getStockGoods(queryParams, activeConnectionId),
    enabled: isConnectionReady && Boolean(activeConnectionId),
  });

  React.useEffect(() => {
    if (!stockGoodsQuery.error) return;
    toast.error(getErrorMessage(stockGoodsQuery.error, "Failed to load stock goods"));
  }, [stockGoodsQuery.error]);

  const rows = stockGoodsQuery.data?.data || [];
  const { hasLiveTotal, totalItems, totalPages } = useServerPagination(
    stockGoodsQuery.data?.meta?.total,
    ITEMS_PER_PAGE
  );
  const summary = stockGoodsQuery.data?.meta?.summary;

  React.useEffect(() => {
    if (!hasLiveTotal) return;
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [hasLiveTotal, page, totalPages]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stock of Goods"
        description="Monitor inventory levels and replenishment needs."
        actions={
          <>
            <Button variant="soft" onClick={() => setExportOpen(true)}>
              <Download className="h-4 w-4" />
              Export
            </Button>
          </>
        }
      />

      <Card className="p-4">
        {stockGoodsQuery.isLoading || !isConnectionReady ? (
          <TableSkeleton headers={["Item", "In Stock", "Unit", "Status"]} rows={ITEMS_PER_PAGE} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>In Stock</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((item) => {
                const quantity = item.quantity ?? item.inStock ?? 0;
                const status =
                  item.status || (quantity > 0 ? "Zdrav" : quantity === 0 ? "Nema na skladištu" : "Negativna dionica");
                const statusClass =
                  status === "Zdrav"
                    ? "text-[#22c55e]"
                    : status === "Nema na skladištu"
                      ? "text-[#9b6b26]"
                      : "text-[#ef4444]";

                return (
                  <TableRow key={item.goodId || item.id} className="cursor-pointer" onClick={() => setSelectedItem(item)}>
                    <TableCell className="font-medium">{item.itemName || item.name}</TableCell>
                    <TableCell>
                      {item.quantity != null || item.inStock != null
                        ? formatQuantity(item.quantity ?? item.inStock ?? 0)
                        : "-"}
                    </TableCell>
                    <TableCell>{item.unitType || item.unit || "-"}</TableCell>
                    <TableCell className={statusClass}>{status}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}

        <TableFooter
          search={search}
          onSearchChange={setSearch}
          showTotal={false}
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
        subtitle="Stock of goods"
        reportPath="/api/lists/stock-goods/export"
        params={{
          connectionId: activeConnectionId || undefined,
          search: deferredSearch || undefined,
        }}
      />

      <RowDetailsDialog
        open={Boolean(selectedItem)}
        onOpenChange={(open) => {
          if (!open) setSelectedItem(null);
        }}
        title={selectedItem?.itemName || selectedItem?.name || "Stock details"}
        description="Selected stock details"
        details={
          selectedItem
            ? [
                { label: "Name", value: selectedItem.itemName || selectedItem.name },
                {
                  label: "In Stock",
                  value:
                    selectedItem.quantity != null || selectedItem.inStock != null
                      ? formatQuantity(selectedItem.quantity ?? selectedItem.inStock ?? 0)
                      : "-",
                },
                { label: "Unit", value: selectedItem.unitType || selectedItem.unit || "-" },
                { label: "Latest Price", value: formatCurrency(selectedItem.latestPrice || 0) },
                {
                  label: "Status",
                  value:
                    selectedItem.status ||
                    ((selectedItem.quantity ?? selectedItem.inStock ?? 0) > 0
                      ? "Zdrav"
                      : (selectedItem.quantity ?? selectedItem.inStock ?? 0) === 0
                        ? "Nema na skladištu"
                        : "Negativna dionica"),
                },
                { label: "Updated", value: formatDate(selectedItem.updatedAt) },
              ]
            : []
        }
      />
    </div>
  );
}

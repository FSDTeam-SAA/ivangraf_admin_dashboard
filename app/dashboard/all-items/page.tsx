"use client";

import * as React from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
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
import { getAllItems, type AllItem } from "@/lib/api";
import { getErrorMessage } from "@/lib/error";
import { formatCurrency, formatDate } from "@/lib/format";
import { formatSummaryValue } from "@/lib/summary";

const ITEMS_PER_PAGE = 12;

export default function AllItemsPage() {
  const [page, setPage] = React.useState(1);
  const [exportOpen, setExportOpen] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<AllItem | null>(null);
  const [resolvedPage, setResolvedPage] = React.useState(page);
  const { activeConnectionId, isConnectionReady } = useConnectionSelection();

  const queryParams = React.useMemo(
    () => ({
      page,
      limit: ITEMS_PER_PAGE,
    }),
    [page]
  );

  const itemsQuery = useQuery({
    queryKey: ["lists", "all-items", activeConnectionId, queryParams],
    queryFn: () => getAllItems(queryParams, activeConnectionId),
    enabled: isConnectionReady && Boolean(activeConnectionId),
    placeholderData: keepPreviousData,
  });

  React.useEffect(() => {
    if (!itemsQuery.error) return;
    toast.error(getErrorMessage(itemsQuery.error, "Failed to load all items"));
  }, [itemsQuery.error]);

  const rows = itemsQuery.data?.data || [];
  const { hasLiveTotal, totalItems, totalPages } = useServerPagination(
    itemsQuery.data?.meta?.total,
    ITEMS_PER_PAGE
  );
  const summary = itemsQuery.data?.meta?.summary;
  const isRefreshingItems = itemsQuery.isFetching && Boolean(itemsQuery.data);
  const showTableSkeleton =
    !isConnectionReady ||
    (itemsQuery.isLoading && !itemsQuery.data) ||
    (itemsQuery.isPlaceholderData && page !== resolvedPage);

  React.useEffect(() => {
    if (itemsQuery.data && !itemsQuery.isPlaceholderData) {
      setResolvedPage(page);
    }
  }, [itemsQuery.data, itemsQuery.isPlaceholderData, page]);

  React.useEffect(() => {
    if (!hasLiveTotal) return;
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [hasLiveTotal, page, totalPages]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="List of All Items"
        description="See items and articles. Check details in clear lists and stay organized."
        actions={
          <Button variant="soft" onClick={() => setExportOpen(true)}>
            <Download className="h-4 w-4" />
            Export
          </Button>
        }
      />

      <Card className="p-4">
        {showTableSkeleton ? (
          <TableSkeleton headers={["Name of Items", "Category", "Tax Group", "Price"]} rows={ITEMS_PER_PAGE} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name of Items</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Tax Group</TableHead>
                <TableHead className="text-right">Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((item) => (
                <TableRow key={item.id} className="cursor-pointer" onClick={() => setSelectedItem(item)}>
                  <TableCell className="font-medium">{item.itemName || item.name}</TableCell>
                  <TableCell>{item.categoryName || "-"}</TableCell>
                  <TableCell>{item.displayTaxGroup || "-"}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <TableFooter
          showSearch={false}
          showTotal={false}
          isRefreshing={isRefreshingItems}
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
        subtitle="List of all items"
        reportPath="/api/lists/items/export"
        params={{ connectionId: activeConnectionId || undefined }}
      />

      <RowDetailsDialog
        open={Boolean(selectedItem)}
        onOpenChange={(open) => {
          if (!open) setSelectedItem(null);
        }}
        title={selectedItem?.itemName || selectedItem?.name || "Item details"}
        description="Selected item details"
        details={
          selectedItem
            ? [
                { label: "Name", value: selectedItem.itemName || selectedItem.name },
                { label: "Category", value: selectedItem.categoryName || "-" },
                { label: "Tax Group", value: selectedItem.displayTaxGroup || "-" },
                { label: "Price", value: formatCurrency(selectedItem.price) },
                { label: "Updated", value: formatDate(selectedItem.updatedAt) },
              ]
            : []
        }
      />
    </div>
  );
}

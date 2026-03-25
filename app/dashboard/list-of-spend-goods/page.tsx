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
import { useServerPagination } from "@/components/dashboard/use-server-pagination";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getSpendGoods, type SpendGoodItem } from "@/lib/api";
import { buildDateFilterParams, createDateFilterValue } from "@/lib/date-filter";
import { getErrorMessage } from "@/lib/error";
import { formatCurrency, formatDate, formatQuantity } from "@/lib/format";
import { formatSummaryValue } from "@/lib/summary";

const ITEMS_PER_PAGE = 12;

export default function ListOfSpendGoodsPage() {
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState("");
  const [dateFilter, setDateFilter] = React.useState(() => createDateFilterValue("today"));
  const [exportOpen, setExportOpen] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<SpendGoodItem | null>(null);
  const { activeConnectionId, isConnectionReady } = useConnectionSelection();
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

  const spendGoodsQuery = useQuery({
    queryKey: ["lists", "spend-goods", activeConnectionId, queryParams],
    queryFn: () => getSpendGoods(queryParams, activeConnectionId),
    enabled: isConnectionReady && Boolean(activeConnectionId),
  });

  React.useEffect(() => {
    if (!spendGoodsQuery.error) return;
    toast.error(getErrorMessage(spendGoodsQuery.error, "Failed to load spend goods"));
  }, [spendGoodsQuery.error]);

  const rows = spendGoodsQuery.data?.data || [];
  const { hasLiveTotal, totalItems, totalPages } = useServerPagination(
    spendGoodsQuery.data?.meta?.total,
    ITEMS_PER_PAGE
  );
  const summary = spendGoodsQuery.data?.meta?.summary;

  React.useEffect(() => {
    if (!hasLiveTotal) return;
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [hasLiveTotal, page, totalPages]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="List of spend goods"
        description="See spend goods in clear lists and keep procurement data organized."
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
        {spendGoodsQuery.isLoading || !isConnectionReady ? (
          <TableSkeleton headers={["Name of Items", "Quantity", "Type of Unit"]} rows={ITEMS_PER_PAGE} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name of Items</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Type of Unit (Liter, Quantity)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((item) => (
                <TableRow key={item.goodId || item.id} className="cursor-pointer" onClick={() => setSelectedItem(item)}>
                  <TableCell className="font-medium">{item.itemName || item.name}</TableCell>
                  <TableCell>{item.quantity != null ? formatQuantity(item.quantity) : "-"}</TableCell>
                  <TableCell>{item.unitType || item.unit || "-"}</TableCell>
                </TableRow>
              ))}
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
        subtitle="List of spend goods"
        reportPath="/api/lists/spend-goods/export"
        params={{
          connectionId: activeConnectionId || undefined,
          search: deferredSearch || undefined,
          ...buildDateFilterParams(dateFilter),
        }}
      />

      <RowDetailsDialog
        open={Boolean(selectedItem)}
        onOpenChange={(open) => {
          if (!open) setSelectedItem(null);
        }}
        title={selectedItem?.itemName || selectedItem?.name || "Spend goods details"}
        description="Selected goods details"
        details={
          selectedItem
            ? [
                { label: "Name", value: selectedItem.itemName || selectedItem.name },
                { label: "Quantity", value: selectedItem.quantity != null ? formatQuantity(selectedItem.quantity) : "-" },
                { label: "Unit", value: selectedItem.unitType || selectedItem.unit || "-" },
                { label: "Latest Price", value: formatCurrency(selectedItem.latestPrice || 0) },
                { label: "Updated", value: formatDate(selectedItem.updatedAt) },
              ]
            : []
        }
      />
    </div>
  );
}

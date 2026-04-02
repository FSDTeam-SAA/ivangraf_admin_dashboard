"use client";

import * as React from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { toast } from "sonner";

import { DateFilter } from "@/components/dashboard/date-filter";
import { ExportDialog } from "@/components/dashboard/export-dialog";
import { PageHeader } from "@/components/dashboard/page-header";
import { RowDetailsDialog } from "@/components/dashboard/row-details-dialog";
import { TableFooter as DashboardTableFooter } from "@/components/dashboard/table-footer";
import { TableSkeleton } from "@/components/dashboard/table-skeleton";
import { useConnectionSelection } from "@/components/dashboard/use-connection-selection";
import { usePagination } from "@/components/dashboard/use-pagination";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter as UiTableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getTipsPerWaiter, type TipsPerWaiterItem } from "@/lib/api";
import { buildDateFilterParams, createDateFilterValue } from "@/lib/date-filter";
import { getErrorMessage } from "@/lib/error";
import { formatCurrency } from "@/lib/format";

const ITEMS_PER_PAGE = 12;

export default function TipsPerWaiterPage() {
  const [search, setSearch] = React.useState("");
  const [dateFilter, setDateFilter] = React.useState(() => createDateFilterValue("today"));
  const [exportOpen, setExportOpen] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<TipsPerWaiterItem | null>(null);
  const { activeConnectionId, isConnectionReady } = useConnectionSelection();

  const queryParams = React.useMemo(() => buildDateFilterParams(dateFilter), [dateFilter]);

  const tipsQuery = useQuery({
    queryKey: ["dashboard", "tips-per-waiter", activeConnectionId, queryParams],
    queryFn: () => getTipsPerWaiter(queryParams, activeConnectionId),
    enabled: isConnectionReady && Boolean(activeConnectionId),
    placeholderData: keepPreviousData,
  });

  React.useEffect(() => {
    if (!tipsQuery.error) return;
    toast.error(getErrorMessage(tipsQuery.error, "Failed to load waiter tips"));
  }, [tipsQuery.error]);

  const filteredRows = React.useMemo(() => {
    const rows = tipsQuery.data?.data || [];
    if (!search.trim()) return rows;

    const term = search.toLowerCase();
    return rows.filter((item) => item.waiterName.toLowerCase().includes(term));
  }, [tipsQuery.data?.data, search]);

  const totals = React.useMemo(
    () =>
      filteredRows.reduce(
        (acc, item) => {
          acc.cash += item.cash;
          acc.card += item.card;
          acc.total += item.total;
          return acc;
        },
        { cash: 0, card: 0, total: 0 }
      ),
    [filteredRows]
  );
  const isRefreshingTips = tipsQuery.isFetching && Boolean(tipsQuery.data);

  const { page, setPage, totalPages, totalItems, items } = usePagination(filteredRows, ITEMS_PER_PAGE);

  React.useEffect(() => {
    setPage(1);
  }, [dateFilter, search, setPage]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tips Per Waiter"
        description="See waiter tips split by cash and card for the selected period."
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
        {!isConnectionReady || (tipsQuery.isLoading && !tipsQuery.data) ? (
          <TableSkeleton headers={["Name of Waiter", "Cash", "Card", "Total"]} rows={ITEMS_PER_PAGE} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name of Waiter</TableHead>
                <TableHead className="text-right">Cash</TableHead>
                <TableHead className="text-right">Card</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow
                  key={item.waiterName}
                  className="cursor-pointer"
                  onClick={() => setSelectedItem(item)}
                >
                  <TableCell className="font-medium">{item.waiterName}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.cash)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.card)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.total)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <UiTableFooter>
              <TableRow className="border-t-2 border-[#ecd9b3] bg-[#fff8ea] hover:bg-[#fff8ea]">
                <TableCell className="font-semibold text-[#4d4332]">TOTAL OF ALL WAITERS</TableCell>
                <TableCell className="text-right font-semibold text-[#4d4332]">
                  {formatCurrency(totals.cash)}
                </TableCell>
                <TableCell className="text-right font-semibold text-[#4d4332]">
                  {formatCurrency(totals.card)}
                </TableCell>
                <TableCell className="text-right font-semibold text-[#2f2a21]">
                  {formatCurrency(totals.total)}
                </TableCell>
              </TableRow>
            </UiTableFooter>
          </Table>
        )}

        <DashboardTableFooter
          search={search}
          onSearchChange={setSearch}
          showTotal={false}
          isRefreshing={isRefreshingTips}
          totalLabel="Total tips"
          totalValue={formatCurrency(totals.total)}
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
        subtitle="Tips per waiter"
        reportPath="/api/analytics/tips-per-waiter/export"
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
        title={selectedItem?.waiterName || "Waiter tip details"}
        description="Selected waiter tip breakdown"
        details={
          selectedItem
            ? [
                { label: "Waiter", value: selectedItem.waiterName },
                { label: "Cash", value: formatCurrency(selectedItem.cash) },
                { label: "Card", value: formatCurrency(selectedItem.card) },
                { label: "Total", value: formatCurrency(selectedItem.total) },
              ]
            : []
        }
      />
    </div>
  );
}

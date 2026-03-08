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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getOpenTables, type OpenTableItem } from "@/lib/api";
import { buildDateFilterParams, createDateFilterValue } from "@/lib/date-filter";
import { getErrorMessage } from "@/lib/error";
import { formatDate, formatNumber } from "@/lib/format";

const ITEMS_PER_PAGE = 12;

export default function OpensTablesPage() {
  const [search, setSearch] = React.useState("");
  const [dateFilter, setDateFilter] = React.useState(() => createDateFilterValue("all"));
  const [exportOpen, setExportOpen] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<OpenTableItem | null>(null);

  const queryParams = React.useMemo(() => buildDateFilterParams(dateFilter), [dateFilter]);

  const openTablesQuery = useQuery({
    queryKey: ["dashboard", "open-tables", queryParams],
    queryFn: () => getOpenTables(queryParams),
  });

  React.useEffect(() => {
    if (!openTablesQuery.error) return;
    toast.error(getErrorMessage(openTablesQuery.error, "Failed to load open tables"));
  }, [openTablesQuery.error]);

  const filteredRows = React.useMemo(() => {
    const rows = openTablesQuery.data?.data || [];
    if (!search.trim()) return rows;

    const term = search.toLowerCase();
    return rows.filter(
      (item) =>
        item.tableName.toLowerCase().includes(term) ||
        (item.sectorName || "").toLowerCase().includes(term) ||
        (item.waiterName || "").toLowerCase().includes(term)
    );
  }, [openTablesQuery.data?.data, search]);

  const occupiedCount = React.useMemo(
    () => filteredRows.filter((item) => item.status === "Occupied").length,
    [filteredRows]
  );

  const { page, setPage, totalPages, totalItems, items } = usePagination(filteredRows, ITEMS_PER_PAGE);

  React.useEffect(() => {
    setPage(1);
  }, [search, dateFilter, setPage]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Opens Tables"
        description="Track current table occupancy and waiter assignment."
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
        {openTablesQuery.isLoading ? (
          <TableSkeleton headers={["Table", "Sector", "Waiter", "Status"]} rows={ITEMS_PER_PAGE} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Table</TableHead>
                <TableHead>Sector</TableHead>
                <TableHead>Waiter</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.tableId} className="cursor-pointer" onClick={() => setSelectedItem(item)}>
                  <TableCell className="font-medium">{item.tableName}</TableCell>
                  <TableCell>{item.sectorName || "-"}</TableCell>
                  <TableCell>{item.waiterName || "-"}</TableCell>
                  <TableCell className={item.status === "Occupied" ? "text-[#d97706]" : "text-[#22c55e]"}>
                    {item.status}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <TableFooter
          search={search}
          onSearchChange={setSearch}
          totalLabel="Occupied tables"
          totalValue={formatNumber(occupiedCount, 0)}
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
        subtitle="Open tables"
        reportPath="/api/analytics/open-tables/export"
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
        title={selectedItem?.tableName || "Table details"}
        description="Selected table details"
        details={
          selectedItem
            ? [
                { label: "Table ID", value: selectedItem.tableId },
                { label: "Table", value: selectedItem.tableName },
                { label: "Sector", value: selectedItem.sectorName || "-" },
                { label: "Waiter", value: selectedItem.waiterName || "-" },
                { label: "Status", value: selectedItem.status },
                { label: "Updated", value: formatDate(selectedItem.updatedAt) },
              ]
            : []
        }
      />
    </div>
  );
}

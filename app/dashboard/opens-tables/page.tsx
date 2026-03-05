"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { PageHeader } from "@/components/dashboard/page-header";
import { TableFooter } from "@/components/dashboard/table-footer";
import { TableSkeleton } from "@/components/dashboard/table-skeleton";
import { usePagination } from "@/components/dashboard/use-pagination";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getOpenTables } from "@/lib/api";
import { getErrorMessage } from "@/lib/error";

const ITEMS_PER_PAGE = 12;

export default function OpensTablesPage() {
  const [search, setSearch] = React.useState("");

  const openTablesQuery = useQuery({
    queryKey: ["dashboard", "open-tables"],
    queryFn: getOpenTables,
  });

  React.useEffect(() => {
    if (!openTablesQuery.error) return;
    toast.error(getErrorMessage(openTablesQuery.error, "Failed to load open tables"));
  }, [openTablesQuery.error]);

  const filteredRows = React.useMemo(() => {
    const rows = openTablesQuery.data?.data || [];
    if (!search.trim()) return rows;

    const term = search.toLowerCase();
    return rows.filter((item) => item.tableName.toLowerCase().includes(term));
  }, [openTablesQuery.data?.data, search]);

  const { page, setPage, totalPages, totalItems, items } = usePagination(filteredRows, ITEMS_PER_PAGE);

  React.useEffect(() => {
    setPage(1);
  }, [search, setPage]);

  return (
    <div className="space-y-6">
      <PageHeader title="Opens Tables" description="Track current table occupancy and waiter assignment." />

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
                <TableRow key={item.tableId}>
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
          totalLabel="Total of all"
          totalValue={`${totalItems} Tables`}
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setPage}
        />
      </Card>
    </div>
  );
}
"use client";

import * as React from "react";

import { PageHeader } from "@/components/dashboard/page-header";
import { TableFooter } from "@/components/dashboard/table-footer";
import { usePagination } from "@/components/dashboard/use-pagination";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { openTables } from "@/data/dashboard";

export default function OpensTablesPage() {
  const [search, setSearch] = React.useState("");

  const filtered = React.useMemo(() => {
    if (!search) return openTables;
    const term = search.toLowerCase();
    return openTables.filter((item) => item.table.toLowerCase().includes(term));
  }, [search]);

  const { page, setPage, totalPages, totalItems, items } = usePagination(filtered, 12);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Opens Tables"
        description="Track currently open tables and guest occupancy."
      />
      <Card className="p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Table</TableHead>
              <TableHead>Guests</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.table}</TableCell>
                <TableCell>{item.guests}</TableCell>
                <TableCell>{item.status}</TableCell>
                <TableCell className="text-right">${item.total.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TableFooter
          search={search}
          onSearchChange={setSearch}
          totalLabel="Total off all"
          totalValue="20 Tables"
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={12}
          onPageChange={setPage}
        />
      </Card>
    </div>
  );
}
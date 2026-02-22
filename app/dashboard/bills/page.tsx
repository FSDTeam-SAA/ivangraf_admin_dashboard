"use client";

import * as React from "react";

import { PageHeader } from "@/components/dashboard/page-header";
import { TableFooter } from "@/components/dashboard/table-footer";
import { usePagination } from "@/components/dashboard/use-pagination";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { bills } from "@/data/dashboard";

export default function BillsPage() {
  const [search, setSearch] = React.useState("");

  const filtered = React.useMemo(() => {
    if (!search) return bills;
    const term = search.toLowerCase();
    return bills.filter((item) => item.bill.toLowerCase().includes(term));
  }, [search]);

  const { page, setPage, totalPages, totalItems, items } = usePagination(filtered, 12);

  return (
    <div className="space-y-6">
      <PageHeader title="Bills" description="Track and reconcile pending bills." />
      <Card className="p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bill</TableHead>
              <TableHead>Table</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.bill}</TableCell>
                <TableCell>{item.table}</TableCell>
                <TableCell>${item.total.toFixed(2)}</TableCell>
                <TableCell
                  className={item.status === "Paid" ? "text-[#22c55e]" : "text-[#d97706]"}
                >
                  {item.status}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TableFooter
          search={search}
          onSearchChange={setSearch}
          totalLabel="Total off all"
          totalValue="20 Bills"
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
"use client";

import * as React from "react";

import { PageHeader } from "@/components/dashboard/page-header";
import { TableFooter } from "@/components/dashboard/table-footer";
import { usePagination } from "@/components/dashboard/use-pagination";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cancelOrders } from "@/data/dashboard";

export default function CancelOrdersPage() {
  const [search, setSearch] = React.useState("");

  const filtered = React.useMemo(() => {
    if (!search) return cancelOrders;
    const term = search.toLowerCase();
    return cancelOrders.filter((item) => item.order.toLowerCase().includes(term));
  }, [search]);

  const { page, setPage, totalPages, totalItems, items } = usePagination(filtered, 12);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cancel Orders"
        description="Review cancellations and customer feedback."
      />
      <Card className="p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Item</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Reason</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.order}</TableCell>
                <TableCell>{item.item}</TableCell>
                <TableCell>${item.total.toFixed(2)}</TableCell>
                <TableCell>{item.reason}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TableFooter
          search={search}
          onSearchChange={setSearch}
          totalLabel="Total off all"
          totalValue="20 Orders"
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
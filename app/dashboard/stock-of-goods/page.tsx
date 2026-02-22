"use client";

import * as React from "react";

import { PageHeader } from "@/components/dashboard/page-header";
import { TableFooter } from "@/components/dashboard/table-footer";
import { usePagination } from "@/components/dashboard/use-pagination";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { stockGoods } from "@/data/dashboard";

export default function StockOfGoodsPage() {
  const [search, setSearch] = React.useState("");

  const filtered = React.useMemo(() => {
    if (!search) return stockGoods;
    const term = search.toLowerCase();
    return stockGoods.filter((item) => item.item.toLowerCase().includes(term));
  }, [search]);

  const { page, setPage, totalPages, totalItems, items } = usePagination(filtered, 12);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stock of Goods"
        description="Monitor inventory levels and replenishment needs."
      />
      <Card className="p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>In Stock</TableHead>
              <TableHead>Reorder Level</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.item}</TableCell>
                <TableCell>{item.inStock}</TableCell>
                <TableCell>{item.reorder}</TableCell>
                <TableCell
                  className={item.status === "Low" ? "text-[#ef4444]" : "text-[#22c55e]"}
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
          totalValue="20 Items"
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
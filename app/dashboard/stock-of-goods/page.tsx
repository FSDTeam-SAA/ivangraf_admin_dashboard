"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { PageHeader } from "@/components/dashboard/page-header";
import { TableFooter } from "@/components/dashboard/table-footer";
import { TableSkeleton } from "@/components/dashboard/table-skeleton";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getStockGoods } from "@/lib/api";
import { getErrorMessage } from "@/lib/error";

const ITEMS_PER_PAGE = 12;

export default function StockOfGoodsPage() {
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState("");
  const deferredSearch = React.useDeferredValue(search);

  React.useEffect(() => {
    setPage(1);
  }, [deferredSearch]);

  const stockGoodsQuery = useQuery({
    queryKey: ["lists", "stock-goods", page, deferredSearch],
    queryFn: () =>
      getStockGoods({
        page,
        limit: ITEMS_PER_PAGE,
        search: deferredSearch || undefined,
      }),
    placeholderData: (previousData) => previousData,
  });

  React.useEffect(() => {
    if (!stockGoodsQuery.error) return;
    toast.error(getErrorMessage(stockGoodsQuery.error, "Failed to load stock goods"));
  }, [stockGoodsQuery.error]);

  const rows = stockGoodsQuery.data?.data || [];
  const totalItems = stockGoodsQuery.data?.meta?.total || 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));

  React.useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  return (
    <div className="space-y-6">
      <PageHeader title="Stock of Goods" description="Monitor inventory levels and replenishment needs." />

      <Card className="p-4">
        {stockGoodsQuery.isLoading ? (
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
                const quantity = item.quantity || 0;
                const isLow = quantity > 0 && quantity < 20;

                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.quantity ?? "-"}</TableCell>
                    <TableCell>{item.unit || "-"}</TableCell>
                    <TableCell className={isLow ? "text-[#ef4444]" : "text-[#22c55e]"}>
                      {isLow ? "Low" : "Healthy"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}

        <TableFooter
          search={search}
          onSearchChange={setSearch}
          totalLabel="Total of all"
          totalValue={`${totalItems} Items`}
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
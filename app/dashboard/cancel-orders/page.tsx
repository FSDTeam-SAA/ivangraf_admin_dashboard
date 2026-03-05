"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { PageHeader } from "@/components/dashboard/page-header";
import { TableFooter } from "@/components/dashboard/table-footer";
import { TableSkeleton } from "@/components/dashboard/table-skeleton";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getCancelOrders } from "@/lib/api";
import { getErrorMessage } from "@/lib/error";
import { formatCurrency, formatDate } from "@/lib/format";

const ITEMS_PER_PAGE = 12;

export default function CancelOrdersPage() {
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState("");
  const deferredSearch = React.useDeferredValue(search);

  React.useEffect(() => {
    setPage(1);
  }, [deferredSearch]);

  const cancelOrdersQuery = useQuery({
    queryKey: ["lists", "cancel-orders", page, deferredSearch],
    queryFn: () =>
      getCancelOrders({
        page,
        limit: ITEMS_PER_PAGE,
        search: deferredSearch || undefined,
      }),
    placeholderData: (previousData) => previousData,
  });

  React.useEffect(() => {
    if (!cancelOrdersQuery.error) return;
    toast.error(getErrorMessage(cancelOrdersQuery.error, "Failed to load cancel orders"));
  }, [cancelOrdersQuery.error]);

  const rows = cancelOrdersQuery.data?.data || [];
  const totalItems = cancelOrdersQuery.data?.meta?.total || 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));

  React.useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  return (
    <div className="space-y-6">
      <PageHeader title="Cancel Orders" description="Review cancelled orders and cancellation values." />

      <Card className="p-4">
        {cancelOrdersQuery.isLoading ? (
          <TableSkeleton headers={["Order", "Time", "Waiter", "Amount"]} rows={ITEMS_PER_PAGE} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Waiter</TableHead>
                <TableHead>Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.orderNumber}</TableCell>
                  <TableCell>{formatDate(item.time)}</TableCell>
                  <TableCell>{item.waiter || "-"}</TableCell>
                  <TableCell>{formatCurrency(item.amount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <TableFooter
          search={search}
          onSearchChange={setSearch}
          totalLabel="Total of all"
          totalValue={`${totalItems} Orders`}
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
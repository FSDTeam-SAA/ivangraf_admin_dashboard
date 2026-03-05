"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { PageHeader } from "@/components/dashboard/page-header";
import { TableFooter } from "@/components/dashboard/table-footer";
import { TableSkeleton } from "@/components/dashboard/table-skeleton";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getBills } from "@/lib/api";
import { getErrorMessage } from "@/lib/error";
import { formatCurrency, formatDate } from "@/lib/format";

const ITEMS_PER_PAGE = 12;

export default function BillsPage() {
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState("");
  const deferredSearch = React.useDeferredValue(search);

  React.useEffect(() => {
    setPage(1);
  }, [deferredSearch]);

  const billsQuery = useQuery({
    queryKey: ["lists", "bills", page, deferredSearch],
    queryFn: () =>
      getBills({
        page,
        limit: ITEMS_PER_PAGE,
        search: deferredSearch || undefined,
      }),
    placeholderData: (previousData) => previousData,
  });

  React.useEffect(() => {
    if (!billsQuery.error) return;
    toast.error(getErrorMessage(billsQuery.error, "Failed to load bills"));
  }, [billsQuery.error]);

  const rows = billsQuery.data?.data || [];
  const totalItems = billsQuery.data?.meta?.total || 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));

  React.useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  return (
    <div className="space-y-6">
      <PageHeader title="Bills" description="Track and reconcile generated bills." />

      <Card className="p-4">
        {billsQuery.isLoading ? (
          <TableSkeleton headers={["Bill", "Time", "Waiter", "Payment", "Total"]} rows={ITEMS_PER_PAGE} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bill</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Waiter</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.invoiceNumber}</TableCell>
                  <TableCell>{formatDate(item.timeOfBill)}</TableCell>
                  <TableCell>{item.waiter || "-"}</TableCell>
                  <TableCell>{item.paymentType || "-"}</TableCell>
                  <TableCell>{formatCurrency(item.total)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <TableFooter
          search={search}
          onSearchChange={setSearch}
          totalLabel="Total of all"
          totalValue={`${totalItems} Bills`}
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
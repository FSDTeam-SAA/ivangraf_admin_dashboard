"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { toast } from "sonner";

import { ExportDialog } from "@/components/dashboard/export-dialog";
import { PageHeader } from "@/components/dashboard/page-header";
import { TableFooter } from "@/components/dashboard/table-footer";
import { TableSkeleton } from "@/components/dashboard/table-skeleton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAllItems } from "@/lib/api";
import { getErrorMessage } from "@/lib/error";
import { formatCurrency } from "@/lib/format";

const ITEMS_PER_PAGE = 12;

export default function AllItemsPage() {
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState("");
  const deferredSearch = React.useDeferredValue(search);
  const [exportOpen, setExportOpen] = React.useState(false);

  React.useEffect(() => {
    setPage(1);
  }, [deferredSearch]);

  const itemsQuery = useQuery({
    queryKey: ["lists", "all-items", page, deferredSearch],
    queryFn: () =>
      getAllItems({
        page,
        limit: ITEMS_PER_PAGE,
        search: deferredSearch || undefined,
      }),
    placeholderData: (previousData) => previousData,
  });

  React.useEffect(() => {
    if (!itemsQuery.error) return;
    toast.error(getErrorMessage(itemsQuery.error, "Failed to load all items"));
  }, [itemsQuery.error]);

  const rows = itemsQuery.data?.data || [];
  const totalItems = itemsQuery.data?.meta?.total || 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));

  React.useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="List of All Items"
        description="See items and articles. Check details in clear lists and stay organized."
        actions={
          <Button variant="soft" onClick={() => setExportOpen(true)}>
            <Download className="h-4 w-4" />
            Export
          </Button>
        }
      />

      <Card className="p-4">
        {itemsQuery.isLoading ? (
          <TableSkeleton headers={["Name of Items", "Tax Group", "Price"]} rows={ITEMS_PER_PAGE} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name of Items</TableHead>
                <TableHead>Tax Group</TableHead>
                <TableHead className="text-right">Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.taxGroup || "-"}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                </TableRow>
              ))}
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

      <ExportDialog open={exportOpen} onOpenChange={setExportOpen} title="Export" subtitle="List of all items" />
    </div>
  );
}
"use client";

import * as React from "react";
import { Download } from "lucide-react";

import { ExportDialog } from "@/components/dashboard/export-dialog";
import { PageHeader } from "@/components/dashboard/page-header";
import { TableFooter } from "@/components/dashboard/table-footer";
import { usePagination } from "@/components/dashboard/use-pagination";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { allItems } from "@/data/dashboard";

export default function AllItemsPage() {
  const [search, setSearch] = React.useState("");
  const [exportOpen, setExportOpen] = React.useState(false);

  const filtered = React.useMemo(() => {
    if (!search) return allItems;
    const term = search.toLowerCase();
    return allItems.filter((item) => item.name.toLowerCase().includes(term));
  }, [search]);

  const { page, setPage, totalPages, totalItems, items } = usePagination(filtered, 12);

  return (
    <div className="space-y-6">
      <PageHeader
        title="List of All Items"
        description="See items and articles Check details in clear lists Stay organized."
        actions={
          <Button variant="soft" onClick={() => setExportOpen(true)}>
            <Download className="h-4 w-4" />
            Export
          </Button>
        }
      />
      <Card className="p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name of Items</TableHead>
              <TableHead>Tax Group</TableHead>
              <TableHead className="text-right">Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.taxGroup}</TableCell>
                <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TableFooter
          search={search}
          onSearchChange={setSearch}
          totalLabel="Total off all"
          totalValue="3,105 Items"
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={12}
          onPageChange={setPage}
        />
      </Card>
      <ExportDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        title="Export"
        subtitle="List of all items"
      />
    </div>
  );
}
"use client";

import * as React from "react";
import { Download } from "lucide-react";

import { ExportDialog } from "@/components/dashboard/export-dialog";
import { PageHeader } from "@/components/dashboard/page-header";
import { TableFooter } from "@/components/dashboard/table-footer";
import { usePagination } from "@/components/dashboard/use-pagination";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { revenueTaxGroups } from "@/data/dashboard";

const timeOptions = ["This month", "Last month", "Custom"];

export default function RevenuePerTaxGroupPage() {
  const [timeFilter, setTimeFilter] = React.useState(timeOptions[0]);
  const [search, setSearch] = React.useState("");
  const [exportOpen, setExportOpen] = React.useState(false);

  const filtered = React.useMemo(() => {
    if (!search) return revenueTaxGroups;
    const term = search.toLowerCase();
    return revenueTaxGroups.filter((item) => item.name.toLowerCase().includes(term));
  }, [search]);

  const { page, setPage, totalPages, totalItems, items } = usePagination(filtered, 12);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Revenue per tax group"
        description="See revenue information. Check income by time period Stay informed."
        actions={
          <>
            <Button variant="soft" onClick={() => setExportOpen(true)}>
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Select value={timeFilter} onChange={(event) => setTimeFilter(event.target.value)}>
              {timeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </>
        }
      />
      <Card className="p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name of tax group</TableHead>
              <TableHead>Total total</TableHead>
              <TableHead className="text-right">Total amount of tax</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>${item.total.toFixed(2)}</TableCell>
                <TableCell className="text-right">{item.taxAmount}</TableCell>
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
        subtitle="Revenue per tax group"
      />
    </div>
  );
}
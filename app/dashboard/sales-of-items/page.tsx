"use client";

import * as React from "react";
import { ArrowDownRight, ArrowUpRight, Download } from "lucide-react";

import { ExportDialog } from "@/components/dashboard/export-dialog";
import { PageHeader } from "@/components/dashboard/page-header";
import { TableFooter } from "@/components/dashboard/table-footer";
import { usePagination } from "@/components/dashboard/use-pagination";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { salesItems } from "@/data/dashboard";

const timeOptions = ["This month", "Last month", "Custom"];

export default function SalesOfItemsPage() {
  const [timeFilter, setTimeFilter] = React.useState(timeOptions[0]);
  const [search, setSearch] = React.useState("");
  const [exportOpen, setExportOpen] = React.useState(false);

  const filtered = React.useMemo(() => {
    if (!search) return salesItems;
    const term = search.toLowerCase();
    return salesItems.filter((item) => item.name.toLowerCase().includes(term));
  }, [search]);

  const { page, setPage, totalPages, totalItems, items } = usePagination(filtered, 12);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales of Sales of items"
        description="See items and articles Check details in clear lists Stay organized."
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
              <TableHead>Name of Items</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>% of all Items</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>
                  <div className="text-sm font-semibold">${item.total.toFixed(2)}</div>
                  <div
                    className={
                      item.delta > 0
                        ? "flex items-center gap-1 text-xs text-[#22c55e]"
                        : "flex items-center gap-1 text-xs text-[#ef4444]"
                    }
                  >
                    {item.delta > 0 ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    {item.delta > 0 ? "+" : ""}
                    {item.delta}%
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Progress
                      value={item.percent}
                      indicatorClassName={item.percent === 100 ? "bg-[#22c55e]" : "bg-[#ef4444]"}
                    />
                    <span className="text-xs text-[#4d4332]">{item.percent}%</span>
                  </div>
                </TableCell>
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
        subtitle="Sales of items"
      />
    </div>
  );
}
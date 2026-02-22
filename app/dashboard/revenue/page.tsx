"use client";

import * as React from "react";
import { Download } from "lucide-react";

import { ExportDialog } from "@/components/dashboard/export-dialog";
import { PageHeader } from "@/components/dashboard/page-header";
import { TableFooter } from "@/components/dashboard/table-footer";
import { usePagination } from "@/components/dashboard/use-pagination";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { revenuePayments } from "@/data/dashboard";

const timeOptions = ["This month", "Last month", "Custom"];

export default function RevenuePage() {
  const [timeFilter, setTimeFilter] = React.useState(timeOptions[0]);
  const [search, setSearch] = React.useState("");
  const [exportOpen, setExportOpen] = React.useState(false);

  const filtered = React.useMemo(() => {
    if (!search) return revenuePayments;
    const term = search.toLowerCase();
    return revenuePayments.filter((item) => item.type.toLowerCase().includes(term));
  }, [search]);

  const { page, setPage, totalPages, totalItems, items } = usePagination(filtered, 12);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Revenue"
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
              <TableHead>Type of Payment</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>% of all Items</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.type}</TableCell>
                <TableCell>${item.total.toFixed(2)}</TableCell>
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
        subtitle="Revenue"
      />
    </div>
  );
}
"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowDownRight, ArrowUpRight, Download } from "lucide-react";
import { toast } from "sonner";

import { ExportDialog } from "@/components/dashboard/export-dialog";
import { PageHeader } from "@/components/dashboard/page-header";
import { TableFooter } from "@/components/dashboard/table-footer";
import { TableSkeleton } from "@/components/dashboard/table-skeleton";
import { usePagination } from "@/components/dashboard/use-pagination";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getSalesItems, type PeriodParams } from "@/lib/api";
import { getErrorMessage } from "@/lib/error";
import { formatCurrency } from "@/lib/format";

const ITEMS_PER_PAGE = 12;
const periodOptions: { label: string; value: NonNullable<PeriodParams["period"]> }[] = [
  { label: "This month", value: "thisMonth" },
  { label: "This year", value: "thisYear" },
  { label: "Last year", value: "lastYear" },
];

export default function SalesOfItemsPage() {
  const [period, setPeriod] = React.useState<NonNullable<PeriodParams["period"]>>("thisMonth");
  const [search, setSearch] = React.useState("");
  const [exportOpen, setExportOpen] = React.useState(false);

  const salesQuery = useQuery({
    queryKey: ["dashboard", "sales-items", period],
    queryFn: () => getSalesItems({ period }),
  });

  React.useEffect(() => {
    if (!salesQuery.error) return;
    toast.error(getErrorMessage(salesQuery.error, "Failed to load sales items"));
  }, [salesQuery.error]);

  const filteredRows = React.useMemo(() => {
    const rows = salesQuery.data?.data || [];
    if (!search.trim()) return rows;

    const term = search.toLowerCase();
    return rows.filter((item) => item.itemName.toLowerCase().includes(term));
  }, [salesQuery.data?.data, search]);

  const { page, setPage, totalPages, totalItems, items } = usePagination(filteredRows, ITEMS_PER_PAGE);

  React.useEffect(() => {
    setPage(1);
  }, [search, period, setPage]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales of items"
        description="See sold item quantities and value share across the selected period."
        actions={
          <>
            <Button variant="soft" onClick={() => setExportOpen(true)}>
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Select value={period} onChange={(event) => setPeriod(event.target.value as NonNullable<PeriodParams["period"]>)}>
              {periodOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </>
        }
      />

      <Card className="p-4">
        {salesQuery.isLoading ? (
          <TableSkeleton headers={["Name of Items", "Quantity", "Total", "% of all Items"]} rows={ITEMS_PER_PAGE} />
        ) : (
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
              {items.map((item) => {
                const trend = item.percentOfAllItems >= 50;

                return (
                  <TableRow key={`${item.articleId}-${item.itemName}`}>
                    <TableCell className="font-medium">{item.itemName}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>
                      <div className="text-sm font-semibold">{formatCurrency(item.total)}</div>
                      <div className={trend ? "flex items-center gap-1 text-xs text-[#22c55e]" : "flex items-center gap-1 text-xs text-[#ef4444]"}>
                        {trend ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                        {trend ? "+" : ""}
                        {item.percentOfAllItems}%
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Progress
                          value={Math.min(item.percentOfAllItems, 100)}
                          indicatorClassName={trend ? "bg-[#22c55e]" : "bg-[#ef4444]"}
                        />
                        <span className="text-xs text-[#4d4332]">{item.percentOfAllItems}%</span>
                      </div>
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

      <ExportDialog open={exportOpen} onOpenChange={setExportOpen} title="Export" subtitle="Sales of items" />
    </div>
  );
}
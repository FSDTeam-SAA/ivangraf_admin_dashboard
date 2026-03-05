"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";
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
import { getRevenueByPayment, type PeriodParams } from "@/lib/api";
import { getErrorMessage } from "@/lib/error";
import { formatCurrency } from "@/lib/format";

const ITEMS_PER_PAGE = 12;
const periodOptions: { label: string; value: NonNullable<PeriodParams["period"]> }[] = [
  { label: "This month", value: "thisMonth" },
  { label: "This year", value: "thisYear" },
  { label: "Last year", value: "lastYear" },
];

export default function RevenuePage() {
  const [period, setPeriod] = React.useState<NonNullable<PeriodParams["period"]>>("thisMonth");
  const [search, setSearch] = React.useState("");
  const [exportOpen, setExportOpen] = React.useState(false);

  const revenueQuery = useQuery({
    queryKey: ["dashboard", "revenue-by-payment", period],
    queryFn: () => getRevenueByPayment({ period }),
  });

  React.useEffect(() => {
    if (!revenueQuery.error) return;
    toast.error(getErrorMessage(revenueQuery.error, "Failed to load revenue"));
  }, [revenueQuery.error]);

  const filteredRows = React.useMemo(() => {
    const rows = revenueQuery.data?.data || [];
    if (!search.trim()) return rows;

    const term = search.toLowerCase();
    return rows.filter((item) => item.paymentTypeName.toLowerCase().includes(term));
  }, [revenueQuery.data?.data, search]);

  const { page, setPage, totalPages, totalItems, items } = usePagination(filteredRows, ITEMS_PER_PAGE);

  React.useEffect(() => {
    setPage(1);
  }, [period, search, setPage]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Revenue"
        description="See revenue by payment type for the selected period."
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
        {revenueQuery.isLoading ? (
          <TableSkeleton headers={["Type of Payment", "Total", "% of all Items"]} rows={ITEMS_PER_PAGE} />
        ) : (
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
                <TableRow key={`${item.paymentTypeId}-${item.paymentTypeName}`}>
                  <TableCell className="font-medium">{item.paymentTypeName}</TableCell>
                  <TableCell>{formatCurrency(item.total)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Progress
                        value={Math.min(item.percent, 100)}
                        indicatorClassName={item.percent >= 50 ? "bg-[#22c55e]" : "bg-[#ef4444]"}
                      />
                      <span className="text-xs text-[#4d4332]">{item.percent}%</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <TableFooter
          search={search}
          onSearchChange={setSearch}
          totalLabel="Total of all"
          totalValue={`${totalItems} Payments`}
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setPage}
        />
      </Card>

      <ExportDialog open={exportOpen} onOpenChange={setExportOpen} title="Export" subtitle="Revenue" />
    </div>
  );
}
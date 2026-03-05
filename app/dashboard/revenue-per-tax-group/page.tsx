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
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getRevenueByTaxGroup, type PeriodParams } from "@/lib/api";
import { getErrorMessage } from "@/lib/error";
import { formatCurrency } from "@/lib/format";

const ITEMS_PER_PAGE = 12;
const periodOptions: { label: string; value: NonNullable<PeriodParams["period"]> }[] = [
  { label: "This month", value: "thisMonth" },
  { label: "This year", value: "thisYear" },
  { label: "Last year", value: "lastYear" },
];

export default function RevenuePerTaxGroupPage() {
  const [period, setPeriod] = React.useState<NonNullable<PeriodParams["period"]>>("thisMonth");
  const [search, setSearch] = React.useState("");
  const [exportOpen, setExportOpen] = React.useState(false);

  const taxGroupQuery = useQuery({
    queryKey: ["dashboard", "revenue-tax-group", period],
    queryFn: () => getRevenueByTaxGroup({ period }),
  });

  React.useEffect(() => {
    if (!taxGroupQuery.error) return;
    toast.error(getErrorMessage(taxGroupQuery.error, "Failed to load tax group revenue"));
  }, [taxGroupQuery.error]);

  const filteredRows = React.useMemo(() => {
    const rows = taxGroupQuery.data?.data || [];
    if (!search.trim()) return rows;

    const term = search.toLowerCase();
    return rows.filter((item) => item.taxGroup.toLowerCase().includes(term));
  }, [taxGroupQuery.data?.data, search]);

  const { page, setPage, totalPages, totalItems, items } = usePagination(filteredRows, ITEMS_PER_PAGE);

  React.useEffect(() => {
    setPage(1);
  }, [period, search, setPage]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Revenue per tax group"
        description="See revenue information grouped by tax tags and tax amount."
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
        {taxGroupQuery.isLoading ? (
          <TableSkeleton headers={["Name of tax group", "Total total", "Total amount of tax"]} rows={ITEMS_PER_PAGE} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name of tax group</TableHead>
                <TableHead>Total total</TableHead>
                <TableHead className="text-right">Total amount of tax</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={`${item.taxGroup}-${index}`}>
                  <TableCell className="font-medium">{item.taxGroup}</TableCell>
                  <TableCell>{formatCurrency(item.total)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.taxAmount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <TableFooter
          search={search}
          onSearchChange={setSearch}
          totalLabel="Total of all"
          totalValue={`${totalItems} Tax Groups`}
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setPage}
        />
      </Card>

      <ExportDialog open={exportOpen} onOpenChange={setExportOpen} title="Export" subtitle="Revenue per tax group" />
    </div>
  );
}
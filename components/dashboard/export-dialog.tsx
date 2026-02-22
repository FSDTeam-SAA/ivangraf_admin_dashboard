"use client";

import * as React from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const exportOptions = ["Pdf", "Excel", "Docx"];

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle: string;
}

export function ExportDialog({ open, onOpenChange, title, subtitle }: ExportDialogProps) {
  const [selected, setSelected] = React.useState(exportOptions[0]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-8">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="text-[#c9841d]">
            {subtitle}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 rounded-2xl border border-[#f1e2c6] bg-[#fffaf0] p-5">
          <div className="space-y-4">
            {exportOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setSelected(option)}
                className={cn(
                  "flex w-full items-center justify-between rounded-xl border border-[#f1d6a4] bg-white px-4 py-3 text-left text-sm font-medium text-[#5f513a] shadow-sm",
                  selected === option && "ring-2 ring-[#d39a2f]"
                )}
              >
                <span>{option}</span>
                <span
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full border border-[#d39a2f]",
                    selected === option ? "bg-[#d39a2f]" : "bg-white"
                  )}
                >
                  {selected === option ? (
                    <span className="block h-2 w-2 rounded-full bg-white" />
                  ) : null}
                </span>
              </button>
            ))}
          </div>
          <div className="mt-6">
            <Button variant="gold" size="lg" className="w-full">
              Export Now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
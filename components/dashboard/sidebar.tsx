"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  PieChart,
  List,
  ClipboardList,
  ShoppingCart,
  Wallet,
  Percent,
  Users,
  Table2,
  Package,
  Receipt,
  Ban,
  Heart,
  LogOut,
} from "lucide-react";

import { cn } from "@/lib/utils";

const navItems = [
  { name: "Home", href: "/dashboard/home", icon: Home },
  { name: "Analytic", href: "/dashboard/analytic", icon: PieChart },
  { name: "All Items", href: "/dashboard/all-items", icon: List },
  { name: "Sales of items", href: "/dashboard/sales-of-items", icon: ClipboardList },
  { name: "List of spend Goods", href: "/dashboard/list-of-spend-goods", icon: ShoppingCart },
  { name: "Revenue", href: "/dashboard/revenue", icon: Wallet },
  { name: "Revenue per tax group", href: "/dashboard/revenue-per-tax-group", icon: Percent },
  { name: "Revenue Per Waiter", href: "/dashboard/revenue-per-waiter", icon: Users },
  { name: "Opens Tables", href: "/dashboard/opens-tables", icon: Table2 },
  { name: "Stock of Goods", href: "/dashboard/stock-of-goods", icon: Package },
  { name: "Bills", href: "/dashboard/bills", icon: Receipt },
  { name: "Cancel Orders", href: "/dashboard/cancel-orders", icon: Ban },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn("flex h-full flex-col gap-4 px-4 pb-6 pt-8", className)}
      style={{ backgroundColor: "rgba(255, 231, 169, 1)" }}
    >
      <nav className="flex flex-1 flex-col gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-[#2f2a21] transition",
                isActive
                  ? "bg-[#c99636] text-white shadow"
                  : "hover:bg-[#f0d28c]"
              )}
            >
              <span className="flex items-center gap-3">
                <Icon className={cn("h-4 w-4", isActive ? "text-white" : "text-[#2f2a21]")} />
                {item.name}
              </span>
              <Heart
                className={cn(
                  "h-4 w-4",
                  isActive ? "fill-white text-white" : "text-[#f4a021]"
                )}
              />
            </Link>
          );
        })}
      </nav>
      <Link
        href="/auth/login"
        className="flex items-center gap-3 px-3 py-2 text-sm font-semibold text-[#c93333]"
      >
        <LogOut className="h-4 w-4" />
        Logout
      </Link>
    </aside>
  );
}

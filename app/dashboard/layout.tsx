import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    // h-screen ensures the container never exceeds the viewport height
    <div className="flex h-screen flex-col bg-[var(--background)] overflow-hidden">
      
      {/* Topbar: Ensure height matches your calc (e.g., h-20 = 80px) */}
      <Topbar className="h-20 shrink-0" />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar: Fixed width, scrolls internally if needed */}
        <Sidebar className="w-[260px] shrink-0 border-r" />

        {/* Main Content: This is the only area that should scroll */}
        <main className="flex-1 overflow-y-auto bg-[#fdfaf5] px-8 py-6">
          <div className="">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
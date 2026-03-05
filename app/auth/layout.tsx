import { LogoBadge } from "@/components/dashboard/logo-badge";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#ececec] px-4 py-8 sm:px-6 md:py-12">
      <div className="mx-auto flex min-h-[85vh] w-full max-w-[760px] flex-col items-center justify-center gap-10">
        <LogoBadge className="rounded-lg shadow-sm sm:px-6 sm:py-4" />
        <div className="w-full max-w-[560px]">{children}</div>
      </div>
    </div>
  );
}
import { LogoBadge } from "@/components/dashboard/logo-badge";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    // Fixed height screen with no-scroll to keep it looking like an app
    <div className="min-h-screen bg-white overflow-hidden flex items-center justify-center">
      <div className="w-full max-w-[440px] flex flex-col items-center gap-10 px-8">
        <LogoBadge className="shadow-sm" />
        <div className="w-full">
          {children}
        </div>
      </div>
    </div>
  );
}
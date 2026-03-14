"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import { signIn } from "next-auth/react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard/home";

  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!username.trim() || !password) {
      toast.error("Username and password are required");
      return;
    }

    setIsSubmitting(true);

    const result = await signIn("credentials", {
      username: username.trim(),
      password,
      redirect: false,
    });

    setIsSubmitting(false);

    if (result?.error) {
      toast.error("Invalid credentials");
      return;
    }

    toast.success("Login successful");
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8 rounded-xl">
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-[18px] font-semibold text-[#4d4332] tracking-tight">User Name</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9ca3af]" />
            <Input
              className="h-12 border-[#9ca3af] bg-transparent pl-12 text-[15px] placeholder:text-[#9ca3af]"
              placeholder="Enter your User Name"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[18px] font-semibold text-[#4d4332] tracking-tight">Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9ca3af]" />
            <Input
              className="h-12 border-[#9ca3af] bg-transparent pl-12 pr-12 text-[15px] placeholder:text-[#9ca3af]"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9ca3af]"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      <div className="text-center text-sm text-[#7b6a48]">
        Forgot your password?{" "}
        <Link className="font-semibold text-[#c98c1f]" href="/auth/forgot-password">
          Reset here
        </Link>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="h-14 w-full rounded-lg border-none bg-gradient-to-b from-[#e3b34c] via-[#d4a035] to-[#c18a24] text-lg font-medium text-white shadow-md transition-opacity hover:opacity-90"
      >
        {isSubmitting ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}

"use client";

import Link from "next/link";
import { Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ResetPasswordPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold text-[#2f2a21]">
          <span className="font-[var(--font-display)]">Reset Password</span>
        </h1>
        <p className="text-sm text-[#7b6a48]">Choose a new password to secure your account.</p>
      </div>
      <div className="space-y-4">
        <label className="block text-sm font-semibold text-[#4d4332]">New Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a3916b]" />
          <Input className="pl-10" type="password" placeholder="Enter new password" />
        </div>
      </div>
      <div className="space-y-4">
        <label className="block text-sm font-semibold text-[#4d4332]">Confirm Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a3916b]" />
          <Input className="pl-10" type="password" placeholder="Confirm new password" />
        </div>
      </div>
      <Button variant="gold" size="lg" className="w-full">
        Update Password
      </Button>
      <div className="text-center text-sm text-[#7b6a48]">
        <Link className="font-semibold text-[#c98c1f]" href="/auth/login">
          Back to login
        </Link>
      </div>
    </div>
  );
}
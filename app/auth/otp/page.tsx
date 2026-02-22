"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function OtpPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold text-[#2f2a21]">
          <span className="font-[var(--font-display)]">Verify OTP</span>
        </h1>
        <p className="text-sm text-[#7b6a48]">
          Enter the 4-digit code sent to your email.
        </p>
      </div>
      <div className="flex justify-center gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Input
            key={index}
            className="h-12 w-12 text-center text-lg font-semibold"
            maxLength={1}
          />
        ))}
      </div>
      <Button variant="gold" size="lg" className="w-full">
        Verify & Continue
      </Button>
      <div className="text-center text-sm text-[#7b6a48]">
        Didn&apos;t receive a code?{" "}
        <Link className="font-semibold text-[#c98c1f]" href="/auth/forgot-password">
          Resend
        </Link>
      </div>
    </div>
  );
}
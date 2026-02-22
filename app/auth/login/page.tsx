"use client";

import { Eye, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-6">
        {/* User Name Field */}
        <div className="space-y-2">
          <label className="text-[17px] font-semibold text-[#4d4332] tracking-tight">
            User Name
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#9ca3af]" />
            <Input
              className="h-12 pl-12 border-[#9ca3af] rounded-lg placeholder:text-[#9ca3af]"
              placeholder="Enter your User Name"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <label className="text-[17px] font-semibold text-[#4d4332] tracking-tight">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#9ca3af]" />
            <Input
              className="h-12 pl-12 pr-12 border-[#9ca3af] rounded-lg placeholder:text-[#9ca3af]"
              type="password"
              placeholder="Enter your Password"
            />
            <Eye className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#9ca3af] cursor-pointer" />
          </div>
        </div>
      </div>

      <div className="text-center text-sm text-[#7b6a48]">
        Forgot your password?{" "}
        <Link
          className="font-semibold text-[#c98c1f]"
          href="/auth/forgot-password"
        >
          Reset here
        </Link>
      </div>

      {/* Button with the specific Gold Gradient from the image */}
      <Button
        className="w-full h-14 text-lg font-medium rounded-lg text-white shadow-md
                   bg-gradient-to-b from-[#e3b34c] via-[#d4a035] to-[#c18a24] 
                   hover:opacity-90 transition-opacity border-none"
      >
        Sign in
      </Button>
    </div>
  );
}

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-sm hover:bg-[#c98c1f]",
        outline:
          "border border-[color:var(--border)] bg-white/70 text-foreground shadow-sm hover:bg-white",
        ghost: "text-foreground hover:bg-black/5",
        gold:
          "bg-gradient-to-b from-[#f2c86c] via-[#d39a2f] to-[#b97d14] text-white shadow-sm",
        soft:
          "bg-[#f9edd1] text-[#6f5b35] border border-[#e5d1a3] hover:bg-[#f6e2b7]",
        destructive: "bg-[#ef4444] text-white shadow-sm hover:bg-[#dc2626]",
        secondary: "bg-[#f3e6cd] text-[#6f5b35] hover:bg-[#ead9b8]",
        link: "text-[#c98c1f] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };

"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-sm hover:shadow-md",
        secondary:
          "border-transparent bg-gradient-to-r from-secondary-100 to-secondary-200 text-secondary-900 hover:from-secondary-200 hover:to-secondary-300",
        destructive:
          "border-transparent bg-gradient-to-r from-error-500 to-error-600 text-white shadow-sm hover:shadow-md",
        outline:
          "border-2 border-secondary-200 text-secondary-700 bg-white hover:bg-secondary-50 hover:border-secondary-300",
        success:
          "border-transparent bg-gradient-to-r from-success-500 to-success-600 text-white shadow-sm hover:shadow-md",
        warning:
          "border-transparent bg-gradient-to-r from-warning-500 to-warning-600 text-white shadow-sm hover:shadow-md",
        medical:
          "border-transparent bg-gradient-to-r from-medical-500 to-medical-600 text-white shadow-sm hover:shadow-md",
        accent:
          "border-transparent bg-gradient-to-r from-accent-500 to-accent-600 text-white shadow-sm hover:shadow-md",
        glass:
          "border-white/20 bg-white/80 backdrop-blur-md text-secondary-700 shadow-lg hover:bg-white/90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };

"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const enhancedButtonVariants = cva(
  "inline-flex items-center justify-center rounded-xl text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-r from-primary-500 to-medical-500 hover:from-primary-600 hover:to-medical-600 text-white shadow-lg hover:shadow-xl active:shadow-md",
        secondary:
          "bg-white border-2 border-primary-200 text-primary-700 hover:bg-primary-50 hover:border-primary-300 shadow-md hover:shadow-lg",
        medical:
          "bg-gradient-to-r from-medical-500 to-primary-500 hover:from-medical-600 hover:to-primary-600 text-white shadow-medical hover:shadow-xl",
        accent:
          "bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white shadow-lg hover:shadow-xl",
        success:
          "bg-gradient-to-r from-success-500 to-success-600 hover:from-success-600 hover:to-success-700 text-white shadow-lg hover:shadow-xl",
        warning:
          "bg-gradient-to-r from-warning-500 to-warning-600 hover:from-warning-600 hover:to-warning-700 text-white shadow-lg hover:shadow-xl",
        error:
          "bg-gradient-to-r from-error-500 to-error-600 hover:from-error-600 hover:to-error-700 text-white shadow-lg hover:shadow-xl",
        outline:
          "border-2 border-primary-200 bg-white/80 backdrop-blur-sm text-primary-700 hover:bg-primary-50 hover:border-primary-300 shadow-md hover:shadow-lg",
        ghost:
          "text-neutral-600 hover:bg-neutral-100/80 backdrop-blur-sm hover:text-neutral-900",
        link: "text-primary-600 underline-offset-4 hover:underline hover:text-primary-700",
        glass:
          "bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30 shadow-lg hover:shadow-xl",
      },
      size: {
        sm: "h-9 px-3 text-xs",
        default: "h-12 px-6 py-3",
        lg: "h-14 px-8 py-4 text-lg",
        xl: "h-16 px-12 py-5 text-xl",
        icon: "h-12 w-12",
      },
      animation: {
        none: "",
        scale: "transform hover:scale-105 active:scale-95",
        lift: "transform hover:-translate-y-1 active:translate-y-0",
        both: "transform hover:scale-105 hover:-translate-y-1 active:scale-95 active:translate-y-0",
      },
      glow: {
        none: "",
        subtle: "hover:shadow-glow-subtle",
        medium: "hover:shadow-glow",
        strong: "hover:shadow-glow-strong",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
      animation: "both",
      glow: "none",
    },
  }
);

export interface EnhancedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof enhancedButtonVariants> {
  asChild?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  gradient?: boolean;
  fullWidth?: boolean;
}

const EnhancedButton = React.forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  (
    {
      className,
      variant,
      size,
      animation,
      glow,
      asChild = false,
      loading,
      icon,
      iconPosition = "left",
      gradient = false,
      fullWidth = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const buttonContent = (
      <>
        {loading && <Loader2 className="mr-3 h-4 w-4 animate-spin" />}
        {icon && iconPosition === "left" && !loading && (
          <span className="mr-3 flex-shrink-0">{icon}</span>
        )}
        <span className={cn("font-semibold", fullWidth && "text-center")}>
          {children}
        </span>
        {icon && iconPosition === "right" && !loading && (
          <span className="ml-3 flex-shrink-0">{icon}</span>
        )}
      </>
    );

    const buttonClassName = cn(
      enhancedButtonVariants({
        variant,
        size,
        animation,
        glow,
        className,
      }),
      fullWidth && "w-full",
      loading && "cursor-not-allowed opacity-70"
    );

    if (asChild) {
      return (
        <Slot className={buttonClassName} ref={ref} {...props}>
          {children}
        </Slot>
      );
    }

    return (
      <motion.button
        className={buttonClassName}
        ref={ref}
        disabled={disabled || loading}
        whileHover={{ scale: animation?.includes("scale") ? 1.05 : 1 }}
        whileTap={{ scale: animation?.includes("scale") ? 0.95 : 1 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        {...props}
      >
        {buttonContent}
      </motion.button>
    );
  }
);

EnhancedButton.displayName = "EnhancedButton";

export { EnhancedButton, enhancedButtonVariants };

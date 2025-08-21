"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";

const enhancedCardVariants = cva(
  "rounded-2xl border transition-all duration-300 overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-white border-neutral-200 shadow-lg hover:shadow-xl",
        medical:
          "bg-gradient-to-br from-white to-medical-50 border-medical-100 shadow-medical hover:shadow-xl",
        glass:
          "bg-white/80 backdrop-blur-md border-white/20 shadow-2xl hover:bg-white/90",
        gradient:
          "bg-gradient-to-br from-white to-primary-50 border-primary-100 shadow-lg hover:shadow-xl",
        dark: "bg-gradient-to-br from-neutral-800 to-neutral-900 border-neutral-700 shadow-xl text-white",
        outline:
          "bg-transparent border-2 border-primary-200 hover:border-primary-300 hover:bg-primary-50/50",
      },
      hover: {
        none: "",
        lift: "hover:-translate-y-2",
        scale: "hover:scale-[1.02]",
        both: "hover:scale-[1.02] hover:-translate-y-2",
        glow: "hover:shadow-glow hover:border-primary-300",
      },
      padding: {
        none: "p-0",
        sm: "p-4",
        default: "p-6",
        lg: "p-8",
        xl: "p-10",
      },
      radius: {
        sm: "rounded-lg",
        default: "rounded-2xl",
        lg: "rounded-3xl",
        xl: "rounded-[2rem]",
      },
    },
    defaultVariants: {
      variant: "default",
      hover: "both",
      padding: "default",
      radius: "default",
    },
  }
);

export interface EnhancedCardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart' | 'onAnimationEnd'>,
    VariantProps<typeof enhancedCardVariants> {
  animated?: boolean;
  clickable?: boolean;
  loading?: boolean;
}

const EnhancedCard = React.forwardRef<HTMLDivElement, EnhancedCardProps>(
  (
    {
      className,
      variant,
      hover,
      padding,
      radius,
      animated = true,
      clickable = false,
      loading = false,
      children,
      ...props
    },
    ref
  ) => {
    const Component = animated ? motion.div : "div";

    const motionProps = animated
      ? {
          initial: { opacity: 0, y: 20 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true },
          transition: { duration: 0.5, ease: "easeOut" },
          whileHover: hover?.includes("scale") ? { scale: 1.02 } : undefined,
        }
      : {};

    return (
      <Component
        ref={ref}
        className={cn(
          enhancedCardVariants({ variant, hover, padding, radius, className }),
          clickable && "cursor-pointer",
          loading && "animate-pulse"
        )}
        {...motionProps}
        {...props}
      >
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
          </div>
        ) : (
          children
        )}
      </Component>
    );
  }
);

EnhancedCard.displayName = "EnhancedCard";

const EnhancedCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    centered?: boolean;
  }
>(({ className, centered = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col space-y-1.5 p-6",
      centered && "text-center items-center",
      className
    )}
    {...props}
  />
));
EnhancedCardHeader.displayName = "EnhancedCardHeader";

const EnhancedCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement> & {
    gradient?: boolean;
  }
>(({ className, gradient = false, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-bold leading-none tracking-tight",
      gradient
        ? "bg-gradient-to-r from-primary-600 to-medical-600 bg-clip-text text-transparent"
        : "text-neutral-900",
      className
    )}
    {...props}
  />
));
EnhancedCardTitle.displayName = "EnhancedCardTitle";

const EnhancedCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-neutral-600 leading-relaxed", className)}
    {...props}
  />
));
EnhancedCardDescription.displayName = "EnhancedCardDescription";

const EnhancedCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
EnhancedCardContent.displayName = "EnhancedCardContent";

const EnhancedCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    centered?: boolean;
  }
>(({ className, centered = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center p-6 pt-0",
      centered && "justify-center",
      className
    )}
    {...props}
  />
));
EnhancedCardFooter.displayName = "EnhancedCardFooter";

export {
  EnhancedCard,
  EnhancedCardHeader,
  EnhancedCardFooter,
  EnhancedCardTitle,
  EnhancedCardDescription,
  EnhancedCardContent,
  enhancedCardVariants,
};

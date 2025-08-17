"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, type, label, error, icon, iconPosition = "left", ...props },
    ref
  ) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const [hasValue, setHasValue] = React.useState(false);

    const handleFocus = () => setIsFocused(true);
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      setHasValue(e.target.value !== "");
      props.onBlur?.(e);
    };

    React.useEffect(() => {
      if (props.value) {
        setHasValue(true);
      }
    }, [props.value]);

    return (
      <div className="space-y-2">
        <div className="relative">
          {label && (
            <label
              className={cn(
                "absolute left-3 text-sm font-medium transition-all duration-200 pointer-events-none z-10",
                isFocused || hasValue
                  ? "top-2 text-xs text-primary-600 scale-85 -translate-y-1"
                  : "top-4 text-secondary-500",
                icon && iconPosition === "left" && "left-11"
              )}
            >
              {label}
            </label>
          )}

          {icon && iconPosition === "left" && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 z-10">
              {icon}
            </div>
          )}

          <input
            type={type}
            className={cn(
              "flex h-14 w-full rounded-xl border-2 border-secondary-200 bg-white px-4 py-3 text-sm text-secondary-900 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-secondary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-100 focus-visible:ring-offset-0 focus-visible:border-primary-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 focus:scale-[1.01] hover:border-secondary-300",
              error &&
                "border-error-500 focus-visible:ring-error-100 focus-visible:border-error-500",
              icon && iconPosition === "left" && "pl-11",
              icon && iconPosition === "right" && "pr-11",
              label && "pt-6 pb-2",
              className
            )}
            ref={ref}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={(e) => {
              setHasValue(e.target.value !== "");
              props.onChange?.(e);
            }}
            {...props}
          />

          {icon && iconPosition === "right" && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400">
              {icon}
            </div>
          )}
        </div>

        {error && (
          <p className="text-sm text-error-600 font-medium animate-slide-down">
            {error}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };

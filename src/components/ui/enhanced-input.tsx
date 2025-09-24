"use client";

import { forwardRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface EnhancedInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
  variant?: "default" | "outline" | "ghost";
  inputSize?: "sm" | "md" | "lg";
  showPasswordToggle?: boolean;
  helpText?: string;
}

const EnhancedInput = forwardRef<HTMLInputElement, EnhancedInputProps>(
  (
    {
      className,
      type,
      label,
      icon,
      error,
      variant = "default",
      inputSize = "md",
      showPasswordToggle = false,
      helpText,
      style,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const inputType = showPasswordToggle && showPassword ? "text" : type;

    const baseStyles = "w-full rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2";
    
    const variantStyles = {
      default: "border-gray-300 bg-white focus:border-blue-500 focus:ring-blue-500/20",
      outline: "border-gray-200 bg-transparent focus:border-blue-500 focus:ring-blue-500/20",
      ghost: "border-transparent bg-gray-50 focus:border-blue-500 focus:bg-white focus:ring-blue-500/20",
    };

    const sizeStyles = {
      sm: "px-3 py-2 text-sm",
      md: "px-4 py-3 text-base",
      lg: "px-4 py-4 text-lg",
    };

    const errorStyles = error
      ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
      : "";

    // Custom styles for login page inputs
    const customInputStyles = style ? {
      color: (style as any)['--input-color'] || 'inherit',
      fontWeight: (style as any)['--input-font-weight'] || 'normal',
    } : {};

    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
          
          <input
            type={inputType}
            className={cn(
              baseStyles,
              variantStyles[variant],
              sizeStyles[inputSize],
              errorStyles,
              icon ? "pl-10" : "",
              showPasswordToggle ? "pr-12" : "",
              className
            )}
            style={{
              ...customInputStyles,
              ...style
            }}
            ref={ref}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />
          
          {showPasswordToggle && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? (
                // EyeOff inline SVG
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5"
                >
                  <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-5 0-9.27-3.11-11-8 1.01-2.93 3.05-5.26 5.65-6.71" />
                  <path d="M1 1l22 22" />
                  <path d="M10.58 10.58a2 2 0 0 0 2.84 2.84" />
                  <path d="M9.88 4.24A10.94 10.94 0 0 1 12 4c5 0 9.27 3.11 11 8a11.18 11.18 0 0 1-4.12 5.06" />
                </svg>
              ) : (
                // Eye inline SVG
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          )}
        </div>
        
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
        
        {helpText && !error && (
          <p className="text-sm text-gray-500">{helpText}</p>
        )}
      </div>
    );
  }
);

EnhancedInput.displayName = "EnhancedInput";

export { EnhancedInput };
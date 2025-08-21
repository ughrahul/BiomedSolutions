// Comprehensive Design System for Biomed Solutions
// Professional Medical Theme with Consistent Colors, Typography, and Components

export const designSystem = {
  // Color Palette - Medical Professional Theme
  colors: {
    primary: {
      50: "#f0f9ff",
      100: "#e0f2fe",
      200: "#bae6fd",
      300: "#7dd3fc",
      400: "#38bdf8",
      500: "#0ea5e9",
      600: "#0284c7",
      700: "#0369a1",
      800: "#075985",
      900: "#0c4a6e",
    },
    medical: {
      50: "#f0fdfa",
      100: "#ccfbf1",
      200: "#99f6e4",
      300: "#5eead4",
      400: "#2dd4bf",
      500: "#14b8a6",
      600: "#0d9488",
      700: "#0f766e",
      800: "#115e59",
      900: "#134e4a",
    },
    accent: {
      50: "#fdf4ff",
      100: "#fae8ff",
      200: "#f5d0fe",
      300: "#f0abfc",
      400: "#e879f9",
      500: "#d946ef",
      600: "#c026d3",
      700: "#a21caf",
      800: "#86198f",
      900: "#701a75",
    },
    success: {
      50: "#f0fdf4",
      100: "#dcfce7",
      200: "#bbf7d0",
      300: "#86efac",
      400: "#4ade80",
      500: "#22c55e",
      600: "#16a34a",
      700: "#15803d",
      800: "#166534",
      900: "#14532d",
    },
    warning: {
      50: "#fffbeb",
      100: "#fef3c7",
      200: "#fde68a",
      300: "#fcd34d",
      400: "#fbbf24",
      500: "#f59e0b",
      600: "#d97706",
      700: "#b45309",
      800: "#92400e",
      900: "#78350f",
    },
    error: {
      50: "#fef2f2",
      100: "#fee2e2",
      200: "#fecaca",
      300: "#fca5a5",
      400: "#f87171",
      500: "#ef4444",
      600: "#dc2626",
      700: "#b91c1c",
      800: "#991b1b",
      900: "#7f1d1d",
    },
    neutral: {
      50: "#fafafa",
      100: "#f5f5f5",
      200: "#e5e5e5",
      300: "#d4d4d4",
      400: "#a3a3a3",
      500: "#737373",
      600: "#525252",
      700: "#404040",
      800: "#262626",
      900: "#171717",
    },
  },

  // Typography Scale
  typography: {
    fontFamily: {
      primary: "Inter, system-ui, sans-serif",
      secondary: "Poppins, sans-serif",
      mono: "JetBrains Mono, monospace",
    },
    fontSize: {
      xs: "0.75rem", // 12px
      sm: "0.875rem", // 14px
      base: "1rem", // 16px
      lg: "1.125rem", // 18px
      xl: "1.25rem", // 20px
      "2xl": "1.5rem", // 24px
      "3xl": "1.875rem", // 30px
      "4xl": "2.25rem", // 36px
      "5xl": "3rem", // 48px
      "6xl": "3.75rem", // 60px
    },
    fontWeight: {
      light: "300",
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
      extrabold: "800",
    },
    lineHeight: {
      tight: "1.25",
      normal: "1.5",
      relaxed: "1.75",
    },
  },

  // Spacing Scale
  spacing: {
    px: "1px",
    0: "0",
    1: "0.25rem", // 4px
    2: "0.5rem", // 8px
    3: "0.75rem", // 12px
    4: "1rem", // 16px
    5: "1.25rem", // 20px
    6: "1.5rem", // 24px
    8: "2rem", // 32px
    10: "2.5rem", // 40px
    12: "3rem", // 48px
    16: "4rem", // 64px
    20: "5rem", // 80px
    24: "6rem", // 96px
    32: "8rem", // 128px
  },

  // Border Radius
  borderRadius: {
    none: "0",
    sm: "0.25rem", // 4px
    md: "0.375rem", // 6px
    lg: "0.5rem", // 8px
    xl: "0.75rem", // 12px
    "2xl": "1rem", // 16px
    "3xl": "1.5rem", // 24px
    full: "9999px",
  },

  // Shadows
  boxShadow: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
    "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
    inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
    medical: "0 4px 20px rgb(20 184 166 / 0.15)",
    primary: "0 4px 20px rgb(14 165 233 / 0.15)",
    glow: "0 0 20px rgb(59 130 246 / 0.3)",
  },

  // Animation Durations
  animation: {
    duration: {
      fast: "150ms",
      normal: "300ms",
      slow: "500ms",
      slower: "800ms",
    },
    easing: {
      ease: "cubic-bezier(0.4, 0, 0.2, 1)",
      easeIn: "cubic-bezier(0.4, 0, 1, 1)",
      easeOut: "cubic-bezier(0, 0, 0.2, 1)",
      easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
      spring: "cubic-bezier(0.16, 1, 0.3, 1)",
    },
  },

  // Breakpoints
  breakpoints: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },

  // Component Patterns
  patterns: {
    card: {
      base: "bg-white rounded-2xl shadow-lg border border-neutral-200 overflow-hidden transition-all duration-300",
      hover: "hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1",
      glass: "bg-white/80 backdrop-blur-md border-white/20 shadow-2xl",
      medical:
        "bg-gradient-to-br from-white to-medical-50 border-medical-100 shadow-medical",
    },
    button: {
      primary:
        "bg-gradient-to-r from-primary-500 to-medical-500 hover:from-primary-600 hover:to-medical-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-300",
      secondary:
        "bg-white border-2 border-primary-200 text-primary-700 hover:bg-primary-50 hover:border-primary-300 transform hover:scale-105 transition-all duration-300",
      ghost:
        "text-neutral-600 hover:bg-neutral-100/80 backdrop-blur-sm transition-all duration-300",
      medical:
        "bg-gradient-to-r from-medical-500 to-primary-500 hover:from-medical-600 hover:to-primary-600 text-white shadow-medical hover:shadow-xl transform hover:scale-105 transition-all duration-300",
    },
    input: {
      base: "w-full px-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all duration-300 bg-white",
      error: "border-error-500 focus:border-error-500 focus:ring-error-100",
      success:
        "border-success-500 focus:border-success-500 focus:ring-success-100",
    },
    gradient: {
      primary: "bg-gradient-to-r from-primary-500 to-medical-500",
      secondary: "bg-gradient-to-r from-accent-500 to-primary-500",
      medical: "bg-gradient-to-br from-medical-50 via-white to-primary-50",
      dark: "bg-gradient-to-br from-neutral-900 via-primary-900 to-medical-900",
      text: "bg-gradient-to-r from-primary-600 to-medical-600 bg-clip-text text-transparent",
    },
  },
};

// Component Variants
export const componentVariants = {
  button: {
    primary: designSystem.patterns.button.primary,
    secondary: designSystem.patterns.button.secondary,
    ghost: designSystem.patterns.button.ghost,
    medical: designSystem.patterns.button.medical,
  },
  card: {
    default: designSystem.patterns.card.base,
    hover: `${designSystem.patterns.card.base} ${designSystem.patterns.card.hover}`,
    glass: designSystem.patterns.card.glass,
    medical: designSystem.patterns.card.medical,
  },
  input: {
    default: designSystem.patterns.input.base,
    error: `${designSystem.patterns.input.base} ${designSystem.patterns.input.error}`,
    success: `${designSystem.patterns.input.base} ${designSystem.patterns.input.success}`,
  },
};

// Utility Functions
export const getColor = (color: string, shade: number = 500) => {
  const [colorName, colorShade] = color.includes("-")
    ? color.split("-")
    : [color, shade.toString()];
  return (
    designSystem.colors[colorName as keyof typeof designSystem.colors]?.[
      colorShade as unknown as keyof (typeof designSystem.colors.primary)
    ] || color
  );
};

export const getSpacing = (size: string | number) => {
  return (
    designSystem.spacing[size as keyof typeof designSystem.spacing] ||
    `${size}px`
  );
};

export const getTypography = (
  property: "fontSize" | "fontWeight" | "lineHeight",
  value: string
) => {
  return (
    designSystem.typography[property][
      value as unknown as keyof (typeof designSystem.typography)[typeof property]
    ] || value
  );
};

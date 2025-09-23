import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}



// Generate SKU (Stock Keeping Unit) for products
export function generateSKU(productName: string, categorySlug: string): string {
  // Clean and format the product name
  const cleanName = productName
    .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .toUpperCase()
    .substring(0, 8); // Limit to 8 characters
  
  // Clean and format the category slug
  const cleanCategory = categorySlug
    .replace(/[^a-zA-Z0-9]/g, '') // Remove special characters
    .toUpperCase()
    .substring(0, 4); // Limit to 4 characters
  
  // Generate a timestamp-based suffix
  const timestamp = Date.now().toString().slice(-4);
  
  // Combine: NAME-CAT-TIMESTAMP
  return `${cleanName}-${cleanCategory}-${timestamp}`;
}

// Format date in a user-friendly way
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  );

  if (diffInHours < 24) {
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60)
      );
      return `${diffInMinutes} min ago`;
    }
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
  } else {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
}

// Format currency for display
export function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}



// Suppress console errors and warnings for browser extensions and development tools
export function suppressMapsErrors() {
  if (typeof window !== 'undefined') {
    // Override console.error to suppress common development errors
    const originalError = console.error;
    console.error = function(...args) {
      // Check if any argument contains the error message
      const hasSuppressibleError = args.some(arg => {
        if (typeof arg === 'string') {
          const errorMessage = arg.toLowerCase();
          return errorMessage.includes('runtime.lasterror') ||
                 errorMessage.includes('err_blocked_by_client') ||
                 errorMessage.includes('maps.googleapis.com') ||
                 errorMessage.includes('message port closed') ||
                 errorMessage.includes('unchecked runtime.lasterror') ||
                 errorMessage.includes('google maps') ||
                 errorMessage.includes('maps.google') ||
                 errorMessage.includes('chrome-extension') ||
                 errorMessage.includes('moz-extension') ||
                 errorMessage.includes('safari-extension') ||
                 errorMessage.includes('extension') ||
                 errorMessage.includes('port closed') ||
                 errorMessage.includes('auth session missing') ||
                 errorMessage.includes('authsessionmissingerror');
        }
        return false;
      });
      
      if (hasSuppressibleError) {
        return; // Suppress these errors
      }
      
      originalError.apply(console, args);
    };

    // Override console.warn to suppress common development warnings
    const originalWarn = console.warn;
    console.warn = function(...args) {
      // Check if any argument contains the warning message
      const hasSuppressibleWarning = args.some(arg => {
        if (typeof arg === 'string') {
          const warnMessage = arg.toLowerCase();
          return warnMessage.includes('google maps') ||
                 warnMessage.includes('maps.google') ||
                 warnMessage.includes('embed') ||
                 warnMessage.includes('maps api') ||
                 warnMessage.includes('chrome-extension') ||
                 warnMessage.includes('moz-extension') ||
                 warnMessage.includes('safari-extension') ||
                 warnMessage.includes('extension') ||
                 warnMessage.includes('port closed') ||
                 warnMessage.includes('auth session missing') ||
                 warnMessage.includes('authsessionmissingerror');
        }
        return false;
      });
      
      if (hasSuppressibleWarning) {
        return; // Suppress these warnings
      }
      
      originalWarn.apply(console, args);
    };
  }
}

// Utility function to handle auth session missing errors
export function isAuthSessionMissingError(error: any): boolean {
  if (!error) return false;
  
  const errorMessage = error.message || error.toString() || '';
  return errorMessage.toLowerCase().includes('auth session missing') ||
         errorMessage.toLowerCase().includes('authsessionmissingerror');
}

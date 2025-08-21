import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function truncateText(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.substring(0, length).trim() + "...";
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function generateSKU(productName: string, categorySlug: string): string {
  const nameCode = productName
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase())
    .join("")
    .substring(0, 3);

  const categoryCode = categorySlug.substring(0, 3).toUpperCase();
  const randomNum = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");

  return `${categoryCode}-${nameCode}-${randomNum}`;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^[+]?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
}

export function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

export function compressImage(
  file: File,
  quality: number = 0.8
): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => {
          const compressedFile = new File([blob!], file.name, {
            type: file.type,
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        },
        file.type,
        quality
      );
    };

    img.src = URL.createObjectURL(file);
  });
}

export function isValidImageType(file: File): boolean {
  const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  return validTypes.includes(file.type);
}

export function getFileSize(bytes: number): string {
  const sizes = ["Bytes", "KB", "MB", "GB"];
  if (bytes === 0) return "0 Bytes";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
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
                 errorMessage.includes('runtime.lasterror') ||
                 errorMessage.includes('err_blocked_by_client') ||
                 errorMessage.includes('maps.googleapis.com') ||
                 errorMessage.includes('message port closed') ||
                 errorMessage.includes('the message port closed before a response was received') ||
                 errorMessage.includes('unchecked runtime.lasterror') ||
                 errorMessage.includes('google maps') ||
                 errorMessage.includes('maps.google') ||
                 errorMessage.includes('chrome-extension') ||
                 errorMessage.includes('moz-extension') ||
                 errorMessage.includes('safari-extension') ||
                 errorMessage.includes('extension') ||
                 errorMessage.includes('port closed');
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
                 warnMessage.includes('port closed');
        }
        return false;
      });
      
      if (hasSuppressibleWarning) {
        return; // Suppress these warnings
      }
      
      originalWarn.apply(console, args);
    };

    // Add global error event listener to catch unhandled errors
    const originalOnError = window.onerror;
    window.onerror = function(message, source, lineno, colno, error) {
      if (typeof message === 'string') {
        const errorMessage = message.toLowerCase();
        if (errorMessage.includes('runtime.lasterror') ||
            errorMessage.includes('message port closed') ||
            errorMessage.includes('the message port closed before a response was received') ||
            errorMessage.includes('unchecked runtime.lasterror') ||
            errorMessage.includes('extension') ||
            errorMessage.includes('port closed')) {
          return true; // Prevent default error handling
        }
      }
      
      // Call original error handler if it exists
      if (originalOnError) {
        return originalOnError(message, source, lineno, colno, error);
      }
      return false;
    };

    // Add unhandled promise rejection handler
    const originalOnUnhandledRejection = window.onunhandledrejection;
    window.onunhandledrejection = function(event) {
      if (event.reason && typeof event.reason === 'string') {
        const errorMessage = event.reason.toLowerCase();
        if (errorMessage.includes('runtime.lasterror') ||
            errorMessage.includes('message port closed') ||
            errorMessage.includes('the message port closed before a response was received') ||
            errorMessage.includes('unchecked runtime.lasterror') ||
            errorMessage.includes('extension') ||
            errorMessage.includes('port closed')) {
          event.preventDefault(); // Prevent default handling
          return;
        }
      }
      
      // Call original handler if it exists
      if (originalOnUnhandledRejection) {
        originalOnUnhandledRejection.call(window, event);
      }
    };
  }
}

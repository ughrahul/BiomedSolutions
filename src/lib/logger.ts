/**
 * Safe logger utility that only logs in development
 * Replaces console statements throughout the codebase
 */

/* eslint-disable no-console */

type LogLevel = "log" | "warn" | "error" | "info" | "debug";

interface Logger {
  log: (message: string, ...args: any[]) => void;
  warn: (message: string, ...args: any[]) => void;
  error: (message: string, ...args: any[]) => void;
  info: (message: string, ...args: any[]) => void;
  debug: (message: string, ...args: any[]) => void;
}

const createLogger = (): Logger => {
  const isDevelopment = process.env.NODE_ENV === "development";

  const noop = () => {};

  return {
    log: isDevelopment ? console.log.bind(console) : noop,
    warn: isDevelopment ? console.warn.bind(console) : noop,
    error: isDevelopment ? console.error.bind(console) : noop,
    info: isDevelopment ? console.info.bind(console) : noop,
    debug: isDevelopment ? console.debug.bind(console) : noop,
  };
};

export const logger = createLogger();

// For server-side logging (always enabled for debugging)
export const serverLogger = {
  log: console.log.bind(console),
  warn: console.warn.bind(console),
  error: console.error.bind(console),
  info: console.info.bind(console),
  debug: console.debug.bind(console),
};

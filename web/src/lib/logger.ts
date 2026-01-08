/**
 * Centralized Logging Utility
 * Only logs in development mode, silent in production
 */

const isDevelopment = process.env.NODE_ENV === 'development'

/**
 * Log error messages (only in development)
 */
export function logError(...args: unknown[]): void {
  if (isDevelopment) {
    console.error(...args)
  }
}

/**
 * Log warning messages (only in development)
 */
export function logWarn(...args: unknown[]): void {
  if (isDevelopment) {
    console.warn(...args)
  }
}

/**
 * Log info messages (only in development)
 */
export function logInfo(...args: unknown[]): void {
  if (isDevelopment) {
    console.log(...args)
  }
}

/**
 * Log debug messages (only in development)
 */
export function logDebug(...args: unknown[]): void {
  if (isDevelopment) {
    console.debug(...args)
  }
}

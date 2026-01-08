/**
 * Centralized Logging Utility
 * Production: only errors and warnings
 * Development: all logs
 */

const isDevelopment = process.env.NODE_ENV === 'development'
const isProduction = process.env.NODE_ENV === 'production'

/**
 * Log error messages (always logged in production)
 */
export function logError(...args: unknown[]): void {
  if (isDevelopment || isProduction) {
    console.error('[ERROR]', new Date().toISOString(), ...args)
  }
}

/**
 * Log warning messages (always logged in production)
 */
export function logWarn(...args: unknown[]): void {
  if (isDevelopment || isProduction) {
    console.warn('[WARN]', new Date().toISOString(), ...args)
  }
}

/**
 * Log info messages (only in development)
 */
export function logInfo(...args: unknown[]): void {
  if (isDevelopment) {
    console.log('[INFO]', new Date().toISOString(), ...args)
  }
}

/**
 * Log debug messages (only in development)
 */
export function logDebug(...args: unknown[]): void {
  if (isDevelopment) {
    console.debug('[DEBUG]', new Date().toISOString(), ...args)
  }
}

/**
 * Log performance metrics (response time, etc.)
 * Always logged in production for monitoring
 */
export function logPerformance(metric: string, value: number, unit: string = 'ms'): void {
  if (isProduction) {
    console.log(`[PERF] ${metric}: ${value}${unit}`)
  } else if (isDevelopment) {
    console.log(`[PERF] ${metric}: ${value}${unit}`)
  }
}

/**
 * Log API request/response with timing
 */
export function logApiRequest(
  method: string,
  path: string,
  statusCode: number,
  duration: number
): void {
  const logLevel = statusCode >= 500 ? 'ERROR' : statusCode >= 400 ? 'WARN' : 'INFO'
  const message = `${method} ${path} ${statusCode} ${duration}ms`
  
  if (logLevel === 'ERROR' || logLevel === 'WARN') {
    logWarn('[API]', message)
  } else if (isDevelopment) {
    logInfo('[API]', message)
  }
  
  // Always log slow requests (>1s) in production
  if (isProduction && duration > 1000) {
    logWarn('[API SLOW]', `${method} ${path} took ${duration}ms`)
  }
}

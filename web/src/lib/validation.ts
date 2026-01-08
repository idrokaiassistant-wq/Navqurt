/**
 * Validation Utilities
 */

export interface ValidationResult {
  valid: boolean
  error?: string
}

/**
 * Safe parseInt with NaN check
 */
export function parseIntSafe(value: unknown, fieldName: string = 'value'): { valid: boolean; value?: number; error?: string } {
  if (value === null || value === undefined || value === '') {
    return { valid: false, error: `${fieldName} majburiy` }
  }

  const parsed = typeof value === 'number' ? value : Number(value)
  
  if (isNaN(parsed)) {
    return { valid: false, error: `${fieldName} to'g'ri son emas` }
  }

  if (!Number.isInteger(parsed)) {
    return { valid: false, error: `${fieldName} butun son bo'lishi kerak` }
  }

  return { valid: true, value: parsed }
}

/**
 * Safe parseFloat with NaN check
 */
export function parseFloatSafe(value: unknown, fieldName: string = 'value'): { valid: boolean; value?: number; error?: string } {
  if (value === null || value === undefined || value === '') {
    return { valid: false, error: `${fieldName} majburiy` }
  }

  const parsed = typeof value === 'number' ? value : Number(value)
  
  if (isNaN(parsed)) {
    return { valid: false, error: `${fieldName} to'g'ri son emas` }
  }

  return { valid: true, value: parsed }
}

/**
 * Validate required fields
 */
export function validateRequired(value: unknown, fieldName: string): ValidationResult {
  if (value === null || value === undefined || value === '') {
    return { valid: false, error: `${fieldName} majburiy` }
  }

  if (typeof value === 'string' && value.trim() === '') {
    return { valid: false, error: `${fieldName} majburiy` }
  }

  return { valid: true }
}

/**
 * Validate email format
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email majburiy' }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  if (!emailRegex.test(email.trim())) {
    return { valid: false, error: 'Email formati noto\'g\'ri' }
  }

  return { valid: true }
}

/**
 * Validate string length
 */
export function validateStringLength(value: string, min: number, max: number, fieldName: string = 'value'): ValidationResult {
  if (typeof value !== 'string') {
    return { valid: false, error: `${fieldName} string bo'lishi kerak` }
  }

  const length = value.trim().length

  if (length < min) {
    return { valid: false, error: `${fieldName} kamida ${min} belgi bo'lishi kerak` }
  }

  if (length > max) {
    return { valid: false, error: `${fieldName} ko'pi bilan ${max} belgi bo'lishi kerak` }
  }

  return { valid: true }
}

/**
 * Validate array
 */
export function validateArray<T>(value: unknown, fieldName: string = 'value'): ValidationResult & { value?: T[] } {
  if (!Array.isArray(value)) {
    return { valid: false, error: `${fieldName} array bo'lishi kerak` }
  }

  return { valid: true, value: value as T[] }
}

/**
 * Validate enum value
 */
export function validateEnum<T extends string>(value: unknown, validValues: readonly T[], fieldName: string = 'value'): ValidationResult & { value?: T } {
  if (typeof value !== 'string') {
    return { valid: false, error: `${fieldName} string bo'lishi kerak` }
  }

  if (!validValues.includes(value as T)) {
    return { valid: false, error: `${fieldName} quyidagi qiymatlardan biri bo'lishi kerak: ${validValues.join(', ')}` }
  }

  return { valid: true, value: value as T }
}

/**
 * Validate positive number
 */
export function validatePositiveNumber(value: number, fieldName: string = 'value'): ValidationResult {
  if (typeof value !== 'number' || isNaN(value)) {
    return { valid: false, error: `${fieldName} son bo'lishi kerak` }
  }

  if (value <= 0) {
    return { valid: false, error: `${fieldName} musbat son bo'lishi kerak` }
  }

  return { valid: true }
}

/**
 * Validate non-negative number
 */
export function validateNonNegativeNumber(value: number, fieldName: string = 'value'): ValidationResult {
  if (typeof value !== 'number' || isNaN(value)) {
    return { valid: false, error: `${fieldName} son bo'lishi kerak` }
  }

  if (value < 0) {
    return { valid: false, error: `${fieldName} manfiy bo'lishi mumkin emas` }
  }

  return { valid: true }
}


/**
 * Application Constants
 * Centralized place for all hardcoded values
 */

/**
 * Default email domain for admin login
 */
export const DEFAULT_EMAIL_DOMAIN = "@navqurt.uz"

/**
 * Default admin email (used in seed)
 */
export const DEFAULT_ADMIN_EMAIL = "admin@navqurt.uz"

/**
 * LocalStorage keys
 */
export const STORAGE_KEYS = {
  NOTIFICATIONS: "navqurt_notifications",
  THEME: "navqurt-theme"
} as const

/**
 * Password validation
 */
export const PASSWORD_MIN_LENGTH = 6

/**
 * Notification settings default values
 */
export const DEFAULT_NOTIFICATIONS = {
  newOrders: true,
  deliveredOrders: true,
  newCustomers: false,
  systemUpdates: true
} as const

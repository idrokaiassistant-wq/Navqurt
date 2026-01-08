/**
 * Environment Variables and Configuration Validation
 */

interface CloudinaryConfig {
  cloud_name: string
  api_key: string
  api_secret: string
}

/**
 * Validate and get Cloudinary configuration
 */
export function getCloudinaryConfig(): CloudinaryConfig {
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME
  const api_key = process.env.CLOUDINARY_API_KEY
  const api_secret = process.env.CLOUDINARY_API_SECRET

  if (!cloud_name) {
    throw new Error('CLOUDINARY_CLOUD_NAME environment variable is required')
  }

  if (!api_key) {
    throw new Error('CLOUDINARY_API_KEY environment variable is required')
  }

  if (!api_secret) {
    throw new Error('CLOUDINARY_API_SECRET environment variable is required')
  }

  return { cloud_name, api_key, api_secret }
}

/**
 * Validate database connection
 */
export function validateDatabaseConnection(): void {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is required')
  }

  // Basic URL format validation
  if (!databaseUrl.startsWith('postgresql://') && !databaseUrl.startsWith('postgres://')) {
    throw new Error('DATABASE_URL must be a valid PostgreSQL connection string')
  }
}

/**
 * Get NextAuth secret
 */
export function getNextAuthSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET

  if (secret) {
    return secret
  }

  // Dev fallback
  if (process.env.NODE_ENV !== 'production') {
    return 'dev-nextauth-secret'
  }

  throw new Error('NEXTAUTH_SECRET environment variable is required in production')
}

/**
 * Validate all required environment variables
 * (Optional: can be called at app startup)
 */
export function validateEnvironment(): void {
  if (process.env.NODE_ENV === 'production') {
    validateDatabaseConnection()
    getNextAuthSecret()
    // Cloudinary is optional for some features
    // getCloudinaryConfig()
  }
}


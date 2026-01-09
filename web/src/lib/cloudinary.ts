import { v2 as cloudinary } from 'cloudinary';
import { getCloudinaryConfig } from './config';
import { logWarn } from './logger';

/**
 * Cloudinary Configuration
 * Validates environment variables before configuration
 * 
 * Note: Configuration is done lazily - will be configured when first used
 * This allows the app to start even if Cloudinary is not configured
 */
let isConfigured = false;
const isProductionBuild = process.env.NEXT_PHASE === 'phase-production-build';

function configureCloudinary() {
  if (isConfigured) {
    return;
  }

  try {
    const config = getCloudinaryConfig();
    cloudinary.config({
      cloud_name: config.cloud_name,
      api_key: config.api_key,
      api_secret: config.api_secret,
      secure: true,
    });
    isConfigured = true;
  } catch (error) {
    // Cloudinary config is optional for some features
    // Will throw error only when actually used
    if (!isProductionBuild) {
      logWarn('Cloudinary configuration warning:', error instanceof Error ? error.message : 'Unknown error');
    }
    throw error; // Re-throw so upload endpoints can handle it properly
  }
}

// Configure on module load (for immediate validation)
if (!isProductionBuild) {
  try {
    configureCloudinary();
  } catch {
    // Ignore - will be handled when actually used
  }
}

export default cloudinary;
export { configureCloudinary };

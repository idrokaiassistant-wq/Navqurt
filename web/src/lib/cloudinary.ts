import { v2 as cloudinary } from 'cloudinary';
import { getCloudinaryConfig } from './config';
import { logWarn } from './logger';

/**
 * Cloudinary Configuration
 * Validates environment variables before configuration
 */
try {
  const config = getCloudinaryConfig();
  cloudinary.config({
    cloud_name: config.cloud_name,
    api_key: config.api_key,
    api_secret: config.api_secret,
    secure: true,
  });
} catch (error) {
  // Cloudinary config is optional for some features
  // Will throw error only when actually used
  logWarn('Cloudinary configuration warning:', error instanceof Error ? error.message : 'Unknown error');
}

export default cloudinary;

/**
 * Local File Storage Utility
 * Alternative to Cloudinary for regions where Cloudinary is not available
 */

import { writeFile, mkdir, unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads')
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

/**
 * Ensure upload directory exists
 */
async function ensureUploadDir(): Promise<void> {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true })
  }
}

/**
 * Generate unique filename
 */
function generateFilename(originalName: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 15)
  const ext = originalName.split('.').pop() || 'jpg'
  return `${timestamp}-${random}.${ext}`
}

/**
 * Upload file to local storage
 */
export async function uploadFile(file: File): Promise<{ url: string; public_id: string }> {
  await ensureUploadDir()

  const filename = generateFilename(file.name)
  const filepath = join(UPLOAD_DIR, filename)

  // Convert file to buffer
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  // Write file
  await writeFile(filepath, buffer)

  // Return URL (relative to public directory)
  const url = `/uploads/${filename}`
  const public_id = filename // Use filename as public_id for deletion

  return { url, public_id }
}

/**
 * Delete file from local storage
 */
export async function deleteFile(public_id: string): Promise<void> {
  const filepath = join(UPLOAD_DIR, public_id)
  
  if (existsSync(filepath)) {
    await unlink(filepath)
  }
}

/**
 * Validate file
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: "Faqat rasm fayllari ruxsat etilgan (JPEG, PNG, WebP, GIF)"
    }
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: "Fayl hajmi 5MB dan oshmasligi kerak"
    }
  }

  return { valid: true }
}

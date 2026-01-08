import { NextRequest } from "next/server"
import { assertAdmin } from "@/lib/api-auth"
import { prisma } from "@/lib/prisma"
import { withApiErrorHandler, successResponse, badRequestResponse, internalServerErrorResponse } from "@/lib/api-response"
import { uploadFile, validateFile } from "@/lib/file-storage"

// Check if Cloudinary is configured
function isCloudinaryConfigured(): boolean {
    try {
        const { getCloudinaryConfig } = require("@/lib/config")
        getCloudinaryConfig()
        return true
    } catch {
        return false
    }
}

/**
 * Convert file to base64 string
 */
async function fileToBase64(file: File): Promise<string> {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    return buffer.toString('base64')
}

export async function POST(request: NextRequest) {
    return withApiErrorHandler(async () => {
        await assertAdmin(request)

        const formData = await request.formData()
        const file = formData.get("file") as File | null

        if (!file) {
            return badRequestResponse("Fayl topilmadi")
        }

        // Validate file
        const validation = validateFile(file)
        if (!validation.valid) {
            return badRequestResponse(validation.error!)
        }

        // Try Cloudinary first if configured, otherwise use local storage
        if (isCloudinaryConfigured()) {
            try {
                const cloudinary = require("@/lib/cloudinary").default
                const { CloudinaryUploadResponse } = require("@/lib/types")

                const bytes = await file.arrayBuffer()
                const buffer = Buffer.from(bytes)

                const uploadResponse = await new Promise<CloudinaryUploadResponse>((resolve, reject) => {
                    cloudinary.uploader.upload_stream(
                        {
                            folder: "navqurt_products",
                            resource_type: "auto",
                        },
                        (error, result) => {
                            if (error) {
                                const errorMsg = error.message || 'Cloudinary yuklash xatosi'
                                reject(new Error(`Cloudinary xatosi: ${errorMsg}`))
                            } else if (!result || !result.secure_url || !result.public_id) {
                                reject(new Error("Cloudinary dan to'liq javob olinmadi"))
                            } else {
                                resolve({
                                    secure_url: result.secure_url,
                                    public_id: result.public_id,
                                    format: result.format,
                                    width: result.width,
                                    height: result.height,
                                    bytes: result.bytes,
                                    resource_type: result.resource_type
                                })
                            }
                        }
                    ).end(buffer)
                })

                return successResponse({
                    url: uploadResponse.secure_url,
                    public_id: uploadResponse.public_id
                })
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Noma\'lum xatolik'
                // If Cloudinary fails, fallback to local storage
                console.warn('Cloudinary upload failed, falling back to local storage:', errorMessage)
            }
        }

        // Use PostgreSQL storage (primary method for security)
        try {
            // Convert file to base64
            const base64Data = await fileToBase64(file)
            
            // Save to database
            const image = await prisma.image.create({
                data: {
                    filename: file.name,
                    mimeType: file.type,
                    data: base64Data,
                    size: file.size
                }
            })

            // Return image ID and URL
            return successResponse({
                url: `/api/images/${image.id}`, // URL for serving image
                public_id: image.id // Use image ID as public_id for deletion
            })
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Noma\'lum xatolik'
            // If database fails, try local file storage as fallback
            try {
                const result = await uploadFile(file)
                return successResponse({
                    url: result.url,
                    public_id: result.public_id
                })
            } catch (fallbackError) {
                return internalServerErrorResponse(`Rasm yuklash xatosi: ${errorMessage}`)
            }
        }
    })
}

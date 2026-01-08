import { NextRequest } from "next/server"
import { assertAdmin } from "@/lib/api-auth"
import { withApiErrorHandler, successResponse, badRequestResponse, internalServerErrorResponse } from "@/lib/api-response"
import { uploadFile, validateFile } from "@/lib/file-storage"
import type { CloudinaryUploadResponse } from "@/lib/types"

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

        // Try Cloudinary first if configured
        if (isCloudinaryConfigured()) {
            try {
                const cloudinary = require("@/lib/cloudinary").default

                const bytes = await file.arrayBuffer()
                const buffer = Buffer.from(bytes)

                const uploadResponse = await new Promise<CloudinaryUploadResponse>((resolve, reject) => {
                    cloudinary.uploader.upload_stream(
                        {
                            folder: "navqurt_products",
                            resource_type: "auto",
                        },
                        (error: any, result: any) => {
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
                console.warn('Cloudinary upload failed, falling back to local storage:', errorMessage)
            }
        }

        // Fallback to Base64 in Database (Recommended for ephemeral storage like Dokploy)
        try {
            const bytes = await file.arrayBuffer()
            const buffer = Buffer.from(bytes)
            const base64Data = buffer.toString('base64')

            const { prisma } = require("@/lib/prisma")
            const image = await prisma.image.create({
                data: {
                    filename: file.name,
                    mimeType: file.type,
                    data: base64Data,
                    size: file.size,
                },
            })

            return successResponse({
                url: `/api/images/${image.id}`,
                public_id: image.id
            })
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Noma\'lum xatolik'
            console.error('Database image upload failed:', errorMessage)

            // Final fallback to local file (least reliable)
            try {
                const result = await uploadFile(file)
                return successResponse({
                    url: result.url,
                    public_id: result.public_id
                })
            } catch (localError) {
                const localErrorMsg = localError instanceof Error ? localError.message : 'Noma\'lum lokal xatolik'
                console.error('Final local storage fallback failed:', localErrorMsg)
                return internalServerErrorResponse(`Rasm yuklash xatosi: ${errorMessage}. Lokal saqlash ham ishlamadi: ${localErrorMsg}`)
            }
        }
    })
}


import { NextRequest } from "next/server"
import { assertAdmin } from "@/lib/api-auth"
import cloudinary from "@/lib/cloudinary"
import { getCloudinaryConfig } from "@/lib/config"
import { withApiErrorHandler, successResponse, badRequestResponse, internalServerErrorResponse } from "@/lib/api-response"
import type { CloudinaryUploadResponse } from "@/lib/types"

export async function POST(request: NextRequest) {
    return withApiErrorHandler(async () => {
        await assertAdmin(request)

        // Check Cloudinary configuration
        try {
            getCloudinaryConfig()
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Cloudinary sozlamalari topilmadi'
            return internalServerErrorResponse(
                `Cloudinary sozlanmagan: ${errorMessage}. Iltimos, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY va CLOUDINARY_API_SECRET environment variable'larini sozlang.`
            )
        }

        const formData = await request.formData()
        const file = formData.get("file") as File | null

        if (!file) {
            return badRequestResponse("Fayl topilmadi")
        }

        // Validate file type
        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
        if (!allowedTypes.includes(file.type)) {
            return badRequestResponse("Faqat rasm fayllari ruxsat etilgan (JPEG, PNG, WebP, GIF)")
        }

        // Validate file size (max 5MB)
        const MAX_SIZE = 5 * 1024 * 1024
        if (file.size > MAX_SIZE) {
            return badRequestResponse("Fayl hajmi 5MB dan oshmasligi kerak")
        }

        // Convert file to Buffer
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Upload to Cloudinary using promise with proper typing
        try {
            const uploadResponse = await new Promise<CloudinaryUploadResponse>((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    {
                        folder: "navqurt_products",
                        resource_type: "auto",
                    },
                    (error, result) => {
                        if (error) {
                            // More detailed error message
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
            // Check if it's an API key error
            if (errorMessage.includes('api_key') || errorMessage.includes('Must supply')) {
                return internalServerErrorResponse(
                    'Cloudinary API key sozlanmagan. Iltimos, CLOUDINARY_API_KEY va CLOUDINARY_API_SECRET environment variable\'larini tekshiring.'
                )
            }
            return internalServerErrorResponse(`Rasm yuklash xatosi: ${errorMessage}`)
        }
    })
}

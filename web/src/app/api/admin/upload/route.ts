import { NextRequest } from "next/server"
import { assertAdmin } from "@/lib/api-auth"
import cloudinary from "@/lib/cloudinary"
import { withApiErrorHandler, successResponse, badRequestResponse } from "@/lib/api-response"
import type { CloudinaryUploadResponse } from "@/lib/types"

export async function POST(request: NextRequest) {
    return withApiErrorHandler(async () => {
        await assertAdmin(request)

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
        const uploadResponse = await new Promise<CloudinaryUploadResponse>((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    folder: "navqurt_products",
                    resource_type: "auto",
                },
                (error, result) => {
                    if (error) {
                        reject(error)
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
    })
}

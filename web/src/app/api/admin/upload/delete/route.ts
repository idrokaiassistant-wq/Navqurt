import { NextRequest } from "next/server"
import { assertAdmin } from "@/lib/api-auth"
import { withApiErrorHandler, badRequestResponse, messageResponse } from "@/lib/api-response"
import { validateRequired } from "@/lib/validation"
import { deleteFile } from "@/lib/file-storage"

// Cloudinary delete response type
interface CloudinaryDeleteResult {
    result: 'ok' | 'not found'
}

// Check if Cloudinary is configured
async function getCloudinaryInstance(): Promise<typeof import("cloudinary").v2 | null> {
    try {
        const config = await import("@/lib/config")
        config.getCloudinaryConfig()
        const cloudinaryModule = await import("@/lib/cloudinary")
        return cloudinaryModule.default
    } catch {
        return null
    }
}

export async function POST(request: NextRequest) {
    return withApiErrorHandler(async () => {
        await assertAdmin(request)
        const body = await request.json()
        const { public_id } = body

        const publicIdValidation = validateRequired(public_id, "Public ID")
        if (!publicIdValidation.valid) {
            return badRequestResponse(publicIdValidation.error!)
        }

        // Try Cloudinary first if configured
        const cloudinary = await getCloudinaryInstance()
        if (cloudinary) {
            try {
                const result = await cloudinary.uploader.destroy(String(public_id)) as CloudinaryDeleteResult

                if (result.result !== 'ok') {
                    return messageResponse("Rasm allaqachon o'chirilgan yoki topilmadi")
                }

                return messageResponse("Rasm muvaffaqiyatli o'chirildi")
            } catch (error) {
                console.warn('Cloudinary delete failed, trying local storage:', error)
            }
        }

        // Fallback to local file storage
        try {
            await deleteFile(String(public_id))
            return messageResponse("Rasm muvaffaqiyatli o'chirildi")
        } catch {
            return messageResponse("Rasm allaqachon o'chirilgan yoki topilmadi")
        }
    })
}

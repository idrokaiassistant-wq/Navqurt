import { NextRequest } from "next/server"
import { assertAdmin } from "@/lib/api-auth"
import { withApiErrorHandler, badRequestResponse, messageResponse } from "@/lib/api-response"
import { validateRequired } from "@/lib/validation"
import { deleteFile } from "@/lib/file-storage"

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
        const body = await request.json()
        const { public_id } = body

        const publicIdValidation = validateRequired(public_id, "Public ID")
        if (!publicIdValidation.valid) {
            return badRequestResponse(publicIdValidation.error!)
        }

        // Try Cloudinary first if configured
        if (isCloudinaryConfigured()) {
            try {
                const cloudinary = require("@/lib/cloudinary").default
                const { CloudinaryDeleteResponse } = require("@/lib/types")

                const result = await cloudinary.uploader.destroy(String(public_id)) as CloudinaryDeleteResponse

                if (result.result !== 'ok') {
                    return messageResponse("Rasm allaqachon o'chirilgan yoki topilmadi")
                }

                return messageResponse("Rasm muvaffaqiyatli o'chirildi")
            } catch (error) {
                // If Cloudinary fails, fallback to local storage
                console.warn('Cloudinary delete failed, trying local storage:', error)
            }
        }

        // Use PostgreSQL storage (primary method)
        try {
            // Try to delete from database first
            await prisma.image.delete({
                where: { id: String(public_id) }
            })
            return messageResponse("Rasm muvaffaqiyatli o'chirildi")
        } catch (error) {
            // If not found in database, try local file storage (for backward compatibility)
            try {
                await deleteFile(String(public_id))
                return messageResponse("Rasm muvaffaqiyatli o'chirildi")
            } catch {
                // File might not exist, that's okay
                return messageResponse("Rasm allaqachon o'chirilgan yoki topilmadi")
            }
        }
    })
}

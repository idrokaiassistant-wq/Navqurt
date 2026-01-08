import { NextRequest } from "next/server"
import { assertAdmin } from "@/lib/api-auth"
import cloudinary from "@/lib/cloudinary"
import { withApiErrorHandler, badRequestResponse, messageResponse } from "@/lib/api-response"
import { validateRequired } from "@/lib/validation"
import type { CloudinaryDeleteResponse } from "@/lib/types"

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ filename: string }> }
) {
    return withApiErrorHandler(async () => {
        await assertAdmin(request)
        const { filename } = await params
        const body = await request.json()
        const { public_id } = body

        // Use filename from params if public_id not provided in body
        const publicIdToDelete = public_id || filename

        const publicIdValidation = validateRequired(publicIdToDelete, "Public ID")
        if (!publicIdValidation.valid) {
            return badRequestResponse(publicIdValidation.error!)
        }

        const result = await cloudinary.uploader.destroy(String(publicIdToDelete)) as CloudinaryDeleteResponse

        if (result.result !== 'ok') {
            return messageResponse("Rasm allaqachon o'chirilgan yoki topilmadi")
        }

        return messageResponse("Rasm muvaffaqiyatli o'chirildi")
    })
}

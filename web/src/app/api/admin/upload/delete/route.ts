import { NextRequest } from "next/server"
import { assertAdmin } from "@/lib/api-auth"
import cloudinary from "@/lib/cloudinary"
import { withApiErrorHandler, badRequestResponse, messageResponse } from "@/lib/api-response"
import { validateRequired } from "@/lib/validation"
import type { CloudinaryDeleteResponse } from "@/lib/types"

export async function POST(request: NextRequest) {
    return withApiErrorHandler(async () => {
        await assertAdmin(request)
        const body = await request.json()
        const { public_id } = body

        const publicIdValidation = validateRequired(public_id, "Public ID")
        if (!publicIdValidation.valid) {
            return badRequestResponse(publicIdValidation.error!)
        }

        const result = await cloudinary.uploader.destroy(String(public_id)) as CloudinaryDeleteResponse

        if (result.result !== 'ok') {
            return messageResponse("Rasm allaqachon o'chirilgan yoki topilmadi")
        }

        return messageResponse("Rasm muvaffaqiyatli o'chirildi")
    })
}

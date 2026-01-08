import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { assertAdmin } from "@/lib/api-auth"
import { withApiErrorHandler, successResponse, createdResponse, badRequestResponse } from "@/lib/api-response"
import { validateRequired, validateStringLength } from "@/lib/validation"

export async function GET(request: NextRequest) {
    return withApiErrorHandler(async () => {
        await assertAdmin(request)

        const categories = await prisma.category.findMany({
            orderBy: { createdAt: "desc" },
        })

        return successResponse({ categories })
    })
}

export async function POST(request: NextRequest) {
    return withApiErrorHandler(async () => {
        await assertAdmin(request)

        const body = await request.json().catch(() => ({}))
        const name = body?.name ? String(body.name).trim() : ""
        const color = body?.color ? String(body.color).trim() : null

        // Validation
        const nameValidation = validateRequired(name, "Nomi")
        if (!nameValidation.valid) {
            return badRequestResponse(nameValidation.error!)
        }

        const nameLengthValidation = validateStringLength(name, 1, 100, "Nomi")
        if (!nameLengthValidation.valid) {
            return badRequestResponse(nameLengthValidation.error!)
        }

        const category = await prisma.category.create({
            data: { 
                name, 
                color: color && color.length > 0 ? color : null 
            },
        })

        return createdResponse({ category })
    })
}





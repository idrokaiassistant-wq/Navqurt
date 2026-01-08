import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { assertAdmin } from "@/lib/api-auth"
import { withApiErrorHandler, successResponse, createdResponse, badRequestResponse } from "@/lib/api-response"
import { validateRequired, parseFloatSafe, parseIntSafe, validateStringLength } from "@/lib/validation"

export async function GET(request: NextRequest) {
    return withApiErrorHandler(async () => {
        await assertAdmin(request)

        const items = await prisma.stockItem.findMany({
            orderBy: { updatedAt: "desc" }
        })

        return successResponse(items)
    })
}

export async function POST(request: NextRequest) {
    return withApiErrorHandler(async () => {
        await assertAdmin(request)
        const body = await request.json()
        const { name, current, unit, minRequired, price } = body

        // Validation
        const nameValidation = validateRequired(name, "Nomi")
        if (!nameValidation.valid) {
            return badRequestResponse(nameValidation.error!)
        }

        const nameLengthValidation = validateStringLength(String(name).trim(), 1, 200, "Nomi")
        if (!nameLengthValidation.valid) {
            return badRequestResponse(nameLengthValidation.error!)
        }

        const currentValidation = parseFloatSafe(current, "Hozirgi miqdor")
        if (!currentValidation.valid) {
            return badRequestResponse(currentValidation.error!)
        }

        const minRequiredValidation = parseFloatSafe(minRequired, "Minimal talab")
        if (!minRequiredValidation.valid) {
            return badRequestResponse(minRequiredValidation.error!)
        }

        const priceValidation = parseIntSafe(price, "Narx")
        if (!priceValidation.valid) {
            return badRequestResponse(priceValidation.error!)
        }

        const item = await prisma.stockItem.create({
            data: {
                name: String(name).trim(),
                current: currentValidation.value!,
                unit: unit || "kg",
                minRequired: minRequiredValidation.value!,
                price: priceValidation.value!
            }
        })

        return createdResponse(item)
    })
}


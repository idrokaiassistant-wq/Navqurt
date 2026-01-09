import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { assertAdmin } from "@/lib/api-auth"
import { withApiErrorHandler, successResponse, createdResponse, badRequestResponse, conflictResponse } from "@/lib/api-response"
import { validateRequired, validateStringLength, parseIntSafe, validateNonNegativeNumber } from "@/lib/validation"

export async function GET(request: NextRequest) {
    return withApiErrorHandler(async () => {
        await assertAdmin(request)

        const searchParams = request.nextUrl.searchParams
        const includeInactive = searchParams.get("includeInactive") === "true"

        // Fetch regions
        const regions = await prisma.region.findMany({
            where: includeInactive ? {} : { isActive: true },
            orderBy: {
                name: "asc"
            }
        })

        return successResponse({ regions })
    }, { method: 'GET', path: '/api/admin/regions' })
}

export async function POST(request: NextRequest) {
    return withApiErrorHandler(async () => {
        await assertAdmin(request)

        const body = await request.json()
        const { name, deliveryPrice, minFreeDelivery, isActive } = body

        // Validate name
        const nameValidation = validateRequired(name, "Nomi")
        if (!nameValidation.valid) {
            return badRequestResponse(nameValidation.error!)
        }

        const nameLengthValidation = validateStringLength(String(name).trim(), 1, 200, "Nomi")
        if (!nameLengthValidation.valid) {
            return badRequestResponse(nameLengthValidation.error!)
        }

        const trimmedName = String(name).trim()

        // Check if region with same name already exists
        const existingRegion = await prisma.region.findUnique({
            where: { name: trimmedName }
        })

        if (existingRegion) {
            return conflictResponse("Bu nomli region allaqachon mavjud")
        }

        // Validate deliveryPrice
        const deliveryPriceValidation = parseIntSafe(deliveryPrice, "Yetkazib berish narxi")
        if (!deliveryPriceValidation.valid) {
            return badRequestResponse(deliveryPriceValidation.error!)
        }

        const deliveryPricePositive = validateNonNegativeNumber(deliveryPriceValidation.value!, "Yetkazib berish narxi")
        if (!deliveryPricePositive.valid) {
            return badRequestResponse(deliveryPricePositive.error!)
        }

        // Validate minFreeDelivery if provided
        let parsedMinFreeDelivery: number | null = null
        if (minFreeDelivery !== undefined && minFreeDelivery !== null && minFreeDelivery !== "") {
            const minFreeDeliveryValidation = parseIntSafe(minFreeDelivery, "Minimal bepul yetkazib berish")
            if (!minFreeDeliveryValidation.valid) {
                return badRequestResponse(minFreeDeliveryValidation.error!)
            }

            const minFreeDeliveryPositive = validateNonNegativeNumber(minFreeDeliveryValidation.value!, "Minimal bepul yetkazib berish")
            if (!minFreeDeliveryPositive.valid) {
                return badRequestResponse(minFreeDeliveryPositive.error!)
            }

            parsedMinFreeDelivery = minFreeDeliveryValidation.value!
        }

        // Create region
        const region = await prisma.region.create({
            data: {
                name: trimmedName,
                deliveryPrice: deliveryPriceValidation.value!,
                minFreeDelivery: parsedMinFreeDelivery,
                isActive: isActive !== undefined ? Boolean(isActive) : true
            }
        })

        return createdResponse({ region })
    }, { method: 'POST', path: '/api/admin/regions' })
}

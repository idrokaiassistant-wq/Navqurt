import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { assertAdmin } from "@/lib/api-auth"
import { StockMovementType } from "@prisma/client"
import { withApiErrorHandler, successResponse, createdResponse, badRequestResponse, notFoundResponse } from "@/lib/api-response"
import { validateRequired, parseFloatSafe, parseIntSafe, validateEnum } from "@/lib/validation"

export async function GET(request: NextRequest) {
    return withApiErrorHandler(async () => {
        await assertAdmin(request)

        const movements = await prisma.stockMovement.findMany({
            include: {
                item: true
            },
            orderBy: { date: "desc" }
        })

        return successResponse(movements)
    })
}

export async function POST(request: NextRequest) {
    return withApiErrorHandler(async () => {
        await assertAdmin(request)
        const body = await request.json()
        const { type, itemId, amount, unit, price, note } = body

        // Validation
        const typeValidation = validateEnum<StockMovementType>(
            type,
            Object.values(StockMovementType) as StockMovementType[],
            "Harakat turi"
        )
        if (!typeValidation.valid) {
            return badRequestResponse(typeValidation.error!)
        }

        const itemIdValidation = validateRequired(itemId, "Mahsulot ID")
        if (!itemIdValidation.valid) {
            return badRequestResponse(itemIdValidation.error!)
        }

        const amountValidation = parseFloatSafe(amount, "Miqdor")
        if (!amountValidation.valid) {
            return badRequestResponse(amountValidation.error!)
        }

        if (amountValidation.value! <= 0) {
            return badRequestResponse("Miqdor musbat son bo'lishi kerak")
        }

        // Update stock item quantity
        const stockItem = await prisma.stockItem.findUnique({
            where: { id: itemId }
        })

        if (!stockItem) {
            return notFoundResponse("Omborxona mahsuloti topilmadi")
        }

        const newAmount = typeValidation.value === "IN"
            ? stockItem.current + amountValidation.value!
            : stockItem.current - amountValidation.value!

        // Validate that OUT doesn't result in negative stock
        if (newAmount < 0) {
            return badRequestResponse("Mavjud miqdordan ko'p chiqarib bo'lmaydi")
        }

        await prisma.stockItem.update({
            where: { id: itemId },
            data: { current: newAmount }
        })

        // Parse price if provided
        let parsedPrice: number | null = null
        if (price !== undefined && price !== null) {
            const priceValidation = parseIntSafe(price, "Narx")
            if (!priceValidation.valid) {
                return badRequestResponse(priceValidation.error!)
            }
            parsedPrice = priceValidation.value!
        }

        // Create movement record
        const movement = await prisma.stockMovement.create({
            data: {
                type: typeValidation.value!,
                itemId,
                amount: amountValidation.value!,
                unit: unit || stockItem.unit,
                price: parsedPrice,
                note: note?.trim() || null
            },
            include: {
                item: true
            }
        })

        return createdResponse(movement)
    })
}


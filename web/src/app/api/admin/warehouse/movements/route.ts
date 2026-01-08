import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { assertAdmin } from "@/lib/api-auth"
import { StockMovementType } from "@prisma/client"
import { withApiErrorHandler, successResponse, createdResponse, badRequestResponse, notFoundResponse } from "@/lib/api-response"
import { validateRequired, parseFloatSafe, parseIntSafe, validateEnum } from "@/lib/validation"

export async function GET(request: NextRequest) {
    return withApiErrorHandler(async () => {
        await assertAdmin(request)

        // Pagination parameters
        const searchParams = request.nextUrl.searchParams
        const page = parseIntSafe(searchParams.get("page") || "1", "Page").value || 1
        const limit = parseIntSafe(searchParams.get("limit") || "50", "Limit").value || 50
        
        // Validate and clamp pagination values
        const pageNumber = Math.max(1, page)
        const pageSize = Math.min(Math.max(1, limit), 200) // Max 200 items per page
        const skip = (pageNumber - 1) * pageSize

        // Fetch movements with pagination
        const [movements, totalCount] = await Promise.all([
            prisma.stockMovement.findMany({
                include: {
                    item: true
                },
                orderBy: { date: "desc" },
                skip,
                take: pageSize
            }),
            prisma.stockMovement.count()
        ])

        // Transform response: item -> stockItem for frontend compatibility
        const transformedMovements = movements.map(movement => ({
            ...movement,
            stockItem: movement.item
        }))

        const totalPages = Math.ceil(totalCount / pageSize)

        return successResponse({
            movements: transformedMovements,
            pagination: {
                page: pageNumber,
                limit: pageSize,
                total: totalCount,
                totalPages,
                hasNextPage: pageNumber < totalPages,
                hasPreviousPage: pageNumber > 1
            }
        })
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

        // Transform response: item -> stockItem for frontend compatibility
        const transformedMovement = {
            ...movement,
            stockItem: movement.item
        }

        return createdResponse(transformedMovement)
    })
}


import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { assertAdmin } from "@/lib/api-auth"
import { TasteType } from "@prisma/client"
import { withApiErrorHandler, successResponse, createdResponse, badRequestResponse, notFoundResponse } from "@/lib/api-response"
import { validateEnum, parseIntSafe } from "@/lib/validation"

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    return withApiErrorHandler(async () => {
        await assertAdmin(request)
        const { id } = await params

        // Check if product exists
        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                variants: true
            }
        })

        if (!product) {
            return notFoundResponse("Mahsulot topilmadi")
        }

        return successResponse({ variants: product.variants })
    }, { method: 'GET', path: '/api/admin/products/[id]/variants' })
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    return withApiErrorHandler(async () => {
        await assertAdmin(request)
        const { id } = await params
        const body = await request.json()
        const { type, priceDelta } = body

        // Check if product exists
        const product = await prisma.product.findUnique({
            where: { id }
        })

        if (!product) {
            return notFoundResponse("Mahsulot topilmadi")
        }

        // Validate type
        const typeValidation = validateEnum<TasteType>(
            type,
            Object.values(TasteType) as TasteType[],
            "Variant turi"
        )
        if (!typeValidation.valid) {
            return badRequestResponse(typeValidation.error!)
        }

        // Validate priceDelta
        const priceDeltaValidation = parseIntSafe(priceDelta ?? 0, "Narx farqi")
        if (!priceDeltaValidation.valid) {
            return badRequestResponse(priceDeltaValidation.error!)
        }

        // Check if variant with same type already exists for this product
        const existingVariant = await prisma.variant.findFirst({
            where: {
                productId: id,
                type: typeValidation.value!
            }
        })

        if (existingVariant) {
            return badRequestResponse(`Bu mahsulotda "${typeValidation.value}" variant'i allaqachon mavjud`)
        }

        // Create variant
        const variant = await prisma.variant.create({
            data: {
                productId: id,
                type: typeValidation.value!,
                priceDelta: priceDeltaValidation.value!
            }
        })

        return createdResponse({ variant })
    }, { method: 'POST', path: '/api/admin/products/[id]/variants' })
}

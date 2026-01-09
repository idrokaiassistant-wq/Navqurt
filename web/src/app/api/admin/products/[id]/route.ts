import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { assertAdmin } from "@/lib/api-auth"
import { withApiErrorHandler, successResponse, badRequestResponse, messageResponse } from "@/lib/api-response"
import { parseIntSafe, validateArray } from "@/lib/validation"

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    return withApiErrorHandler(async () => {
        await assertAdmin(request)
        const { id } = await params
        const body = await request.json()
        const { name, description, image, imagePublicId, price, weight, isActive, categoryIds } = body

        // Validate and parse price if provided
        let parsedPrice: number | undefined
        if (price !== undefined && price !== null) {
            const priceValidation = parseIntSafe(price, "Narx")
            if (!priceValidation.valid) {
                return badRequestResponse(priceValidation.error!)
            }
            parsedPrice = priceValidation.value
        }

        // Validate and parse weight if provided
        let parsedWeight: number | undefined
        if (weight !== undefined && weight !== null) {
            const weightValidation = parseIntSafe(weight, "Og'irlik")
            if (!weightValidation.valid) {
                return badRequestResponse(weightValidation.error!)
            }
            parsedWeight = weightValidation.value
        }

        // Validate categoryIds if provided
        if (categoryIds !== undefined && categoryIds !== null) {
            const categoryIdsValidation = validateArray<string>(categoryIds, "Kategoriyalar")
            if (!categoryIdsValidation.valid) {
                return badRequestResponse(categoryIdsValidation.error!)
            }

            // Delete existing category relationships
            await prisma.productCategory.deleteMany({
                where: { productId: id }
            })

            // Create new category relationships
            if (categoryIds.length > 0) {
                await prisma.productCategory.createMany({
                    data: categoryIds.map((categoryId: string) => ({
                        productId: id,
                        categoryId
                    }))
                })
            }
        }

        // Build update data
        const updateData: {
            name?: string
            description?: string | null
            image?: string | null
            imagePublicId?: string | null
            price?: number
            weight?: number
            isActive?: boolean
        } = {}

        if (name !== undefined) updateData.name = name.trim()
        if (description !== undefined) updateData.description = description?.trim() || null
        if (image !== undefined) updateData.image = image || null
        if (imagePublicId !== undefined) updateData.imagePublicId = imagePublicId || null
        if (parsedPrice !== undefined) updateData.price = parsedPrice
        if (parsedWeight !== undefined) updateData.weight = parsedWeight
        if (isActive !== undefined) updateData.isActive = isActive

        const product = await prisma.product.update({
            where: { id },
            data: updateData,
            include: {
                categories: {
                    include: { category: true }
                }
            }
        })

        // Transform response
        const productWithCategories = {
            ...product,
            categoryIds: product.categories.map(pc => pc.categoryId),
            categoryNames: product.categories.map(pc => pc.category.name)
        }

        return successResponse(productWithCategories)
    }, { method: 'PATCH', path: '/api/admin/products/[id]' })
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    return withApiErrorHandler(async () => {
        await assertAdmin(request)
        const { id } = await params

        // Delete category relationships first
        await prisma.productCategory.deleteMany({
            where: { productId: id }
        })

        await prisma.product.delete({
            where: { id }
        })

        return messageResponse("Mahsulot muvaffaqiyatli o'chirildi")
    }, { method: 'DELETE', path: '/api/admin/products/[id]' })
}


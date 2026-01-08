import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { assertAdmin } from "@/lib/api-auth"
import { withApiErrorHandler, successResponse, createdResponse, badRequestResponse } from "@/lib/api-response"
import { validateRequired, parseIntSafe, validateArray } from "@/lib/validation"

export async function GET(request: NextRequest) {
    return withApiErrorHandler(async () => {
        await assertAdmin(request)

        const products = await prisma.product.findMany({
            include: {
                variants: true,
                categories: {
                    include: {
                        category: true
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        })

        // Transform to include categoryIds for easier frontend use
        const productsWithCategories = products.map(product => ({
            ...product,
            categoryIds: product.categories.map(pc => pc.categoryId),
            categoryNames: product.categories.map(pc => pc.category.name)
        }))

        return successResponse({ products: productsWithCategories })
    })
}

export async function POST(request: NextRequest) {
    return withApiErrorHandler(async () => {
        await assertAdmin(request)
        const body = await request.json()
        const { name, description, image, imagePublicId, price, weight, isActive, categoryIds } = body

        // Validation
        const nameValidation = validateRequired(name, "Nomi")
        if (!nameValidation.valid) {
            return badRequestResponse(nameValidation.error!)
        }

        const priceValidation = parseIntSafe(price, "Narx")
        if (!priceValidation.valid) {
            return badRequestResponse(priceValidation.error!)
        }

        const weightValidation = parseIntSafe(weight, "Og'irlik")
        if (!weightValidation.valid) {
            return badRequestResponse(weightValidation.error!)
        }

        // Validate categoryIds if provided
        if (categoryIds !== undefined && categoryIds !== null) {
            const categoryIdsValidation = validateArray<string>(categoryIds, "Kategoriyalar")
            if (!categoryIdsValidation.valid) {
                return badRequestResponse(categoryIdsValidation.error!)
            }
        }

        const product = await prisma.product.create({
            data: {
                name: name.trim(),
                description: description?.trim() || null,
                image: image || null,
                imagePublicId: imagePublicId || null,
                price: priceValidation.value!,
                weight: weightValidation.value!,
                isActive: isActive !== false,
                categories: categoryIds?.length ? {
                    create: categoryIds.map((categoryId: string) => ({
                        categoryId
                    }))
                } : undefined
            },
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

        return createdResponse(productWithCategories)
    })
}


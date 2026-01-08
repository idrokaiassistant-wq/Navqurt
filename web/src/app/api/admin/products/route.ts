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
                },
                imageData: true
            },
            orderBy: { createdAt: "desc" }
        })

        // Transform to include categoryIds and image URL for easier frontend use
        const productsWithCategories = products.map(product => {
            // Determine image URL: prefer imageId (database), then image (URL), then null
            let imageUrl = product.image || null
            if (product.imageId && product.imageData) {
                imageUrl = `/api/images/${product.imageId}`
            }

            return {
                ...product,
                categoryIds: product.categories.map(pc => pc.categoryId),
                categoryNames: product.categories.map(pc => pc.category.name),
                image: imageUrl // Override with computed image URL
            }
        })

        return successResponse({ products: productsWithCategories })
    })
}

export async function POST(request: NextRequest) {
    return withApiErrorHandler(async () => {
        await assertAdmin(request)
        const body = await request.json()
        const { name, description, image, imagePublicId, imageId, price, weight, isActive, categoryIds } = body

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
                image: image || null, // Backward compatibility
                imagePublicId: imagePublicId || null, // Backward compatibility
                imageId: imageId || null, // New: database image reference
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
                },
                imageData: true
            }
        })

        // Transform response
        let imageUrl = product.image || null
        if (product.imageId && product.imageData) {
            imageUrl = `/api/images/${product.imageId}`
        }

        const productWithCategories = {
            ...product,
            categoryIds: product.categories.map(pc => pc.categoryId),
            categoryNames: product.categories.map(pc => pc.category.name),
            image: imageUrl // Override with computed image URL
        }

        return createdResponse(productWithCategories)
    })
}


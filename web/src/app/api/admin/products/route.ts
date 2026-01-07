import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { assertAdmin } from "@/lib/api-auth"

export async function GET(request: NextRequest) {
    try {
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

        return NextResponse.json({ products: productsWithCategories })
    } catch (error: unknown) {
        if (error instanceof Error && error.message === "Unauthorized") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to fetch products" },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        await assertAdmin(request)
        const body = await request.json()
        const { name, description, image, imagePublicId, price, weight, isActive, categoryIds } = body

        // Validate price
        const priceNum = typeof price === "string" ? parseInt(price, 10) : typeof price === "number" ? price : NaN
        if (isNaN(priceNum) || priceNum < 0) {
            return NextResponse.json({ error: "price to'g'ri son bo'lishi kerak va 0 dan katta" }, { status: 400 })
        }

        // Validate weight
        const weightNum = typeof weight === "string" ? parseInt(weight, 10) : typeof weight === "number" ? weight : NaN
        if (isNaN(weightNum) || weightNum < 0) {
            return NextResponse.json({ error: "weight to'g'ri son bo'lishi kerak va 0 dan katta" }, { status: 400 })
        }

        const product = await prisma.product.create({
            data: {
                name,
                description,
                image,
                imagePublicId,
                price: priceNum,
                weight: weightNum,
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

        return NextResponse.json(product, { status: 201 })
    } catch (error: unknown) {
        if (error instanceof Error && error.message === "Unauthorized") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to create product" },
            { status: 500 }
        )
    }
}


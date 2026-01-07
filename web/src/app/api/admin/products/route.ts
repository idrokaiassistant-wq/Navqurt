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

        const product = await prisma.product.create({
            data: {
                name,
                description,
                image,
                imagePublicId,
                price: parseInt(price),
                weight: parseInt(weight),
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


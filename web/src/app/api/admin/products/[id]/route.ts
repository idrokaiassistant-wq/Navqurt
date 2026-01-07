import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { assertAdmin } from "@/lib/api-auth"

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await assertAdmin(request)
        const { id } = await params
        const body = await request.json()
        const { name, description, image, imagePublicId, price, weight, isActive, categoryIds } = body

        // If categoryIds provided, update categories
        if (categoryIds !== undefined) {
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

        // Validate price if provided
        let priceNum: number | undefined = undefined
        if (price !== undefined && price !== null) {
            priceNum = typeof price === "string" ? parseInt(price, 10) : typeof price === "number" ? price : NaN
            if (isNaN(priceNum) || priceNum < 0) {
                return NextResponse.json({ error: "price to'g'ri son bo'lishi kerak va 0 dan katta" }, { status: 400 })
            }
        }

        // Validate weight if provided
        let weightNum: number | undefined = undefined
        if (weight !== undefined && weight !== null) {
            weightNum = typeof weight === "string" ? parseInt(weight, 10) : typeof weight === "number" ? weight : NaN
            if (isNaN(weightNum) || weightNum < 0) {
                return NextResponse.json({ error: "weight to'g'ri son bo'lishi kerak va 0 dan katta" }, { status: 400 })
            }
        }

        const product = await prisma.product.update({
            where: { id },
            data: {
                name,
                description,
                image,
                imagePublicId,
                price: priceNum,
                weight: weightNum,
                isActive
            },
            include: {
                categories: {
                    include: { category: true }
                }
            }
        })

        return NextResponse.json({
            ...product,
            categoryIds: product.categories.map(pc => pc.categoryId),
            categoryNames: product.categories.map(pc => pc.category.name)
        })
    } catch (error: unknown) {
        if (error instanceof Error && error.message === "Unauthorized") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to update product" },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await assertAdmin(request)
        const { id } = await params

        // Delete category relationships first
        await prisma.productCategory.deleteMany({
            where: { productId: id }
        })

        await prisma.product.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })
    } catch (error: unknown) {
        if (error instanceof Error && error.message === "Unauthorized") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to delete product" },
            { status: 500 }
        )
    }
}


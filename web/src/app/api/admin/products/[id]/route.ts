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
        const { name, description, price, weight, isActive, categoryIds } = body

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

        const product = await prisma.product.update({
            where: { id },
            data: {
                name,
                description,
                price: price ? parseInt(price) : undefined,
                weight: weight ? parseInt(weight) : undefined,
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


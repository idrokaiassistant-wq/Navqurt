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
        const { name, description, price, weight, isActive } = body

        const product = await prisma.product.update({
            where: { id },
            data: {
                name,
                description,
                price: price ? parseInt(price) : undefined,
                weight: weight ? parseInt(weight) : undefined,
                isActive
            }
        })

        return NextResponse.json(product)
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

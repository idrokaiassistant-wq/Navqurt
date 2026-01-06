import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { assertAdmin } from "@/lib/api-auth"

export async function GET(request: NextRequest) {
    try {
        await assertAdmin(request)

        const products = await prisma.product.findMany({
            include: {
                variants: true
            },
            orderBy: { createdAt: "desc" }
        })

        return NextResponse.json({ products })
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
        const { name, description, price, weight, isActive } = body

        const product = await prisma.product.create({
            data: {
                name,
                description,
                price: parseInt(price),
                weight: parseInt(weight),
                isActive: isActive !== false
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


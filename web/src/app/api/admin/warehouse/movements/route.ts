import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { assertAdmin } from "@/lib/api-auth"

export async function GET(request: NextRequest) {
    try {
        await assertAdmin(request)

        const movements = await prisma.stockMovement.findMany({
            include: {
                item: true
            },
            orderBy: { date: "desc" }
        })

        return NextResponse.json(movements)
    } catch (error: unknown) {
        if (error instanceof Error && error.message === "Unauthorized") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to fetch movements" },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        await assertAdmin(request)
        const body = await request.json()
        const { type, itemId, amount, unit, price, note } = body

        // Update stock item quantity
        const stockItem = await prisma.stockItem.findUnique({
            where: { id: itemId }
        })

        if (!stockItem) {
            return NextResponse.json(
                { error: "Stock item not found" },
                { status: 404 }
            )
        }

        const newAmount = type === "IN"
            ? stockItem.current + parseFloat(amount)
            : stockItem.current - parseFloat(amount)

        await prisma.stockItem.update({
            where: { id: itemId },
            data: { current: Math.max(0, newAmount) }
        })

        // Create movement record
        const movement = await prisma.stockMovement.create({
            data: {
                type,
                itemId,
                amount: parseFloat(amount),
                unit: unit || stockItem.unit,
                price: price ? parseInt(price) : null,
                note
            },
            include: {
                item: true
            }
        })

        return NextResponse.json(movement, { status: 201 })
    } catch (error: unknown) {
        if (error instanceof Error && error.message === "Unauthorized") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to create movement" },
            { status: 500 }
        )
    }
}


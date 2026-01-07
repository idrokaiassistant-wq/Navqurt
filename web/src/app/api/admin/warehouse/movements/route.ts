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

        // Validate amount
        const amountNum = typeof amount === "string" ? parseFloat(amount) : typeof amount === "number" ? amount : NaN
        if (isNaN(amountNum) || amountNum <= 0) {
            return NextResponse.json({ error: "amount to'g'ri son bo'lishi kerak va 0 dan katta" }, { status: 400 })
        }

        // Validate type
        if (type !== "IN" && type !== "OUT") {
            return NextResponse.json({ error: "type 'IN' yoki 'OUT' bo'lishi kerak" }, { status: 400 })
        }

        const newAmount = type === "IN"
            ? stockItem.current + amountNum
            : stockItem.current - amountNum

        await prisma.stockItem.update({
            where: { id: itemId },
            data: { current: Math.max(0, newAmount) }
        })

        // Validate price if provided
        let priceNum: number | null = null
        if (price !== undefined && price !== null) {
            priceNum = typeof price === "string" ? parseInt(price, 10) : typeof price === "number" ? price : NaN
            if (isNaN(priceNum) || priceNum < 0) {
                return NextResponse.json({ error: "price to'g'ri son bo'lishi kerak va 0 dan katta yoki teng" }, { status: 400 })
            }
        }

        // Create movement record
        const movement = await prisma.stockMovement.create({
            data: {
                type,
                itemId,
                amount: amountNum,
                unit: unit || stockItem.unit,
                price: priceNum,
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


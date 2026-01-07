import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { assertAdmin } from "@/lib/api-auth"

export async function GET(request: NextRequest) {
    try {
        await assertAdmin(request)

        const items = await prisma.stockItem.findMany({
            orderBy: { updatedAt: "desc" }
        })

        return NextResponse.json(items)
    } catch (error: unknown) {
        if (error instanceof Error && error.message === "Unauthorized") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to fetch stock items" },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        await assertAdmin(request)
        const body = await request.json()
        const { name, current, unit, minRequired, price } = body

        // Validate numeric fields
        const currentNum = typeof current === "string" ? parseFloat(current) : typeof current === "number" ? current : NaN
        if (isNaN(currentNum) || currentNum < 0) {
            return NextResponse.json({ error: "current to'g'ri son bo'lishi kerak va 0 dan katta yoki teng" }, { status: 400 })
        }

        const minRequiredNum = typeof minRequired === "string" ? parseFloat(minRequired) : typeof minRequired === "number" ? minRequired : NaN
        if (isNaN(minRequiredNum) || minRequiredNum < 0) {
            return NextResponse.json({ error: "minRequired to'g'ri son bo'lishi kerak va 0 dan katta yoki teng" }, { status: 400 })
        }

        const priceNum = typeof price === "string" ? parseFloat(price) : typeof price === "number" ? price : NaN
        if (isNaN(priceNum) || priceNum < 0) {
            return NextResponse.json({ error: "price to'g'ri son bo'lishi kerak va 0 dan katta yoki teng" }, { status: 400 })
        }

        const item = await prisma.stockItem.create({
            data: {
                name,
                current: currentNum,
                unit,
                minRequired: minRequiredNum,
                price: priceNum
            }
        })

        return NextResponse.json(item, { status: 201 })
    } catch (error: unknown) {
        if (error instanceof Error && error.message === "Unauthorized") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to create stock item" },
            { status: 500 }
        )
    }
}


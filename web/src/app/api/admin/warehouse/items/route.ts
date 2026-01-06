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

        const item = await prisma.stockItem.create({
            data: {
                name,
                current: parseFloat(current),
                unit,
                minRequired: parseFloat(minRequired),
                price: parseFloat(price)
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


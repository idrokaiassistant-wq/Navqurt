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
        const { name, current, unit, minRequired, price } = body

        // Validate numeric fields if provided
        let currentNum: number | undefined = undefined
        if (current !== undefined && current !== null) {
            currentNum = typeof current === "string" ? parseFloat(current) : typeof current === "number" ? current : NaN
            if (isNaN(currentNum) || currentNum < 0) {
                return NextResponse.json({ error: "current to'g'ri son bo'lishi kerak va 0 dan katta yoki teng" }, { status: 400 })
            }
        }

        let minRequiredNum: number | undefined = undefined
        if (minRequired !== undefined && minRequired !== null) {
            minRequiredNum = typeof minRequired === "string" ? parseFloat(minRequired) : typeof minRequired === "number" ? minRequired : NaN
            if (isNaN(minRequiredNum) || minRequiredNum < 0) {
                return NextResponse.json({ error: "minRequired to'g'ri son bo'lishi kerak va 0 dan katta yoki teng" }, { status: 400 })
            }
        }

        let priceNum: number | undefined = undefined
        if (price !== undefined && price !== null) {
            priceNum = typeof price === "string" ? parseFloat(price) : typeof price === "number" ? price : NaN
            if (isNaN(priceNum) || priceNum < 0) {
                return NextResponse.json({ error: "price to'g'ri son bo'lishi kerak va 0 dan katta yoki teng" }, { status: 400 })
            }
        }

        const item = await prisma.stockItem.update({
            where: { id },
            data: {
                name,
                current: currentNum,
                unit,
                minRequired: minRequiredNum,
                price: priceNum
            }
        })

        return NextResponse.json(item)
    } catch (error: unknown) {
        if (error instanceof Error && error.message === "Unauthorized") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to update stock item" },
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

        await prisma.stockItem.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })
    } catch (error: unknown) {
        if (error instanceof Error && error.message === "Unauthorized") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to delete stock item" },
            { status: 500 }
        )
    }
}

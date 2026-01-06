import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { assertAdmin } from "@/lib/api-auth"
import { OrderStatus } from "@prisma/client"

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await assertAdmin(request)
        const { id } = await params
        const body = await request.json()
        const { status } = body

        if (!status || !Object.values(OrderStatus).includes(status)) {
            return NextResponse.json(
                { error: "Invalid status" },
                { status: 400 }
            )
        }

        const order = await prisma.order.update({
            where: { id },
            data: { status }
        })

        return NextResponse.json(order)
    } catch (error: unknown) {
        if (error instanceof Error && error.message === "Unauthorized") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to update order" },
            { status: 500 }
        )
    }
}

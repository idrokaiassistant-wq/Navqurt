import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { assertAdmin } from "@/lib/api-auth"

export async function GET(request: NextRequest) {
    try {
        await assertAdmin(request)

        const users = await prisma.user.findMany({
            include: {
                orders: {
                    include: {
                        items: true
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        })

        const customers = users.map(user => ({
            id: user.id,
            telegramId: user.telegramId.toString(),
            fullName: user.fullName,
            phone: user.phone,
            createdAt: user.createdAt.toISOString(),
            totalOrders: user.orders.length,
            totalSpent: user.orders.reduce((sum, order) => sum + order.totalAmount + order.deliveryFee, 0)
        }))

        return NextResponse.json({ customers })
    } catch (error: unknown) {
        if (error instanceof Error && error.message === "Unauthorized") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to fetch customers" },
            { status: 500 }
        )
    }
}


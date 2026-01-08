import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { assertAdmin } from "@/lib/api-auth"
import { withApiErrorHandler, successResponse } from "@/lib/api-response"

export async function GET(request: NextRequest) {
    return withApiErrorHandler(async () => {
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

        return successResponse({ customers })
    })
}


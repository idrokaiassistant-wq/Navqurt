import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { assertAdmin } from "@/lib/api-auth"
import { withApiErrorHandler, successResponse } from "@/lib/api-response"

import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { assertAdmin } from "@/lib/api-auth"
import { withApiErrorHandler, successResponse } from "@/lib/api-response"
import { parseIntSafe } from "@/lib/validation"

export async function GET(request: NextRequest) {
    return withApiErrorHandler(async () => {
        await assertAdmin(request)
    }, { method: 'GET', path: '/api/admin/customers' })

        // Pagination parameters
        const searchParams = request.nextUrl.searchParams
        const page = parseIntSafe(searchParams.get("page") || "1", "Page").value || 1
        const limit = parseIntSafe(searchParams.get("limit") || "50", "Limit").value || 50
        
        // Validate and clamp pagination values
        const pageNumber = Math.max(1, page)
        const pageSize = Math.min(Math.max(1, limit), 200) // Max 200 items per page
        const skip = (pageNumber - 1) * pageSize

        // Fetch users with pagination
        const [users, totalCount] = await Promise.all([
            prisma.user.findMany({
                include: {
                    orders: {
                        include: {
                            items: true
                        }
                    }
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: pageSize
            }),
            prisma.user.count()
        ])

        const customers = users.map(user => ({
            id: user.id,
            telegramId: user.telegramId.toString(),
            fullName: user.fullName,
            phone: user.phone,
            createdAt: user.createdAt.toISOString(),
            totalOrders: user.orders.length,
            totalSpent: user.orders.reduce((sum, order) => sum + order.totalAmount + order.deliveryFee, 0)
        }))

        const totalPages = Math.ceil(totalCount / pageSize)

        return successResponse({ 
            customers,
            pagination: {
                page: pageNumber,
                limit: pageSize,
                total: totalCount,
                totalPages,
                hasNextPage: pageNumber < totalPages,
                hasPreviousPage: pageNumber > 1
            }
        })
    })
}


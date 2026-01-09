import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { assertAdmin } from "@/lib/api-auth"
import { OrderStatus } from "@prisma/client"
import { withApiErrorHandler, successResponse } from "@/lib/api-response"
import { parseIntSafe } from "@/lib/validation"

export async function GET(request: NextRequest) {
    return withApiErrorHandler(async () => {
        await assertAdmin(request)

        // Pagination parameters
        const searchParams = request.nextUrl.searchParams
        const page = parseIntSafe(searchParams.get("page") || "1", "Page").value || 1
        const limit = parseIntSafe(searchParams.get("limit") || "50", "Limit").value || 50
        const statusFilter = searchParams.get("status")
        
        // Validate and clamp pagination values
        const pageNumber = Math.max(1, page)
        const pageSize = Math.min(Math.max(1, limit), 200) // Max 200 items per page
        const skip = (pageNumber - 1) * pageSize

        // Build where clause
        const whereClause: { status?: OrderStatus } = {}
        if (statusFilter && Object.values(OrderStatus).includes(statusFilter as OrderStatus)) {
            whereClause.status = statusFilter as OrderStatus
        }

        // Fetch orders with pagination and filtering
        const [orders, totalCount] = await Promise.all([
            prisma.order.findMany({
                where: whereClause,
                include: {
                    user: true,
                    region: true,
                    items: {
                        include: {
                            product: true,
                            variant: true
                        }
                    }
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: pageSize
            }),
            prisma.order.count({ where: whereClause })
        ])

        const totalPages = Math.ceil(totalCount / pageSize)

        return successResponse({ 
            orders,
            pagination: {
                page: pageNumber,
                limit: pageSize,
                total: totalCount,
                totalPages,
                hasNextPage: pageNumber < totalPages,
                hasPreviousPage: pageNumber > 1
            }
        })
    }, { method: 'GET', path: '/api/admin/orders' })
}


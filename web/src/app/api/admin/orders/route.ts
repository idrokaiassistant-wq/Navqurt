import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { assertAdmin } from "@/lib/api-auth"
import { withApiErrorHandler, successResponse } from "@/lib/api-response"
import { parseIntSafe } from "@/lib/validation"

export async function GET(request: NextRequest) {
    return withApiErrorHandler(async () => {
        await assertAdmin(request)

        // Pagination parameters
        const searchParams = request.nextUrl.searchParams
        const page = parseIntSafe(searchParams.get("page") || "1", "Page").value || 1
        const limit = parseIntSafe(searchParams.get("limit") || "50", "Limit").value || 50
        
        // Validate and clamp pagination values
        const pageNumber = Math.max(1, page)
        const pageSize = Math.min(Math.max(1, limit), 200) // Max 200 items per page
        const skip = (pageNumber - 1) * pageSize

        // Fetch orders with pagination
        const [orders, totalCount] = await Promise.all([
            prisma.order.findMany({
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
            prisma.order.count()
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


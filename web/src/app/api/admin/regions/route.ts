import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { assertAdmin } from "@/lib/api-auth"
import { withApiErrorHandler, successResponse } from "@/lib/api-response"

export async function GET(request: NextRequest) {
    return withApiErrorHandler(async () => {
        await assertAdmin(request)

        // Fetch all active regions
        const regions = await prisma.region.findMany({
            where: {
                isActive: true
            },
            orderBy: {
                name: "asc"
            }
        })

        return successResponse({ regions })
    }, { method: 'GET', path: '/api/admin/regions' })
}

import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { assertAdmin } from "@/lib/api-auth"
import { withApiErrorHandler, successResponse } from "@/lib/api-response"

export async function GET(request: NextRequest) {
    return withApiErrorHandler(async () => {
        await assertAdmin(request)

        const orders = await prisma.order.findMany({
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
            orderBy: { createdAt: "desc" }
        })

        return successResponse({ orders })
    })
}


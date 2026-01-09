import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { assertAdmin } from "@/lib/api-auth"
import { OrderStatus } from "@prisma/client"
import { withApiErrorHandler, successResponse, badRequestResponse, notFoundResponse } from "@/lib/api-response"
import { validateEnum } from "@/lib/validation"

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    return withApiErrorHandler(async () => {
        await assertAdmin(request)
        const { id } = await params

        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                user: true,
                region: true,
                items: {
                    include: {
                        product: true,
                        variant: true
                    }
                }
            }
        })

        if (!order) {
            return notFoundResponse("Buyurtma topilmadi")
        }

        return successResponse({ order })
    }, { method: 'GET', path: '/api/admin/orders/[id]' })
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    return withApiErrorHandler(async () => {
        await assertAdmin(request)
        const { id } = await params
        const body = await request.json()
        const { status } = body

        // Validation
        const statusValidation = validateEnum<OrderStatus>(
            status,
            Object.values(OrderStatus) as OrderStatus[],
            "Status"
        )
        if (!statusValidation.valid) {
            return badRequestResponse(statusValidation.error!)
        }

        const order = await prisma.order.update({
            where: { id },
            data: { status: statusValidation.value! }
        })

        return successResponse({ order })
    }, { method: 'PATCH', path: '/api/admin/orders/[id]' })
}

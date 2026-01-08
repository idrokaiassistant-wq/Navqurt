import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { assertAdmin } from "@/lib/api-auth"
import { OrderStatus } from "@prisma/client"
import { withApiErrorHandler, successResponse, badRequestResponse } from "@/lib/api-response"
import { validateEnum } from "@/lib/validation"

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
    })
}

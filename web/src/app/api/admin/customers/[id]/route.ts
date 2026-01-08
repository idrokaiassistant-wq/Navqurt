import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { assertAdmin } from "@/lib/api-auth"
import { withApiErrorHandler, successResponse, badRequestResponse, notFoundResponse, messageResponse } from "@/lib/api-response"
import { validateStringLength } from "@/lib/validation"

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    return withApiErrorHandler(async () => {
        await assertAdmin(request)
        const { id } = await params
        const body = await request.json()
        const { fullName, phone, regionId, address } = body

        // Check if customer exists
        const existingCustomer = await prisma.user.findUnique({
            where: { id }
        })

        if (!existingCustomer) {
            return notFoundResponse("Mijoz topilmadi")
        }

        // Build update data
        const updateData: {
            fullName?: string | null
            phone?: string | null
            regionId?: string | null
            address?: string | null
        } = {}

        // Validate and set fullName
        if (fullName !== undefined) {
            if (fullName === null || fullName.trim() === "") {
                updateData.fullName = null
            } else {
                const nameValidation = validateStringLength(fullName.trim(), 1, 200, "Ism")
                if (!nameValidation.valid) {
                    return badRequestResponse(nameValidation.error!)
                }
                updateData.fullName = fullName.trim()
            }
        }

        // Validate and set phone
        if (phone !== undefined) {
            if (phone === null || phone.trim() === "") {
                updateData.phone = null
            } else {
                const phoneValidation = validateStringLength(phone.trim(), 1, 20, "Telefon")
                if (!phoneValidation.valid) {
                    return badRequestResponse(phoneValidation.error!)
                }
                updateData.phone = phone.trim()
            }
        }

        // Validate and set address
        if (address !== undefined) {
            if (address === null || address.trim() === "") {
                updateData.address = null
            } else {
                const addressValidation = validateStringLength(address.trim(), 1, 500, "Manzil")
                if (!addressValidation.valid) {
                    return badRequestResponse(addressValidation.error!)
                }
                updateData.address = address.trim()
            }
        }

        // Validate regionId if provided
        if (regionId !== undefined) {
            if (regionId === null || regionId === "") {
                updateData.regionId = null
            } else {
                const region = await prisma.region.findUnique({
                    where: { id: regionId }
                })
                if (!region) {
                    return badRequestResponse("Noto'g'ri region tanlangan")
                }
                updateData.regionId = regionId
            }
        }

        // Update customer
        const customer = await prisma.user.update({
            where: { id },
            data: updateData,
            include: {
                orders: {
                    include: {
                        items: true
                    }
                }
            }
        })

        const customerResponse = {
            id: customer.id,
            telegramId: customer.telegramId.toString(),
            fullName: customer.fullName,
            phone: customer.phone,
            regionId: customer.regionId,
            address: customer.address,
            createdAt: customer.createdAt.toISOString(),
            totalOrders: customer.orders.length,
            totalSpent: customer.orders.reduce((sum, order) => sum + order.totalAmount + order.deliveryFee, 0)
        }

        return successResponse({ customer: customerResponse })
    }, { method: 'PATCH', path: '/api/admin/customers/[id]' })
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    return withApiErrorHandler(async () => {
        await assertAdmin(request)
        const { id } = await params

        // Check if customer exists
        const customer = await prisma.user.findUnique({
            where: { id },
            include: {
                orders: true
            }
        })

        if (!customer) {
            return notFoundResponse("Mijoz topilmadi")
        }

        // Check if customer has orders
        if (customer.orders.length > 0) {
            return badRequestResponse(`Bu mijoz ${customer.orders.length} ta buyurtmaga ega. Buyurtmalari bor mijozni o'chirib bo'lmaydi.`)
        }

        // Delete customer
        await prisma.user.delete({
            where: { id }
        })

        return messageResponse("Mijoz muvaffaqiyatli o'chirildi")
    }, { method: 'DELETE', path: '/api/admin/customers/[id]' })
}

import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { assertAdmin } from "@/lib/api-auth"
import { withApiErrorHandler, successResponse, createdResponse, badRequestResponse, conflictResponse } from "@/lib/api-response"
import { parseIntSafe, validateRequired, validateStringLength } from "@/lib/validation"

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
            regionId: user.regionId,
            address: user.address,
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
    }, { method: 'GET', path: '/api/admin/customers' })
}

export async function POST(request: NextRequest) {
    return withApiErrorHandler(async () => {
        await assertAdmin(request)

        const body = await request.json()
        const { telegramId, fullName, phone, regionId, address } = body

        // Validate telegramId (required, must be a number)
        if (telegramId === undefined || telegramId === null || telegramId === "") {
            return badRequestResponse("Telegram ID kiritilishi shart")
        }

        const telegramIdNum = BigInt(String(telegramId))
        if (telegramIdNum <= 0) {
            return badRequestResponse("Telegram ID musbat son bo'lishi kerak")
        }

        // Check if telegramId already exists
        const existingUser = await prisma.user.findUnique({
            where: { telegramId: telegramIdNum }
        })

        if (existingUser) {
            return conflictResponse("Bu Telegram ID allaqachon mavjud")
        }

        // Validate fullName if provided
        if (fullName !== undefined && fullName !== null && fullName.trim() !== "") {
            const nameValidation = validateStringLength(fullName.trim(), 1, 200, "Ism")
            if (!nameValidation.valid) {
                return badRequestResponse(nameValidation.error!)
            }
        }

        // Validate phone if provided
        if (phone !== undefined && phone !== null && phone.trim() !== "") {
            const phoneValidation = validateStringLength(phone.trim(), 1, 20, "Telefon")
            if (!phoneValidation.valid) {
                return badRequestResponse(phoneValidation.error!)
            }
        }

        // Validate address if provided
        if (address !== undefined && address !== null && address.trim() !== "") {
            const addressValidation = validateStringLength(address.trim(), 1, 500, "Manzil")
            if (!addressValidation.valid) {
                return badRequestResponse(addressValidation.error!)
            }
        }

        // Validate regionId if provided
        if (regionId !== undefined && regionId !== null && regionId !== "") {
            const region = await prisma.region.findUnique({
                where: { id: regionId }
            })
            if (!region) {
                return badRequestResponse("Noto'g'ri region tanlangan")
            }
        }

        // Create customer
        const customer = await prisma.user.create({
            data: {
                telegramId: telegramIdNum,
                fullName: fullName?.trim() || null,
                phone: phone?.trim() || null,
                regionId: regionId || null,
                address: address?.trim() || null,
            },
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

        return createdResponse({ customer: customerResponse })
    }, { method: 'POST', path: '/api/admin/customers' })
}


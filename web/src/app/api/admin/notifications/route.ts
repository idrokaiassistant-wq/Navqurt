import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { withApiErrorHandler, successResponse } from "@/lib/api-response"
import { assertAdmin } from "@/lib/api-auth"

/**
 * GET /api/admin/notifications
 * Get all notifications for the admin user
 */
export const GET = withApiErrorHandler(async (request: NextRequest) => {
    await assertAdmin(request)

    // Get recent orders to create order notifications
    const recentOrders = await prisma?.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
            user: true,
            region: true,
        },
    }) || []

    // Get low stock items
    const lowStockItems = await prisma?.stockItem.findMany({
        where: {
            current: {
                lte: 10 // Less than or equal to 10
            },
            minRequired: {
                gt: 0
            }
        },
        take: 5,
    }) || []

    // Build notifications array
    const notifications = []

    // Order notifications (last 24 hours)
    const oneDayAgo = new Date()
    oneDayAgo.setHours(oneDayAgo.getHours() - 24)

    recentOrders.forEach(order => {
        if (new Date(order.createdAt) >= oneDayAgo) {
            const isNew = order.status === 'NEW'
            notifications.push({
                id: `order-${order.id}`,
                title: isNew ? 'Yangi buyurtma' : `${order.status} - Buyurtma yangilandi`,
                message: `${order.user.fullName || 'Mijoz'} - ${order.totalAmount + order.deliveryFee} so'm`,
                type: 'order' as const,
                read: false,
                createdAt: order.createdAt.toISOString(),
                link: `/dashboard/orders?orderId=${order.id}`,
            })
        }
    })

    // Stock notifications
    lowStockItems.forEach(item => {
        notifications.push({
            id: `stock-${item.id}`,
            title: 'Omborxona ogohlantirishi',
            message: `${item.name} kam qolmoqda (${item.current} ${item.unit})`,
            type: 'stock' as const,
            read: false,
            createdAt: item.updatedAt.toISOString(),
            link: '/dashboard/warehouse',
        })
    })

    // Sort by createdAt (newest first)
    notifications.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    // Limit to 20 notifications
    const limitedNotifications = notifications.slice(0, 20)

    return successResponse({
        notifications: limitedNotifications,
    })
})

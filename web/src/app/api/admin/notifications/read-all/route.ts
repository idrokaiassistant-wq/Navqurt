import { NextRequest } from "next/server"
import { withApiErrorHandler, successResponse } from "@/lib/api-response"
import { assertAdmin } from "@/lib/api-auth"

/**
 * PATCH /api/admin/notifications/read-all
 * Mark all notifications as read
 */
export const PATCH = withApiErrorHandler(async (request: NextRequest) => {
    await assertAdmin(request)

    // For now, we just return success since we're using in-memory notifications
    // In production, you'd update a database table
    return successResponse({
        message: "Barcha xabarnomalar o'qilgan deb belgilandi",
    })
})

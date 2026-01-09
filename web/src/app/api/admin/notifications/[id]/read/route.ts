import { NextRequest } from "next/server"
import { withApiErrorHandler, successResponse } from "@/lib/api-response"
import { assertAdmin } from "@/lib/api-auth"

/**
 * PATCH /api/admin/notifications/[id]/read
 * Mark a specific notification as read
 */
export const PATCH = withApiErrorHandler(async (
    request: NextRequest,
    { params }: { params: { id: string } }
) => {
    await assertAdmin(request)

    const { id } = params

    // For now, we just return success since we're using in-memory notifications
    // In production, you'd update a database table
    return successResponse({
        message: `Xabarnoma ${id} o'qilgan deb belgilandi`,
    })
})

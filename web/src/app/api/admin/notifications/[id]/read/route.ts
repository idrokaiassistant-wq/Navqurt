import { NextRequest } from "next/server"
import { withApiErrorHandler, successResponse } from "@/lib/api-response"
import { assertAdmin } from "@/lib/api-auth"

/**
 * PATCH /api/admin/notifications/[id]/read
 * Mark a specific notification as read
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    return withApiErrorHandler(async () => {
        await assertAdmin(request)

        const { id } = await params

        // For now, we just return success since we're using in-memory notifications
        // In production, you'd update a database table
        return successResponse({
            message: `Xabarnoma ${id} o'qilgan deb belgilandi`,
        })
    }, { method: 'PATCH', path: '/api/admin/notifications/[id]/read' })
}

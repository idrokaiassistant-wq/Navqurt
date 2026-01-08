import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { withApiErrorHandler, notFoundResponse } from "@/lib/api-response"

/**
 * Get image by ID
 * Returns image as base64 data URL
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    return withApiErrorHandler(async () => {
        const { id } = await params

        const image = await prisma.image.findUnique({
            where: { id }
        })

        if (!image) {
            return notFoundResponse("Rasm topilmadi")
        }

        // Convert base64 to data URL
        const dataUrl = `data:${image.mimeType};base64,${image.data}`

        // Return as image
        const buffer = Buffer.from(image.data, 'base64')
        
        return new NextResponse(buffer, {
            headers: {
                'Content-Type': image.mimeType,
                'Content-Length': buffer.length.toString(),
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        })
    })
}

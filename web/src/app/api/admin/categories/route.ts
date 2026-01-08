import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { assertAdmin } from "@/lib/api-auth"
import { withApiErrorHandler, successResponse, createdResponse, badRequestResponse } from "@/lib/api-response"
import { validateRequired, validateStringLength, parseIntSafe } from "@/lib/validation"

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

        // Fetch categories with pagination
        const [categories, totalCount] = await Promise.all([
            prisma.category.findMany({
                orderBy: { createdAt: "desc" },
                skip,
                take: pageSize
            }),
            prisma.category.count()
        ])

        const totalPages = Math.ceil(totalCount / pageSize)

        return successResponse({ 
            categories,
            pagination: {
                page: pageNumber,
                limit: pageSize,
                total: totalCount,
                totalPages,
                hasNextPage: pageNumber < totalPages,
                hasPreviousPage: pageNumber > 1
            }
        })
    })
}

export async function POST(request: NextRequest) {
    return withApiErrorHandler(async () => {
        await assertAdmin(request)

        const body = await request.json().catch(() => ({}))
        const name = body?.name ? String(body.name).trim() : ""
        const color = body?.color ? String(body.color).trim() : null

        // Validation
        const nameValidation = validateRequired(name, "Nomi")
        if (!nameValidation.valid) {
            return badRequestResponse(nameValidation.error!)
        }

        const nameLengthValidation = validateStringLength(name, 1, 100, "Nomi")
        if (!nameLengthValidation.valid) {
            return badRequestResponse(nameLengthValidation.error!)
        }

        const category = await prisma.category.create({
            data: { 
                name, 
                color: color && color.length > 0 ? color : null 
            },
        })

        return createdResponse({ category })
    })
}





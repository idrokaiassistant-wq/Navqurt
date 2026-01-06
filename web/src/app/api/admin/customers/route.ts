import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { assertAdmin } from "@/lib/api-auth"

export async function GET(request: NextRequest) {
    try {
        await assertAdmin(request)

        const customers = await prisma.user.findMany({
            include: {
                orders: true,
                _count: {
                    select: { orders: true }
                }
            },
            orderBy: { createdAt: "desc" }
        })

        return NextResponse.json(customers)
    } catch (error: unknown) {
        if (error instanceof Error && error.message === "Unauthorized") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to fetch customers" },
            { status: 500 }
        )
    }
}


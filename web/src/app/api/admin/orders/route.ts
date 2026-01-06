import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { assertAdmin } from "@/lib/api-auth"

export async function GET(request: NextRequest) {
    try {
        await assertAdmin(request)

        const orders = await prisma.order.findMany({
            include: {
                user: true,
                region: true,
                items: {
                    include: {
                        product: true,
                        variant: true
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        })

        return NextResponse.json({ orders })
    } catch (error: unknown) {
        if (error instanceof Error && error.message === "Unauthorized") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to fetch orders" },
            { status: 500 }
        )
    }
}


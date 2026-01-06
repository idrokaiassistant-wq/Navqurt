import { NextResponse } from "next/server"

export async function GET() {
    try {
        // Database connection check
        const { prisma } = await import("@/lib/prisma")
        
        if (prisma) {
            // Try a simple query to check DB connection
            await prisma.$queryRaw`SELECT 1`
        }

        return NextResponse.json(
            {
                status: "ok",
                timestamp: new Date().toISOString(),
                database: prisma ? "connected" : "not configured"
            },
            { status: 200 }
        )
    } catch (error) {
        return NextResponse.json(
            {
                status: "error",
                timestamp: new Date().toISOString(),
                error: error instanceof Error ? error.message : "Unknown error"
            },
            { status: 500 }
        )
    }
}


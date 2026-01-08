import { NextResponse } from "next/server"
import { getHealthMetrics } from "@/lib/monitoring"

export async function GET() {
    try {
        const metrics = await getHealthMetrics()

        return NextResponse.json(
            {
                status: metrics.status,
                timestamp: metrics.timestamp,
                database: {
                    status: metrics.database.healthy ? "connected" : "disconnected",
                    latency: metrics.database.latency ? `${metrics.database.latency}ms` : undefined
                },
                memory: metrics.memory,
                ...(metrics.prisma && { prisma: metrics.prisma })
            },
            { 
                status: metrics.status === 'healthy' ? 200 : metrics.status === 'degraded' ? 200 : 503 
            }
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




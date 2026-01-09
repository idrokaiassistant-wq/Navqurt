/**
 * Production Monitoring Utilities
 * Provides Prisma metrics and performance monitoring
 */

import { prisma } from './prisma'
import { logPerformance, logWarn, logError } from './logger'

/**
 * Get Prisma connection pool metrics
 * Note: Prisma 5.x has $metrics property (experimental, requires previewFeatures in schema)
 */
export async function getPrismaMetrics(): Promise<{
  connections?: number
  poolSize?: number
  activeQueries?: number
} | null> {
  try {
    // Prisma 5.x metrics (if available)
    const prismaWithMetrics = prisma as unknown as {
      $metrics?: () => Promise<{
        pools?: Array<{ connections?: number; maxConnections?: number }>
        queries?: { active?: number }
      }>
    }

    if (prismaWithMetrics.$metrics && typeof prismaWithMetrics.$metrics === 'function') {
      const metrics = await prismaWithMetrics.$metrics()
      return {
        connections: metrics.pools?.[0]?.connections,
        poolSize: metrics.pools?.[0]?.maxConnections,
        activeQueries: metrics.queries?.active,
      }
    }

    return null
  } catch (error) {
    // Metrics might not be available or enabled
    if (process.env.NODE_ENV === 'development') {
      logWarn('[MONITORING] Prisma metrics not available', error)
    }
    return null
  }
}

/**
 * Check database connection health
 */
export async function checkDatabaseHealth(): Promise<{
  healthy: boolean
  latency?: number
  error?: string
}> {
  const startTime = Date.now()

  try {
    await prisma.$queryRaw`SELECT 1`
    const latency = Date.now() - startTime

    // Log slow database queries
    if (latency > 500) {
      logWarn('[DB SLOW] Database query took', latency, 'ms')
    }

    logPerformance('db_query_latency', latency)

    return {
      healthy: true,
      latency,
    }
  } catch (error) {
    const latency = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    logError('[DB HEALTH] Database health check failed', error)

    return {
      healthy: false,
      latency,
      error: errorMessage,
    }
  }
}

/**
 * Monitor memory usage (Node.js process)
 */
export function getMemoryUsage(): {
  rss: number // Resident Set Size (total memory allocated)
  heapTotal: number // Total heap memory allocated
  heapUsed: number // Heap memory used
  external: number // Memory used by C++ objects
} {
  const usage = process.memoryUsage()

  // Convert to MB for readability
  return {
    rss: Math.round(usage.rss / 1024 / 1024),
    heapTotal: Math.round(usage.heapTotal / 1024 / 1024),
    heapUsed: Math.round(usage.heapUsed / 1024 / 1024),
    external: Math.round(usage.external / 1024 / 1024),
  }
}

/**
 * Log memory usage if high (>80% of available)
 */
export function checkMemoryUsage(threshold: number = 80): void {
  const usage = getMemoryUsage()
  const maxHeap = process.env.NODE_OPTIONS?.match(/max-old-space-size=(\d+)/)?.[1]
  const maxHeapMB = maxHeap ? parseInt(maxHeap, 10) : 512 // Default 512MB

  const heapPercent = (usage.heapUsed / maxHeapMB) * 100

  if (heapPercent > threshold) {
    logWarn('[MEMORY] High memory usage', {
      heapUsed: `${usage.heapUsed}MB`,
      heapTotal: `${usage.heapTotal}MB`,
      percent: `${Math.round(heapPercent)}%`,
      rss: `${usage.rss}MB`,
    })
  }

  // Always log in development
  if (process.env.NODE_ENV === 'development') {
    logPerformance('memory_heap_used', usage.heapUsed, 'MB')
    logPerformance('memory_rss', usage.rss, 'MB')
  }
}

/**
 * Enhanced health check with metrics
 */
export async function getHealthMetrics(): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  database: {
    healthy: boolean
    latency?: number
  }
  memory: ReturnType<typeof getMemoryUsage>
  prisma?: ReturnType<typeof getPrismaMetrics> extends Promise<infer T> ? T : never
}> {
  const [dbHealth, prismaMetrics] = await Promise.all([
    checkDatabaseHealth(),
    getPrismaMetrics(),
  ])

  const memory = getMemoryUsage()

  // Determine overall status
  let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
  if (!dbHealth.healthy) {
    status = 'unhealthy'
  } else if (dbHealth.latency && dbHealth.latency > 1000) {
    status = 'degraded'
  }

  return {
    status,
    timestamp: new Date().toISOString(),
    database: {
      healthy: dbHealth.healthy,
      latency: dbHealth.latency,
    },
    memory,
    prisma: prismaMetrics || undefined,
  }
}

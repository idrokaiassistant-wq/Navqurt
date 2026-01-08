import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

// Production-hardened Prisma client configuration
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
        ? ['query', 'error', 'warn'] 
        : ['error'],
    errorFormat: 'minimal',
})

// Graceful shutdown handling for production
if (process.env.NODE_ENV === 'production') {
    // Disconnect Prisma on process termination
    process.on('beforeExit', async () => {
        await prisma.$disconnect()
    })
    
    process.on('SIGINT', async () => {
        await prisma.$disconnect()
        process.exit(0)
    })
    
    process.on('SIGTERM', async () => {
        await prisma.$disconnect()
        process.exit(0)
    })
} else {
    // Development: reuse singleton instance
    globalForPrisma.prisma = prisma
}

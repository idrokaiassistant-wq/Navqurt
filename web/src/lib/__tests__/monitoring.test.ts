import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getMemoryUsage, checkMemoryUsage } from '../monitoring'

// Logger'ni mock qilish
vi.mock('../logger', () => ({
    logPerformance: vi.fn(),
    logWarn: vi.fn(),
    logError: vi.fn(),
}))

describe('monitoring', () => {
    const originalEnv = { ...process.env }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    afterEach(() => {
        process.env = { ...originalEnv }
    })

    describe('getMemoryUsage', () => {
        it("memory ob'yektini qaytaradi", () => {
            const memory = getMemoryUsage()

            expect(memory).toHaveProperty('rss')
            expect(memory).toHaveProperty('heapTotal')
            expect(memory).toHaveProperty('heapUsed')
            expect(memory).toHaveProperty('external')
        })

        it("MB da qaytaradi (0 dan katta)", () => {
            const memory = getMemoryUsage()

            expect(memory.rss).toBeGreaterThan(0)
            expect(memory.heapUsed).toBeGreaterThan(0)
        })

        it("barcha qiymatlar number tipida", () => {
            const memory = getMemoryUsage()

            expect(typeof memory.rss).toBe('number')
            expect(typeof memory.heapTotal).toBe('number')
            expect(typeof memory.heapUsed).toBe('number')
            expect(typeof memory.external).toBe('number')
        })
    })

    describe('checkMemoryUsage', () => {
        it("default threshold bilan ishlaydi", () => {
            expect(() => checkMemoryUsage()).not.toThrow()
        })

        it("custom threshold (50) bilan ishlaydi", () => {
            expect(() => checkMemoryUsage(50)).not.toThrow()
        })

        it("custom threshold (90) bilan ishlaydi", () => {
            expect(() => checkMemoryUsage(90)).not.toThrow()
        })

        it("past threshold (1) bilan ishlaydi", () => {
            expect(() => checkMemoryUsage(1)).not.toThrow()
        })
    })

    describe('getPrismaMetrics', () => {
        it("funksiya mavjud", async () => {
            const { getPrismaMetrics } = await import('../monitoring')
            expect(typeof getPrismaMetrics).toBe('function')
        })
    })

    describe('checkDatabaseHealth', () => {
        it("funksiya mavjud", async () => {
            const { checkDatabaseHealth } = await import('../monitoring')
            expect(typeof checkDatabaseHealth).toBe('function')
        })
    })

    describe('getHealthMetrics', () => {
        it("funksiya mavjud", async () => {
            const { getHealthMetrics } = await import('../monitoring')
            expect(typeof getHealthMetrics).toBe('function')
        })
    })
})

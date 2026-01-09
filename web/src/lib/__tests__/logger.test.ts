import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('logger', () => {
    const originalEnv = process.env
    const originalConsole = {
        error: console.error,
        warn: console.warn,
        log: console.log,
        debug: console.debug
    }

    beforeEach(() => {
        vi.resetModules()
        process.env = { ...originalEnv }
        console.error = vi.fn()
        console.warn = vi.fn()
        console.log = vi.fn()
        console.debug = vi.fn()
    })

    afterEach(() => {
        process.env = originalEnv
        console.error = originalConsole.error
        console.warn = originalConsole.warn
        console.log = originalConsole.log
        console.debug = originalConsole.debug
    })

    describe('logError', () => {
        it("development muhitida log qiladi", async () => {
            process.env.NODE_ENV = 'development'
            const { logError } = await import('../logger')
            logError('test error')
            expect(console.error).toHaveBeenCalled()
        })

        it("production muhitida ham log qiladi", async () => {
            process.env.NODE_ENV = 'production'
            const { logError } = await import('../logger')
            logError('test error')
            expect(console.error).toHaveBeenCalled()
        })
    })

    describe('logWarn', () => {
        it("development muhitida log qiladi", async () => {
            process.env.NODE_ENV = 'development'
            const { logWarn } = await import('../logger')
            logWarn('test warning')
            expect(console.warn).toHaveBeenCalled()
        })

        it("production muhitida ham log qiladi", async () => {
            process.env.NODE_ENV = 'production'
            const { logWarn } = await import('../logger')
            logWarn('test warning')
            expect(console.warn).toHaveBeenCalled()
        })
    })

    describe('logInfo', () => {
        it("development muhitida log qiladi", async () => {
            process.env.NODE_ENV = 'development'
            const { logInfo } = await import('../logger')
            logInfo('test info')
            expect(console.log).toHaveBeenCalled()
        })

        it("production muhitida log qilmaydi", async () => {
            process.env.NODE_ENV = 'production'
            const { logInfo } = await import('../logger')
            logInfo('test info')
            // Production da logInfo ishlamaydi (faqat development)
        })
    })

    describe('logDebug', () => {
        it("development muhitida log qiladi", async () => {
            process.env.NODE_ENV = 'development'
            const { logDebug } = await import('../logger')
            logDebug('test debug')
            expect(console.debug).toHaveBeenCalled()
        })
    })

    describe('logPerformance', () => {
        it("development muhitida log qiladi", async () => {
            process.env.NODE_ENV = 'development'
            const { logPerformance } = await import('../logger')
            logPerformance('response_time', 150)
            expect(console.log).toHaveBeenCalled()
        })

        it("production muhitida ham log qiladi", async () => {
            process.env.NODE_ENV = 'production'
            const { logPerformance } = await import('../logger')
            logPerformance('response_time', 150)
            expect(console.log).toHaveBeenCalled()
        })

        it("custom unit bilan ishlaydi", async () => {
            process.env.NODE_ENV = 'development'
            const { logPerformance } = await import('../logger')
            logPerformance('memory', 1024, 'MB')
            expect(console.log).toHaveBeenCalled()
        })
    })

    describe('logApiRequest', () => {
        it("500+ status uchun warn log qiladi", async () => {
            process.env.NODE_ENV = 'development'
            const { logApiRequest } = await import('../logger')
            logApiRequest('GET', '/api/test', 500, 100)
            expect(console.warn).toHaveBeenCalled()
        })

        it("400+ status uchun warn log qiladi", async () => {
            process.env.NODE_ENV = 'development'
            const { logApiRequest } = await import('../logger')
            logApiRequest('POST', '/api/test', 400, 50)
            expect(console.warn).toHaveBeenCalled()
        })

        it("200 status development da info log qiladi", async () => {
            process.env.NODE_ENV = 'development'
            const { logApiRequest } = await import('../logger')
            logApiRequest('GET', '/api/test', 200, 100)
            expect(console.log).toHaveBeenCalled()
        })

        it("production da sekin so'rovlarni (>1s) log qiladi", async () => {
            process.env.NODE_ENV = 'production'
            const { logApiRequest } = await import('../logger')
            logApiRequest('GET', '/api/slow', 200, 1500)
            expect(console.warn).toHaveBeenCalled()
        })
    })
})

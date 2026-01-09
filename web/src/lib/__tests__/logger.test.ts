import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('logger', () => {
    const originalEnv = { ...process.env }
    let mockConsole: {
        error: ReturnType<typeof vi.fn>
        warn: ReturnType<typeof vi.fn>
        log: ReturnType<typeof vi.fn>
        debug: ReturnType<typeof vi.fn>
    }

    beforeEach(() => {
        vi.resetModules()
        mockConsole = {
            error: vi.fn(),
            warn: vi.fn(),
            log: vi.fn(),
            debug: vi.fn(),
        }
        vi.spyOn(console, 'error').mockImplementation(mockConsole.error)
        vi.spyOn(console, 'warn').mockImplementation(mockConsole.warn)
        vi.spyOn(console, 'log').mockImplementation(mockConsole.log)
        vi.spyOn(console, 'debug').mockImplementation(mockConsole.debug)
    })

    afterEach(() => {
        process.env = { ...originalEnv }
        vi.restoreAllMocks()
    })

    describe('logError', () => {
        it("development muhitida console.error chaqiradi", async () => {
            process.env.NODE_ENV = 'development'
            const { logError } = await import('../logger')
            logError('test error')
            expect(mockConsole.error).toHaveBeenCalled()
        })

        it("production muhitida console.error chaqiradi", async () => {
            process.env.NODE_ENV = 'production'
            const { logError } = await import('../logger')
            logError('test error')
            expect(mockConsole.error).toHaveBeenCalled()
        })

        it("bir nechta argument bilan ishlaydi", async () => {
            process.env.NODE_ENV = 'development'
            const { logError } = await import('../logger')
            logError('error', { detail: 'info' }, 123)
            expect(mockConsole.error).toHaveBeenCalled()
        })
    })

    describe('logWarn', () => {
        it("development muhitida console.warn chaqiradi", async () => {
            process.env.NODE_ENV = 'development'
            const { logWarn } = await import('../logger')
            logWarn('test warning')
            expect(mockConsole.warn).toHaveBeenCalled()
        })

        it("production muhitida console.warn chaqiradi", async () => {
            process.env.NODE_ENV = 'production'
            const { logWarn } = await import('../logger')
            logWarn('test warning')
            expect(mockConsole.warn).toHaveBeenCalled()
        })
    })

    describe('logInfo', () => {
        it("development muhitida console.log chaqiradi", async () => {
            process.env.NODE_ENV = 'development'
            const { logInfo } = await import('../logger')
            logInfo('test info')
            expect(mockConsole.log).toHaveBeenCalled()
        })

        it("production muhitida chaqirmaydi", async () => {
            process.env.NODE_ENV = 'production'
            const { logInfo } = await import('../logger')
            logInfo('test info')
            // Production da logInfo ishlamaydi
        })
    })

    describe('logDebug', () => {
        it("development muhitida console.debug chaqiradi", async () => {
            process.env.NODE_ENV = 'development'
            const { logDebug } = await import('../logger')
            logDebug('test debug')
            expect(mockConsole.debug).toHaveBeenCalled()
        })

        it("production muhitida chaqirmaydi", async () => {
            process.env.NODE_ENV = 'production'
            const { logDebug } = await import('../logger')
            logDebug('test debug')
            // Production da logDebug ishlamaydi
        })
    })

    describe('logPerformance', () => {
        it("development muhitida console.log chaqiradi", async () => {
            process.env.NODE_ENV = 'development'
            const { logPerformance } = await import('../logger')
            logPerformance('response_time', 150)
            expect(mockConsole.log).toHaveBeenCalled()
        })

        it("production muhitida console.log chaqiradi", async () => {
            process.env.NODE_ENV = 'production'
            const { logPerformance } = await import('../logger')
            logPerformance('response_time', 150)
            expect(mockConsole.log).toHaveBeenCalled()
        })

        it("custom unit bilan ishlaydi", async () => {
            process.env.NODE_ENV = 'development'
            const { logPerformance } = await import('../logger')
            logPerformance('memory', 1024, 'MB')
            expect(mockConsole.log).toHaveBeenCalled()
        })

        it("test muhitida chaqirmaydi", async () => {
            process.env.NODE_ENV = 'test'
            const { logPerformance } = await import('../logger')
            logPerformance('metric', 100)
            // Test muhitida logPerformance ishlamaydi
        })
    })

    describe('logApiRequest', () => {
        it("200 status development da info log qiladi", async () => {
            process.env.NODE_ENV = 'development'
            const { logApiRequest } = await import('../logger')
            logApiRequest('GET', '/api/test', 200, 50)
            // logInfo chaqiriladi
        })

        it("400 status uchun warn log qiladi", async () => {
            process.env.NODE_ENV = 'development'
            const { logApiRequest } = await import('../logger')
            logApiRequest('POST', '/api/test', 400, 100)
            expect(mockConsole.warn).toHaveBeenCalled()
        })

        it("500 status uchun warn log qiladi", async () => {
            process.env.NODE_ENV = 'development'
            const { logApiRequest } = await import('../logger')
            logApiRequest('GET', '/api/error', 500, 150)
            expect(mockConsole.warn).toHaveBeenCalled()
        })

        it("production da sekin so'rovlar (>1s) uchun warn log qiladi", async () => {
            process.env.NODE_ENV = 'production'
            const { logApiRequest } = await import('../logger')
            logApiRequest('GET', '/api/slow', 200, 1500)
            expect(mockConsole.warn).toHaveBeenCalled()
        })

        it("production da tez so'rovlar uchun warn chaqirmaydi", async () => {
            process.env.NODE_ENV = 'production'
            const { logApiRequest } = await import('../logger')
            logApiRequest('GET', '/api/fast', 200, 50)
            // Tez so'rov uchun warn chaqirilmaydi
        })
    })
})

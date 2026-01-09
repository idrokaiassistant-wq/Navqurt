import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('telegram-webapp', () => {
    beforeEach(() => {
        vi.resetModules()
    })

    afterEach(() => {
        vi.unstubAllGlobals()
    })

    describe('getTelegramWebApp', () => {
        it("window undefined bo'lsa null", async () => {
            vi.stubGlobal('window', undefined)
            const { getTelegramWebApp } = await import('../telegram-webapp')
            expect(getTelegramWebApp()).toBeNull()
        })

        it("Telegram undefined bo'lsa null", async () => {
            vi.stubGlobal('window', {})
            const { getTelegramWebApp } = await import('../telegram-webapp')
            expect(getTelegramWebApp()).toBeNull()
        })

        it("WebApp mavjud bo'lsa qaytaradi", async () => {
            const mockWebApp = { version: '6.0' }
            vi.stubGlobal('window', { Telegram: { WebApp: mockWebApp } })
            const { getTelegramWebApp } = await import('../telegram-webapp')
            expect(getTelegramWebApp()).toEqual(mockWebApp)
        })
    })

    describe('isTelegramWebApp', () => {
        it("window undefined bo'lsa false", async () => {
            vi.stubGlobal('window', undefined)
            const { isTelegramWebApp } = await import('../telegram-webapp')
            expect(isTelegramWebApp()).toBe(false)
        })

        it("Telegram undefined bo'lsa false", async () => {
            vi.stubGlobal('window', {})
            const { isTelegramWebApp } = await import('../telegram-webapp')
            expect(isTelegramWebApp()).toBe(false)
        })

        it("WebApp mavjud bo'lsa true", async () => {
            vi.stubGlobal('window', { Telegram: { WebApp: {} } })
            const { isTelegramWebApp } = await import('../telegram-webapp')
            expect(isTelegramWebApp()).toBe(true)
        })
    })

    describe('getTelegramUser', () => {
        it("WebApp yo'q bo'lsa null", async () => {
            vi.stubGlobal('window', {})
            const { getTelegramUser } = await import('../telegram-webapp')
            expect(getTelegramUser()).toBeNull()
        })

        it("user mavjud bo'lsa qaytaradi", async () => {
            const mockUser = { id: 123, first_name: 'Test' }
            vi.stubGlobal('window', {
                Telegram: { WebApp: { initDataUnsafe: { user: mockUser } } }
            })
            const { getTelegramUser } = await import('../telegram-webapp')
            expect(getTelegramUser()).toEqual(mockUser)
        })
    })

    describe('initTelegramWebApp', () => {
        it("WebApp yo'q bo'lsa null va warning", async () => {
            const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { })
            vi.stubGlobal('window', {})
            const { initTelegramWebApp } = await import('../telegram-webapp')
            expect(initTelegramWebApp()).toBeNull()
            warnSpy.mockRestore()
        })

        it("WebApp mavjud bo'lsa ready va expand chaqiriladi", async () => {
            const mockWebApp = {
                themeParams: {},
                viewportHeight: 600,
                viewportStableHeight: 600,
                ready: vi.fn(),
                expand: vi.fn(),
                onEvent: vi.fn(),
            }
            vi.stubGlobal('window', {
                Telegram: { WebApp: mockWebApp },
                document: { documentElement: { style: { setProperty: vi.fn() } } }
            })
            const { initTelegramWebApp } = await import('../telegram-webapp')
            const result = initTelegramWebApp()
            expect(result).not.toBeNull()
            expect(mockWebApp.ready).toHaveBeenCalled()
            expect(mockWebApp.expand).toHaveBeenCalled()
        })
    })
})

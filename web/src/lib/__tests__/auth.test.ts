import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('auth', () => {


    beforeEach(() => {
        vi.resetModules()
        vi.stubEnv('NEXTAUTH_SECRET', undefined)
    })

    afterEach(() => {
        vi.unstubAllEnvs()
    })

    describe('getAuthSecret', () => {
        it("NEXTAUTH_SECRET mavjud bo'lsa qaytaradi", async () => {
            vi.stubEnv('NEXTAUTH_SECRET', 'my-super-secret')
            const { getAuthSecret } = await import('../auth')
            expect(getAuthSecret()).toBe('my-super-secret')
        })

        it("development muhitida fallback qaytaradi", async () => {
            vi.stubEnv('NODE_ENV', 'development')
            const { getAuthSecret } = await import('../auth')
            expect(getAuthSecret()).toBe('dev-nextauth-secret')
        })

        it("test muhitida fallback qaytaradi", async () => {
            vi.stubEnv('NODE_ENV', 'test')
            const { getAuthSecret } = await import('../auth')
            expect(getAuthSecret()).toBe('dev-nextauth-secret')
        })

        it("production muhitida secret yo'q bo'lsa xato tashlaydi", async () => {
            vi.stubEnv('NODE_ENV', 'production')
            const { getAuthSecret } = await import('../auth')
            expect(() => getAuthSecret()).toThrow('NEXTAUTH_SECRET')
        })
    })

    describe('DEV_ADMIN_EMAIL', () => {
        it("string bo'lishi kerak", async () => {
            const { DEV_ADMIN_EMAIL } = await import('../auth')
            expect(typeof DEV_ADMIN_EMAIL).toBe('string')
        })

        it("email formatida bo'lishi kerak", async () => {
            const { DEV_ADMIN_EMAIL } = await import('../auth')
            expect(DEV_ADMIN_EMAIL).toContain('@')
        })

        it("default qiymatga ega", async () => {
            const { DEV_ADMIN_EMAIL } = await import('../auth')
            expect(DEV_ADMIN_EMAIL.length).toBeGreaterThan(0)
        })
    })

    describe('DEV_ADMIN_PASSWORD', () => {
        it("string bo'lishi kerak", async () => {
            const { DEV_ADMIN_PASSWORD } = await import('../auth')
            expect(typeof DEV_ADMIN_PASSWORD).toBe('string')
        })

        it("bo'sh bo'lmasligi kerak", async () => {
            const { DEV_ADMIN_PASSWORD } = await import('../auth')
            expect(DEV_ADMIN_PASSWORD.length).toBeGreaterThan(0)
        })

        it("default qiymatga ega", async () => {
            const { DEV_ADMIN_PASSWORD } = await import('../auth')
            expect(DEV_ADMIN_PASSWORD).toBeDefined()
        })
    })
})

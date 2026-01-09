import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getAuthSecret, DEV_ADMIN_EMAIL, DEV_ADMIN_PASSWORD } from '../auth'

describe('auth', () => {
    const originalEnv = process.env

    beforeEach(() => {
        vi.resetModules()
        process.env = { ...originalEnv }
    })

    afterEach(() => {
        process.env = originalEnv
    })

    describe('getAuthSecret', () => {
        it("NEXTAUTH_SECRET mavjud bo'lsa uni qaytaradi", () => {
            process.env.NEXTAUTH_SECRET = 'my-super-secret'
            // Re-import to get fresh module
            const { getAuthSecret: freshGetAuthSecret } = require('../auth')
            expect(freshGetAuthSecret()).toBe('my-super-secret')
        })

        it("development muhitida fallback qaytaradi", () => {
            process.env.NEXTAUTH_SECRET = undefined
            process.env.NODE_ENV = 'development'
            const { getAuthSecret: freshGetAuthSecret } = require('../auth')
            expect(freshGetAuthSecret()).toBe('dev-nextauth-secret')
        })

        it("production muhitida secret yo'q bo'lsa xato tashlaydi", () => {
            process.env.NEXTAUTH_SECRET = undefined
            process.env.NODE_ENV = 'production'
            const { getAuthSecret: freshGetAuthSecret } = require('../auth')
            expect(() => freshGetAuthSecret()).toThrow('NEXTAUTH_SECRET production muhitida majburiy')
        })
    })

    describe('DEV_ADMIN_EMAIL', () => {
        it("default qiymat mavjud", () => {
            expect(typeof DEV_ADMIN_EMAIL).toBe('string')
            expect(DEV_ADMIN_EMAIL.length).toBeGreaterThan(0)
        })
    })

    describe('DEV_ADMIN_PASSWORD', () => {
        it("default qiymat mavjud", () => {
            expect(typeof DEV_ADMIN_PASSWORD).toBe('string')
            expect(DEV_ADMIN_PASSWORD.length).toBeGreaterThan(0)
        })
    })
})

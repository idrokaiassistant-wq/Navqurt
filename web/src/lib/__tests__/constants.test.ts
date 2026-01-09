import { describe, it, expect } from 'vitest'
import {
    DEFAULT_EMAIL_DOMAIN,
    DEFAULT_ADMIN_EMAIL,
    STORAGE_KEYS,
    PASSWORD_MIN_LENGTH,
    DEFAULT_NOTIFICATIONS
} from '../constants'

describe('constants', () => {
    describe('DEFAULT_EMAIL_DOMAIN', () => {
        it("to'g'ri domain qaytaradi", () => {
            expect(DEFAULT_EMAIL_DOMAIN).toBe('@navqurt.uz')
        })

        it("@ bilan boshlanadi", () => {
            expect(DEFAULT_EMAIL_DOMAIN.startsWith('@')).toBe(true)
        })
    })

    describe('DEFAULT_ADMIN_EMAIL', () => {
        it("to'g'ri email qaytaradi", () => {
            expect(DEFAULT_ADMIN_EMAIL).toBe('admin@navqurt.uz')
        })

        it("navqurt.uz domainida", () => {
            expect(DEFAULT_ADMIN_EMAIL.endsWith('@navqurt.uz')).toBe(true)
        })
    })

    describe('STORAGE_KEYS', () => {
        it("NOTIFICATIONS kaliti mavjud", () => {
            expect(STORAGE_KEYS.NOTIFICATIONS).toBe('navqurt_notifications')
        })

        it("THEME kaliti mavjud", () => {
            expect(STORAGE_KEYS.THEME).toBe('navqurt-theme')
        })

        it("immutable obyekt", () => {
            // TypeScript 'as const' tufayli readonly
            expect(typeof STORAGE_KEYS).toBe('object')
        })
    })

    describe('PASSWORD_MIN_LENGTH', () => {
        it("6 dan kam bo'lmasligi kerak", () => {
            expect(PASSWORD_MIN_LENGTH).toBeGreaterThanOrEqual(6)
        })

        it("son bo'lishi kerak", () => {
            expect(typeof PASSWORD_MIN_LENGTH).toBe('number')
        })
    })

    describe('DEFAULT_NOTIFICATIONS', () => {
        it("newOrders default true", () => {
            expect(DEFAULT_NOTIFICATIONS.newOrders).toBe(true)
        })

        it("deliveredOrders default true", () => {
            expect(DEFAULT_NOTIFICATIONS.deliveredOrders).toBe(true)
        })

        it("newCustomers default false", () => {
            expect(DEFAULT_NOTIFICATIONS.newCustomers).toBe(false)
        })

        it("systemUpdates default true", () => {
            expect(DEFAULT_NOTIFICATIONS.systemUpdates).toBe(true)
        })

        it("barcha kerakli kalitlar mavjud", () => {
            const keys = Object.keys(DEFAULT_NOTIFICATIONS)
            expect(keys).toContain('newOrders')
            expect(keys).toContain('deliveredOrders')
            expect(keys).toContain('newCustomers')
            expect(keys).toContain('systemUpdates')
        })
    })
})

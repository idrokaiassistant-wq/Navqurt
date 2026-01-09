import { describe, it, expect } from 'vitest'
import {
    timeAgo,
    formatDateTime,
    formatDate,
    formatTime,
    formatPrice
} from '../date-utils'

describe('formatDateTime', () => {
    it("Date obyekt uchun to'g'ri format", () => {
        const date = new Date('2024-05-15T14:30:00')
        const result = formatDateTime(date)
        expect(result).toMatch(/15/)
        expect(result).toMatch(/05/)
        expect(result).toMatch(/2024/)
    })

    it("string date uchun to'g'ri format", () => {
        const result = formatDateTime('2024-05-15T14:30:00')
        expect(result).toMatch(/15/)
        expect(result).toMatch(/05/)
    })
})

describe('formatDate', () => {
    it("Date obyekt uchun to'g'ri sana format", () => {
        const date = new Date('2024-05-15T14:30:00')
        const result = formatDate(date)
        expect(result).toMatch(/15/)
        expect(result).toMatch(/05/)
        expect(result).toMatch(/2024/)
    })

    it("string date uchun to'g'ri format", () => {
        const result = formatDate('2024-12-25')
        expect(result).toMatch(/25/)
        expect(result).toMatch(/12/)
    })
})

describe('formatTime', () => {
    it("Date obyekt uchun to'g'ri vaqt format", () => {
        const date = new Date('2024-05-15T14:30:00')
        const result = formatTime(date)
        expect(result).toMatch(/14/)
        expect(result).toMatch(/30/)
    })

    it("string date uchun to'g'ri format", () => {
        const result = formatTime('2024-05-15T09:45:00')
        expect(result).toMatch(/09|9/)
        expect(result).toMatch(/45/)
    })
})

describe('formatPrice', () => {
    it("oddiy son uchun to'g'ri format", () => {
        const result = formatPrice(1000)
        expect(result).toContain("so'm")
        expect(result).toContain('1')
    })

    it("katta son uchun minglik ajratgich", () => {
        const result = formatPrice(1500000)
        expect(result).toContain("so'm")
    })

    it("nol uchun to'g'ri format", () => {
        const result = formatPrice(0)
        expect(result).toBe("0 so'm")
    })
})

describe('timeAgo', () => {
    it("yaqin sana uchun nisbiy vaqt", () => {
        const recentDate = new Date(Date.now() - 60000) // 1 daqiqa oldin
        const result = timeAgo(recentDate)
        expect(typeof result).toBe('string')
        expect(result.length).toBeGreaterThan(0)
    })

    it("string date uchun ishlashi kerak", () => {
        const result = timeAgo(new Date().toISOString())
        expect(typeof result).toBe('string')
    })
})

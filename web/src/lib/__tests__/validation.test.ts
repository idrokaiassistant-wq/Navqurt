import { describe, it, expect } from 'vitest'
import {
    parseIntSafe,
    parseFloatSafe,
    validateRequired,
    validateEmail,
    validateStringLength,
    validateArray,
    validateEnum,
    validatePositiveNumber,
    validateNonNegativeNumber
} from '../validation'

describe('parseIntSafe', () => {
    it('valid int qaytarish kerak', () => {
        const result = parseIntSafe(42, 'test')
        expect(result.valid).toBe(true)
        expect(result.value).toBe(42)
    })

    it('string son parse qilish kerak', () => {
        const result = parseIntSafe('123', 'test')
        expect(result.valid).toBe(true)
        expect(result.value).toBe(123)
    })

    it('invalid string uchun xato qaytarish', () => {
        const result = parseIntSafe('abc', 'test')
        expect(result.valid).toBe(false)
        expect(result.error).toContain("to'g'ri son emas")
    })

    it('null uchun xato qaytarish', () => {
        const result = parseIntSafe(null, 'test')
        expect(result.valid).toBe(false)
        expect(result.error).toContain('majburiy')
    })

    it('float uchun xato qaytarish', () => {
        const result = parseIntSafe(3.14, 'test')
        expect(result.valid).toBe(false)
        expect(result.error).toContain('butun son')
    })
})

describe('parseFloatSafe', () => {
    it('valid float qaytarish kerak', () => {
        const result = parseFloatSafe(3.14, 'test')
        expect(result.valid).toBe(true)
        expect(result.value).toBe(3.14)
    })

    it('string son parse qilish kerak', () => {
        const result = parseFloatSafe('3.14', 'test')
        expect(result.valid).toBe(true)
        expect(result.value).toBe(3.14)
    })

    it('invalid string uchun xato qaytarish', () => {
        const result = parseFloatSafe('abc', 'test')
        expect(result.valid).toBe(false)
    })

    it('null uchun xato qaytarish', () => {
        const result = parseFloatSafe(null, 'test')
        expect(result.valid).toBe(false)
    })
})

describe('validateRequired', () => {
    it('valid qiymat uchun true qaytarish', () => {
        const result = validateRequired('hello', 'test')
        expect(result.valid).toBe(true)
    })

    it("bo'sh string uchun false qaytarish", () => {
        const result = validateRequired('', 'test')
        expect(result.valid).toBe(false)
        expect(result.error).toContain('majburiy')
    })

    it('null uchun false qaytarish', () => {
        const result = validateRequired(null, 'test')
        expect(result.valid).toBe(false)
    })

    it('undefined uchun false qaytarish', () => {
        const result = validateRequired(undefined, 'test')
        expect(result.valid).toBe(false)
    })

    it('faqat probel string uchun false qaytarish', () => {
        const result = validateRequired('   ', 'test')
        expect(result.valid).toBe(false)
    })
})

describe('validateEmail', () => {
    it("to'g'ri email uchun true qaytarish", () => {
        const result = validateEmail('test@example.com')
        expect(result.valid).toBe(true)
    })

    it("noto'g'ri format uchun false qaytarish", () => {
        const result = validateEmail('invalid-email')
        expect(result.valid).toBe(false)
        expect(result.error).toContain("noto'g'ri")
    })

    it("bo'sh email uchun false qaytarish", () => {
        const result = validateEmail('')
        expect(result.valid).toBe(false)
    })

    it("@ yo'q email uchun false qaytarish", () => {
        const result = validateEmail('testexample.com')
        expect(result.valid).toBe(false)
    })
})

describe('validateStringLength', () => {
    it('minimal va maksimal uzunlik orasida valid', () => {
        const result = validateStringLength('hello', 3, 10, 'test')
        expect(result.valid).toBe(true)
    })

    it("juda qisqa string uchun false", () => {
        const result = validateStringLength('hi', 3, 10, 'test')
        expect(result.valid).toBe(false)
        expect(result.error).toContain('kamida')
    })

    it("juda uzun string uchun false", () => {
        const result = validateStringLength('hello world!', 3, 10, 'test')
        expect(result.valid).toBe(false)
        expect(result.error).toContain("ko'pi bilan")
    })
})

describe('validateArray', () => {
    it("array uchun true qaytarish", () => {
        const result = validateArray([1, 2, 3], 'test')
        expect(result.valid).toBe(true)
        expect(result.value).toEqual([1, 2, 3])
    })

    it("bo'sh array uchun true qaytarish", () => {
        const result = validateArray([], 'test')
        expect(result.valid).toBe(true)
    })

    it("array bo'lmagan uchun false qaytarish", () => {
        const result = validateArray('not array', 'test')
        expect(result.valid).toBe(false)
        expect(result.error).toContain('array')
    })
})

describe('validateEnum', () => {
    const validValues = ['NEW', 'CONFIRMED', 'DELIVERED'] as const

    it("valid enum qiymat uchun true qaytarish", () => {
        const result = validateEnum('NEW', validValues, 'status')
        expect(result.valid).toBe(true)
        expect(result.value).toBe('NEW')
    })

    it("invalid enum qiymat uchun false qaytarish", () => {
        const result = validateEnum('INVALID', validValues, 'status')
        expect(result.valid).toBe(false)
        expect(result.error).toContain('quyidagi qiymatlardan biri')
    })

    it("non-string qiymat uchun false qaytarish", () => {
        const result = validateEnum(123 as unknown, validValues, 'status')
        expect(result.valid).toBe(false)
        expect(result.error).toContain('string')
    })

    it("null uchun false qaytarish", () => {
        const result = validateEnum(null as unknown, validValues, 'status')
        expect(result.valid).toBe(false)
    })
})

describe('validatePositiveNumber', () => {
    it("musbat son uchun true qaytarish", () => {
        const result = validatePositiveNumber(5, 'test')
        expect(result.valid).toBe(true)
    })

    it("nol uchun false qaytarish", () => {
        const result = validatePositiveNumber(0, 'test')
        expect(result.valid).toBe(false)
        expect(result.error).toContain('musbat')
    })

    it("manfiy son uchun false qaytarish", () => {
        const result = validatePositiveNumber(-5, 'test')
        expect(result.valid).toBe(false)
    })
})

describe('validateNonNegativeNumber', () => {
    it("musbat son uchun true qaytarish", () => {
        const result = validateNonNegativeNumber(5, 'test')
        expect(result.valid).toBe(true)
    })

    it("nol uchun true qaytarish", () => {
        const result = validateNonNegativeNumber(0, 'test')
        expect(result.valid).toBe(true)
    })

    it("manfiy son uchun false qaytarish", () => {
        const result = validateNonNegativeNumber(-5, 'test')
        expect(result.valid).toBe(false)
        expect(result.error).toContain('manfiy')
    })

    it("NaN uchun false qaytarish", () => {
        const result = validateNonNegativeNumber(NaN, 'test')
        expect(result.valid).toBe(false)
        expect(result.error).toContain('son')
    })
})

// Edge cases uchun qo'shimcha testlar
describe('validateStringLength edge cases', () => {
    it("non-string uchun xato qaytaradi", () => {
        // TypeScript bu yerda xato beradi, lekin runtime da mumkin
        const result = validateStringLength(123 as unknown as string, 1, 10, 'test')
        expect(result.valid).toBe(false)
        expect(result.error).toContain('string')
    })
})

describe('validatePositiveNumber edge cases', () => {
    it("NaN uchun false qaytarish", () => {
        const result = validatePositiveNumber(NaN, 'test')
        expect(result.valid).toBe(false)
        expect(result.error).toContain('son')
    })

    it("non-number uchun false qaytarish", () => {
        const result = validatePositiveNumber('5' as unknown as number, 'test')
        expect(result.valid).toBe(false)
    })
})

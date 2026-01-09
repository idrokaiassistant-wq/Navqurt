import { describe, it, expect } from 'vitest'
import { cn } from '../utils'

describe('cn (classname utility)', () => {
    it("bitta class qaytaradi", () => {
        expect(cn('text-red-500')).toBe('text-red-500')
    })

    it("bir nechta classlarni birlashtiradi", () => {
        const result = cn('p-4', 'bg-white', 'text-black')
        expect(result).toContain('p-4')
        expect(result).toContain('bg-white')
        expect(result).toContain('text-black')
    })

    it("conditional classlarni qo'shadi", () => {
        const isActive = true
        const result = cn('base', isActive && 'active')
        expect(result).toContain('base')
        expect(result).toContain('active')
    })

    it("false conditional classni qo'shmaydi", () => {
        const isActive = false
        const result = cn('base', isActive && 'active')
        expect(result).toBe('base')
        expect(result).not.toContain('active')
    })

    it("tailwind conflictlarni hal qiladi", () => {
        // twMerge p-4 va p-2 ni merge qiladi, oxirgisi qoladi
        const result = cn('p-4', 'p-2')
        expect(result).toBe('p-2')
    })

    it("undefined va null qiymatlarni e'tiborsiz qoldiradi", () => {
        const result = cn('base', undefined, null, 'extra')
        expect(result).toContain('base')
        expect(result).toContain('extra')
    })

    it("bo'sh string qaytaradi agar hech narsa berilmasa", () => {
        const result = cn()
        expect(result).toBe('')
    })

    it("array classlarni qo'llaydi", () => {
        const result = cn(['p-4', 'bg-blue-500'])
        expect(result).toContain('p-4')
        expect(result).toContain('bg-blue-500')
    })
})

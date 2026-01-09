import { describe, it, expect } from 'vitest'
import { validateFile } from '../file-storage'

describe('file-storage', () => {
    describe('validateFile', () => {
        it("JPEG fayl uchun valid qaytaradi", () => {
            const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
            expect(validateFile(file).valid).toBe(true)
        })

        it("PNG fayl uchun valid qaytaradi", () => {
            const file = new File(['test'], 'test.png', { type: 'image/png' })
            expect(validateFile(file).valid).toBe(true)
        })

        it("WebP fayl uchun valid qaytaradi", () => {
            const file = new File(['test'], 'test.webp', { type: 'image/webp' })
            expect(validateFile(file).valid).toBe(true)
        })

        it("GIF fayl uchun valid qaytaradi", () => {
            const file = new File(['test'], 'test.gif', { type: 'image/gif' })
            expect(validateFile(file).valid).toBe(true)
        })

        it("noto'g'ri fayl turi uchun error qaytaradi", () => {
            const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
            const result = validateFile(file)
            expect(result.valid).toBe(false)
            expect(result.error).toContain('rasm fayllari')
        })

        it("katta hajmli fayl uchun error qaytaradi", () => {
            const largeFile = { name: 'large.jpg', type: 'image/jpeg', size: 6 * 1024 * 1024 } as File
            const result = validateFile(largeFile)
            expect(result.valid).toBe(false)
            expect(result.error).toContain('5MB')
        })

        it("5MB da aniq fayl valid", () => {
            const exactFile = { name: 'exact.jpg', type: 'image/jpeg', size: 5 * 1024 * 1024 } as File
            expect(validateFile(exactFile).valid).toBe(true)
        })

        it("5MB dan kichik fayl valid", () => {
            const smallFile = { name: 'small.jpg', type: 'image/jpeg', size: 1024 * 1024 } as File
            expect(validateFile(smallFile).valid).toBe(true)
        })
    })

    describe('uploadFile', () => {
        it("funksiya mavjud", async () => {
            const { uploadFile } = await import('../file-storage')
            expect(typeof uploadFile).toBe('function')
        })
    })

    describe('deleteFile', () => {
        it("funksiya mavjud", async () => {
            const { deleteFile } = await import('../file-storage')
            expect(typeof deleteFile).toBe('function')
        })
    })
})

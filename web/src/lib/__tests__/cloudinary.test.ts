import { describe, it, expect, vi } from 'vitest'

// Mock config va logger
vi.mock('../config', () => ({
    getCloudinaryConfig: vi.fn(() => {
        throw new Error('Cloudinary not configured')
    }),
}))

vi.mock('../logger', () => ({
    logWarn: vi.fn(),
}))

// Mock cloudinary SDK
vi.mock('cloudinary', () => ({
    v2: {
        config: vi.fn(),
    },
}))

describe('cloudinary', () => {
    describe('configureCloudinary', () => {
        it("konfiguratsiya funksiyasi mavjud", async () => {
            const cloudinaryModule = await import('../cloudinary')
            expect(cloudinaryModule.configureCloudinary).toBeDefined()
        })

        it("env yo'q bo'lsa xato tashlaydi", async () => {
            const { configureCloudinary } = await import('../cloudinary')

            // Configuration should throw because getCloudinaryConfig throws
            expect(() => configureCloudinary()).toThrow()
        })
    })

    describe('default export', () => {
        it("cloudinary v2 eksport qilinadi", async () => {
            const cloudinaryModule = await import('../cloudinary')
            expect(cloudinaryModule.default).toBeDefined()
        })
    })
})

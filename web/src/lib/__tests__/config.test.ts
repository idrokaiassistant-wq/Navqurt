import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('config', () => {
    const originalEnv = { ...process.env }

    beforeEach(() => {
        vi.resetModules()
        // Clear all relevant env vars
        delete process.env.CLOUDINARY_CLOUD_NAME
        delete process.env.CLOUDINARY_API_KEY
        delete process.env.CLOUDINARY_API_SECRET
        delete process.env.DATABASE_URL
        delete process.env.NEXTAUTH_SECRET
    })

    afterEach(() => {
        process.env = { ...originalEnv }
    })

    describe('getCloudinaryConfig', () => {
        it("barcha env mavjud bo'lsa config qaytaradi", async () => {
            process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud'
            process.env.CLOUDINARY_API_KEY = 'test-key'
            process.env.CLOUDINARY_API_SECRET = 'test-secret'

            const { getCloudinaryConfig } = await import('../config')
            const config = getCloudinaryConfig()

            expect(config.cloud_name).toBe('test-cloud')
            expect(config.api_key).toBe('test-key')
            expect(config.api_secret).toBe('test-secret')
        })

        it("CLOUDINARY_CLOUD_NAME yo'q bo'lsa xato", async () => {
            process.env.CLOUDINARY_API_KEY = 'test-key'
            process.env.CLOUDINARY_API_SECRET = 'test-secret'

            const { getCloudinaryConfig } = await import('../config')
            expect(() => getCloudinaryConfig()).toThrow('CLOUDINARY_CLOUD_NAME')
        })

        it("CLOUDINARY_API_KEY yo'q bo'lsa xato", async () => {
            process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud'
            process.env.CLOUDINARY_API_SECRET = 'test-secret'

            const { getCloudinaryConfig } = await import('../config')
            expect(() => getCloudinaryConfig()).toThrow('CLOUDINARY_API_KEY')
        })

        it("CLOUDINARY_API_SECRET yo'q bo'lsa xato", async () => {
            process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud'
            process.env.CLOUDINARY_API_KEY = 'test-key'

            const { getCloudinaryConfig } = await import('../config')
            expect(() => getCloudinaryConfig()).toThrow('CLOUDINARY_API_SECRET')
        })
    })

    describe('validateDatabaseConnection', () => {
        it("DATABASE_URL yo'q bo'lsa xato", async () => {
            const { validateDatabaseConnection } = await import('../config')
            expect(() => validateDatabaseConnection()).toThrow('DATABASE_URL')
        })

        it("noto'g'ri format bo'lsa xato", async () => {
            process.env.DATABASE_URL = 'mysql://localhost'

            const { validateDatabaseConnection } = await import('../config')
            expect(() => validateDatabaseConnection()).toThrow('PostgreSQL')
        })

        it("postgresql:// bilan boshlanadi", async () => {
            process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db'

            const { validateDatabaseConnection } = await import('../config')
            expect(() => validateDatabaseConnection()).not.toThrow()
        })

        it("postgres:// bilan boshlanadi", async () => {
            process.env.DATABASE_URL = 'postgres://user:pass@localhost:5432/db'

            const { validateDatabaseConnection } = await import('../config')
            expect(() => validateDatabaseConnection()).not.toThrow()
        })
    })

    describe('getNextAuthSecret', () => {
        it("NEXTAUTH_SECRET mavjud bo'lsa qaytaradi", async () => {
            process.env.NEXTAUTH_SECRET = 'my-secret-123'

            const { getNextAuthSecret } = await import('../config')
            expect(getNextAuthSecret()).toBe('my-secret-123')
        })

        it("development muhitida fallback qaytaradi", async () => {
            process.env.NODE_ENV = 'development'

            const { getNextAuthSecret } = await import('../config')
            expect(getNextAuthSecret()).toBe('dev-nextauth-secret')
        })

        it("test muhitida fallback qaytaradi", async () => {
            process.env.NODE_ENV = 'test'

            const { getNextAuthSecret } = await import('../config')
            expect(getNextAuthSecret()).toBe('dev-nextauth-secret')
        })

        it("production muhitida secret yo'q bo'lsa xato", async () => {
            process.env.NODE_ENV = 'production'

            const { getNextAuthSecret } = await import('../config')
            expect(() => getNextAuthSecret()).toThrow('NEXTAUTH_SECRET')
        })
    })

    describe('validateEnvironment', () => {
        it("development muhitida xato tashlamaydi", async () => {
            process.env.NODE_ENV = 'development'

            const { validateEnvironment } = await import('../config')
            expect(() => validateEnvironment()).not.toThrow()
        })

        it("test muhitida xato tashlamaydi", async () => {
            process.env.NODE_ENV = 'test'

            const { validateEnvironment } = await import('../config')
            expect(() => validateEnvironment()).not.toThrow()
        })

        it("production muhitida DATABASE_URL kerak", async () => {
            process.env.NODE_ENV = 'production'
            process.env.NEXTAUTH_SECRET = 'secret'

            const { validateEnvironment } = await import('../config')
            expect(() => validateEnvironment()).toThrow('DATABASE_URL')
        })

        it("production muhitida barcha env mavjud bo'lsa o'tadi", async () => {
            process.env.NODE_ENV = 'production'
            process.env.DATABASE_URL = 'postgresql://localhost/db'
            process.env.NEXTAUTH_SECRET = 'secret'

            const { validateEnvironment } = await import('../config')
            expect(() => validateEnvironment()).not.toThrow()
        })
    })
})

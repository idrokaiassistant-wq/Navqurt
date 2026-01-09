import { describe, it, expect, vi } from 'vitest'
import type { NextRequest } from 'next/server'

// Mock next-auth/jwt
vi.mock('next-auth/jwt', () => ({
    getToken: vi.fn(),
}))

// Mock prisma
vi.mock('../prisma', () => ({
    prisma: {
        adminUser: {
            findUnique: vi.fn(),
        },
    },
}))

// Mock request factory
function createMockRequest(): NextRequest {
    return { headers: new Headers() } as unknown as NextRequest
}

describe('api-auth', () => {
    describe('assertAdmin', () => {
        it("funksiya mavjud", async () => {
            const { assertAdmin } = await import('../api-auth')
            expect(typeof assertAdmin).toBe('function')
        })

        it("token yo'q bo'lsa Unauthorized xato tashlaydi", async () => {
            const { getToken } = await import('next-auth/jwt')
                ; (getToken as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null)

            const { assertAdmin } = await import('../api-auth')
            const mockRequest = createMockRequest()

            await expect(assertAdmin(mockRequest)).rejects.toThrow('Unauthorized')
        })

        it("role admin bo'lmasa Unauthorized tashlaydi", async () => {
            const { getToken } = await import('next-auth/jwt')
                ; (getToken as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ role: 'user' })

            const { assertAdmin } = await import('../api-auth')
            const mockRequest = createMockRequest()

            await expect(assertAdmin(mockRequest)).rejects.toThrow('Unauthorized')
        })

        it("admin token bo'lsa tokenni qaytaradi", async () => {
            const { getToken } = await import('next-auth/jwt')
            const mockToken = { role: 'admin', email: 'admin@navqurt.uz' }
                ; (getToken as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockToken)

            const { assertAdmin } = await import('../api-auth')
            const mockRequest = createMockRequest()

            const result = await assertAdmin(mockRequest)
            expect(result).toEqual(mockToken)
        })
    })

    describe('getAdminFromRequest', () => {
        it("funksiya mavjud", async () => {
            const { getAdminFromRequest } = await import('../api-auth')
            expect(typeof getAdminFromRequest).toBe('function')
        })

        it("admin topilmasa Unauthorized tashlaydi", async () => {
            const { getToken } = await import('next-auth/jwt')
                ; (getToken as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ role: 'admin', email: 'admin@navqurt.uz' })

            const { prisma } = await import('../prisma')
                ; (prisma.adminUser.findUnique as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null)

            const { getAdminFromRequest } = await import('../api-auth')
            const mockRequest = createMockRequest()

            await expect(getAdminFromRequest(mockRequest)).rejects.toThrow('Unauthorized')
        })

        it("admin topilsa admin ob'yektini qaytaradi", async () => {
            const { getToken } = await import('next-auth/jwt')
                ; (getToken as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ role: 'admin', email: 'admin@navqurt.uz' })

            const { prisma } = await import('../prisma')
            const mockAdmin = { id: '1', email: 'admin@navqurt.uz', name: 'Admin' }
                ; (prisma.adminUser.findUnique as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockAdmin)

            const { getAdminFromRequest } = await import('../api-auth')
            const mockRequest = createMockRequest()

            const result = await getAdminFromRequest(mockRequest)
            expect(result).toEqual(mockAdmin)
        })
    })
})

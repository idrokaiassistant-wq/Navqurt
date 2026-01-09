import { describe, it, expect, vi } from 'vitest'

// Mock NextResponse
vi.mock('next/server', () => ({
    NextResponse: {
        json: (data: unknown, init?: { status?: number }) => ({
            data,
            status: init?.status || 200,
        }),
    },
}))

// Mock logger
vi.mock('../logger', () => ({
    logApiRequest: vi.fn(),
    logError: vi.fn(),
}))

describe('api-response', () => {
    describe('ApiErrorResponse class', () => {
        it("class mavjud va yaratilishi mumkin", async () => {
            const { ApiErrorResponse } = await import('../api-response')
            const error = new ApiErrorResponse(400, 'Bad Request', 'Detail message')

            expect(error).toBeInstanceOf(Error)
            expect(error.status).toBe(400)
            expect(error.message).toBe('Bad Request')
            expect(error.detail).toBe('Detail message')
            expect(error.name).toBe('ApiErrorResponse')
        })

        it("detail ixtiyoriy", async () => {
            const { ApiErrorResponse } = await import('../api-response')
            const error = new ApiErrorResponse(404, 'Not Found')

            expect(error.detail).toBeUndefined()
        })
    })

    describe('handleApiError', () => {
        it("ApiErrorResponse ni to'g'ri qaytaradi", async () => {
            const { handleApiError, ApiErrorResponse } = await import('../api-response')
            const error = new ApiErrorResponse(400, 'Bad Request', 'Detail')
            const response = handleApiError(error)

            expect(response.status).toBe(400)
        })

        it("Unauthorized error uchun 401 qaytaradi", async () => {
            const { handleApiError } = await import('../api-response')
            const error = new Error('Unauthorized')
            const response = handleApiError(error)

            expect(response.status).toBe(401)
        })

        it("Prisma P2002 error uchun 409 qaytaradi", async () => {
            const { handleApiError } = await import('../api-response')
            const error = new Error('Unique constraint')
            error.name = 'PrismaClientKnownRequestError'
                ; (error as Error & { code: string }).code = 'P2002'
            const response = handleApiError(error)

            expect(response.status).toBe(409)
        })

        it("Prisma P2025 error uchun 404 qaytaradi", async () => {
            const { handleApiError } = await import('../api-response')
            const error = new Error('Not found')
            error.name = 'PrismaClientKnownRequestError'
                ; (error as Error & { code: string }).code = 'P2025'
            const response = handleApiError(error)

            expect(response.status).toBe(404)
        })

        it("noma'lum error uchun 500 qaytaradi", async () => {
            const { handleApiError } = await import('../api-response')
            const response = handleApiError(new Error('Random error'))

            expect(response.status).toBe(500)
        })

        it("non-Error uchun ham ishlaydi", async () => {
            const { handleApiError } = await import('../api-response')
            const response = handleApiError('string error')

            expect(response.status).toBe(500)
        })
    })

    describe('success response helpers', () => {
        it("successResponse ishlaydi", async () => {
            const { successResponse } = await import('../api-response')
            const response = successResponse({ id: 1 })

            expect(response.status).toBe(200)
        })

        it("successResponse custom status bilan", async () => {
            const { successResponse } = await import('../api-response')
            const response = successResponse({ id: 1 }, 202)

            expect(response.status).toBe(202)
        })

        it("createdResponse 201 qaytaradi", async () => {
            const { createdResponse } = await import('../api-response')
            const response = createdResponse({ id: 1 })

            expect(response.status).toBe(201)
        })

        it("messageResponse ishlaydi", async () => {
            const { messageResponse } = await import('../api-response')
            const response = messageResponse('Success')

            expect(response.status).toBe(200)
        })

        it("messageResponse custom status bilan", async () => {
            const { messageResponse } = await import('../api-response')
            const response = messageResponse('Created', 201)

            expect(response.status).toBe(201)
        })
    })

    describe('error response helpers', () => {
        it("unauthorizedResponse 401 qaytaradi", async () => {
            const { unauthorizedResponse } = await import('../api-response')
            const response = unauthorizedResponse()

            expect(response.status).toBe(401)
        })

        it("unauthorizedResponse custom message bilan", async () => {
            const { unauthorizedResponse } = await import('../api-response')
            const response = unauthorizedResponse('Token expired')

            expect(response.status).toBe(401)
        })

        it("forbiddenResponse 403 qaytaradi", async () => {
            const { forbiddenResponse } = await import('../api-response')
            const response = forbiddenResponse()

            expect(response.status).toBe(403)
        })

        it("notFoundResponse 404 qaytaradi", async () => {
            const { notFoundResponse } = await import('../api-response')
            const response = notFoundResponse()

            expect(response.status).toBe(404)
        })

        it("badRequestResponse 400 qaytaradi", async () => {
            const { badRequestResponse } = await import('../api-response')
            const response = badRequestResponse('Invalid input')

            expect(response.status).toBe(400)
        })

        it("conflictResponse 409 qaytaradi", async () => {
            const { conflictResponse } = await import('../api-response')
            const response = conflictResponse('Already exists')

            expect(response.status).toBe(409)
        })

        it("internalServerErrorResponse 500 qaytaradi", async () => {
            const { internalServerErrorResponse } = await import('../api-response')
            const response = internalServerErrorResponse('Server error')

            expect(response.status).toBe(500)
        })
    })

    describe('withApiErrorHandler', () => {
        it("muvaffaqiyatli handler natijasini qaytaradi", async () => {
            const { withApiErrorHandler, successResponse } = await import('../api-response')

            const result = await withApiErrorHandler(async () => {
                return successResponse({ id: 1 })
            }, { method: 'GET', path: '/api/test' })

            expect(result.status).toBe(200)
        })

        it("xato tashlagan handler uchun error response qaytaradi", async () => {
            const { withApiErrorHandler, ApiErrorResponse } = await import('../api-response')

            const result = await withApiErrorHandler(async () => {
                throw new ApiErrorResponse(400, 'Bad request')
            }, { method: 'POST', path: '/api/test' })

            expect(result.status).toBe(400)
        })

        it("context berilmasa UNKNOWN ishlatadi", async () => {
            const { withApiErrorHandler, successResponse } = await import('../api-response')

            const result = await withApiErrorHandler(async () => {
                return successResponse({ id: 1 })
            })

            expect(result.status).toBe(200)
        })
    })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock fetch globally
const mockFetch = vi.fn()

describe('api-client', () => {
    beforeEach(() => {
        mockFetch.mockReset()
        vi.stubGlobal('fetch', mockFetch)
    })

    describe('ApiError class', () => {
        it("class mavjud va yaratilishi mumkin", async () => {
            const { ApiError } = await import('../api-client')
            const error = new ApiError(400, 'Bad Request', 'Detail')

            expect(error).toBeInstanceOf(Error)
            expect(error.status).toBe(400)
            expect(error.message).toBe('Bad Request')
            expect(error.detail).toBe('Detail')
            expect(error.name).toBe('ApiError')
        })
    })

    describe('handleApiError', () => {
        it("ApiError dan message qaytaradi", async () => {
            const { handleApiError, ApiError } = await import('../api-client')
            const error = new ApiError(400, 'Bad Request')

            expect(handleApiError(error)).toBe('Bad Request')
        })

        it("oddiy Error dan message qaytaradi", async () => {
            const { handleApiError } = await import('../api-client')
            const error = new Error('Regular error')

            expect(handleApiError(error)).toBe('Regular error')
        })

        it("noma'lum error uchun default message", async () => {
            const { handleApiError } = await import('../api-client')

            expect(handleApiError('string error')).toBe("Noma'lum xatolik yuz berdi")
        })
    })

    describe('isUnauthorizedError', () => {
        it("401 ApiError uchun true qaytaradi", async () => {
            const { isUnauthorizedError, ApiError } = await import('../api-client')
            const error = new ApiError(401, 'Unauthorized')

            expect(isUnauthorizedError(error)).toBe(true)
        })

        it("boshqa status uchun false qaytaradi", async () => {
            const { isUnauthorizedError, ApiError } = await import('../api-client')
            const error = new ApiError(400, 'Bad Request')

            expect(isUnauthorizedError(error)).toBe(false)
        })

        it("non-ApiError uchun false qaytaradi", async () => {
            const { isUnauthorizedError } = await import('../api-client')
            const error = new Error('Regular error')

            expect(isUnauthorizedError(error)).toBe(false)
        })
    })

    describe('apiGet', () => {
        it("GET request yuboradi", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                headers: new Headers({ 'content-type': 'application/json' }),
                json: async () => ({ data: { id: 1 } }),
            })

            const { apiGet } = await import('../api-client')
            const result = await apiGet('/api/test')

            expect(mockFetch).toHaveBeenCalledWith('/api/test', expect.objectContaining({
                method: 'GET',
            }))
            expect(result).toEqual({ id: 1 })
        })
    })

    describe('apiPost', () => {
        it("POST request yuboradi", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                headers: new Headers({ 'content-type': 'application/json' }),
                json: async () => ({ data: { id: 1 } }),
            })

            const { apiPost } = await import('../api-client')
            const result = await apiPost('/api/test', { name: 'test' })

            expect(mockFetch).toHaveBeenCalledWith('/api/test', expect.objectContaining({
                method: 'POST',
            }))
            expect(result).toEqual({ id: 1 })
        })
    })

    describe('apiPatch', () => {
        it("PATCH request yuboradi", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                headers: new Headers({ 'content-type': 'application/json' }),
                json: async () => ({ data: { id: 1 } }),
            })

            const { apiPatch } = await import('../api-client')
            const result = await apiPatch('/api/test', { name: 'updated' })

            expect(mockFetch).toHaveBeenCalledWith('/api/test', expect.objectContaining({
                method: 'PATCH',
            }))
            expect(result).toEqual({ id: 1 })
        })
    })

    describe('apiDelete', () => {
        it("DELETE request yuboradi", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                headers: new Headers({ 'content-type': 'application/json' }),
                json: async () => ({ message: 'Deleted' }),
            })

            const { apiDelete } = await import('../api-client')
            const result = await apiDelete('/api/test/1')

            expect(mockFetch).toHaveBeenCalledWith('/api/test/1', expect.objectContaining({
                method: 'DELETE',
            }))
            expect(result).toEqual({ message: 'Deleted' })
        })
    })

    describe('apiPostFormData', () => {
        it("FormData bilan POST request yuboradi", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                headers: new Headers({ 'content-type': 'application/json' }),
                json: async () => ({ data: { url: '/uploads/test.jpg' } }),
            })

            const { apiPostFormData } = await import('../api-client')
            const formData = new FormData()
            formData.append('file', 'test')

            await apiPostFormData('/api/upload', formData)

            expect(mockFetch).toHaveBeenCalledWith('/api/upload', expect.objectContaining({
                method: 'POST',
                body: formData,
            }))
        })
    })

    describe('error handling', () => {
        it("non-ok response uchun error tashlaydi", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 400,
                headers: new Headers({ 'content-type': 'application/json' }),
                json: async () => ({ error: 'Bad Request' }),
            })

            const { apiGet } = await import('../api-client')

            await expect(apiGet('/api/test')).rejects.toThrow('Bad Request')
        })

        it("non-json response uchun text oladi", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
                headers: new Headers({ 'content-type': 'text/html' }),
                text: async () => 'Server Error',
            })

            const { apiGet } = await import('../api-client')

            await expect(apiGet('/api/test')).rejects.toThrow('Server Error')
        })

        it("network error uchun ApiError tashlaydi", async () => {
            mockFetch.mockRejectedValueOnce(new Error('Network error'))

            const { apiGet } = await import('../api-client')

            await expect(apiGet('/api/test')).rejects.toThrow('Network error')
        })

        it("noto'g'ri response format uchun error tashlaydi", async () => {
            // Response OK, lekin format noto'g'ri (na data, na message)
            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                headers: new Headers({ 'content-type': 'application/json' }),
                json: async () => ({ unexpected: 'format' }),
            })

            const { apiGet } = await import('../api-client')

            await expect(apiGet('/api/test')).rejects.toThrow('Javob formati')
        })

        it("error response da detail yo'q bo'lsa ishlaydi", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 400,
                headers: new Headers({ 'content-type': 'application/json' }),
                json: async () => ({}), // error key yo'q
            })

            const { apiGet } = await import('../api-client')

            await expect(apiGet('/api/test')).rejects.toThrow("Noma'lum xatolik")
        })
    })
})

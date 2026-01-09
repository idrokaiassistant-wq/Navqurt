import { describe, it, expect } from 'vitest'
import type {
    ApiErrorResponse,
    ApiSuccess,
    ApiResponse,
    PaginatedResponse,
    CloudinaryUploadResponse,
    CloudinaryDeleteResponse,
    PaginationParams,
    SortParams
} from '../types'

describe('types', () => {
    describe('ApiErrorResponse', () => {
        it("to'g'ri strukturaga ega", () => {
            const error: ApiErrorResponse = {
                error: 'Something went wrong',
                detail: 'Detailed error message'
            }
            expect(error.error).toBe('Something went wrong')
            expect(error.detail).toBe('Detailed error message')
        })

        it("detail ixtiyoriy", () => {
            const error: ApiErrorResponse = {
                error: 'Error without detail'
            }
            expect(error.error).toBe('Error without detail')
            expect(error.detail).toBeUndefined()
        })
    })

    describe('ApiSuccess', () => {
        it("data bilan ishlaydi", () => {
            const success: ApiSuccess<{ id: string }> = {
                data: { id: '123' }
            }
            expect(success.data?.id).toBe('123')
        })

        it("message bilan ishlaydi", () => {
            const success: ApiSuccess<null> = {
                message: 'Operation successful'
            }
            expect(success.message).toBe('Operation successful')
        })
    })

    describe('PaginatedResponse', () => {
        it("barcha pagination maydonlari mavjud", () => {
            const response: PaginatedResponse<{ name: string }> = {
                items: [{ name: 'Item 1' }, { name: 'Item 2' }],
                total: 100,
                page: 1,
                pageSize: 10,
                totalPages: 10
            }
            expect(response.items.length).toBe(2)
            expect(response.total).toBe(100)
            expect(response.totalPages).toBe(10)
        })
    })

    describe('CloudinaryUploadResponse', () => {
        it("secure_url va public_id majburiy", () => {
            const response: CloudinaryUploadResponse = {
                secure_url: 'https://cloudinary.com/image.jpg',
                public_id: 'folder/image'
            }
            expect(response.secure_url).toContain('https://')
            expect(response.public_id).toBe('folder/image')
        })

        it("optional maydonlar mavjud", () => {
            const response: CloudinaryUploadResponse = {
                secure_url: 'https://cloudinary.com/image.jpg',
                public_id: 'folder/image',
                format: 'jpg',
                width: 800,
                height: 600,
                bytes: 102400,
                resource_type: 'image'
            }
            expect(response.format).toBe('jpg')
            expect(response.width).toBe(800)
        })
    })

    describe('CloudinaryDeleteResponse', () => {
        it("ok result mavjud", () => {
            const response: CloudinaryDeleteResponse = {
                result: 'ok'
            }
            expect(response.result).toBe('ok')
        })

        it("not found result mavjud", () => {
            const response: CloudinaryDeleteResponse = {
                result: 'not found'
            }
            expect(response.result).toBe('not found')
        })
    })

    describe('PaginationParams', () => {
        it("page va pageSize ixtiyoriy", () => {
            const params1: PaginationParams = {}
            const params2: PaginationParams = { page: 1 }
            const params3: PaginationParams = { page: 2, pageSize: 20 }

            expect(params1.page).toBeUndefined()
            expect(params2.page).toBe(1)
            expect(params3.pageSize).toBe(20)
        })
    })

    describe('SortParams', () => {
        it("sortBy va sortOrder ixtiyoriy", () => {
            const params1: SortParams = {}
            const params2: SortParams = { sortBy: 'name' }
            const params3: SortParams = { sortBy: 'createdAt', sortOrder: 'desc' }

            expect(params1.sortBy).toBeUndefined()
            expect(params2.sortBy).toBe('name')
            expect(params3.sortOrder).toBe('desc')
        })
    })
})

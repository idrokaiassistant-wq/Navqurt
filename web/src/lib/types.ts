/**
 * API Response Types
 */

export interface ApiErrorResponse {
  error: string
  detail?: string
}

export interface ApiSuccess<T> {
  data?: T
  message?: string
}

export type ApiResponse<T> = ApiSuccess<T> | ApiErrorResponse

/**
 * Pagination Types (keyingi uchun)
 */
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/**
 * Cloudinary Response Types
 */
export interface CloudinaryUploadResponse {
  secure_url: string
  public_id: string
  format?: string
  width?: number
  height?: number
  bytes?: number
  resource_type?: string
}

export interface CloudinaryDeleteResponse {
  result: 'ok' | 'not found'
}

/**
 * Common API Request Types
 */
export interface PaginationParams {
  page?: number
  pageSize?: number
}

export interface SortParams {
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}


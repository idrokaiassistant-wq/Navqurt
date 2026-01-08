/**
 * Frontend API Client Utility
 * Type-safe API client with unified error handling
 */

interface ApiSuccessResponse<T> {
  data: T
  message?: string
}

interface ApiMessageResponse {
  message: string
}

interface ApiErrorResponse {
  error: string
  detail?: string
}

type ApiResponse<T> = ApiSuccessResponse<T> | ApiMessageResponse | ApiErrorResponse

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public detail?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Check if response is successful
 */
function isSuccessResponse<T>(
  response: ApiResponse<T>
): response is ApiSuccessResponse<T> | ApiMessageResponse {
  return 'data' in response || 'message' in response
}

/**
 * Parse API response
 */
async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type')
  
  if (!contentType?.includes('application/json')) {
    const text = await response.text()
    throw new ApiError(response.status, text || 'Server xatolik')
  }

  const data: ApiResponse<T> = await response.json()

  if (!response.ok) {
    const error = data as ApiErrorResponse
    throw new ApiError(
      response.status,
      error.error || 'Noma\'lum xatolik',
      error.detail
    )
  }

  if (!isSuccessResponse(data)) {
    throw new ApiError(response.status, 'Javob formati noto\'g\'ri')
  }

  // Handle data response format: { data: T }
  if ('data' in data) {
    return data.data
  }

  // Handle message-only response format: { message: string }
  // For DELETE endpoints that return { message: string }, return as T
  // This assumes T is compatible with { message: string } for DELETE calls
  return data as T
}

/**
 * Base API request function
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // Don't set Content-Type for FormData - browser will set it with boundary
  const isFormData = options.body instanceof FormData
  const defaultHeaders: HeadersInit = isFormData
    ? {}
    : {
        'Content-Type': 'application/json',
      }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: 'include', // Include cookies for NextAuth
  }

  try {
    const response = await fetch(endpoint, config)
    return await parseResponse<T>(response)
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(500, error instanceof Error ? error.message : 'Network xatolik')
  }
}

/**
 * GET request
 */
export async function apiGet<T>(endpoint: string): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'GET',
    cache: 'no-store',
  })
}

/**
 * POST request
 */
export async function apiPost<T>(
  endpoint: string,
  body?: unknown
): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  })
}

/**
 * PATCH request
 */
export async function apiPatch<T>(
  endpoint: string,
  body?: unknown
): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined,
  })
}

/**
 * DELETE request
 */
export async function apiDelete<T>(endpoint: string): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'DELETE',
  })
}

/**
 * POST FormData request (for file uploads)
 */
export async function apiPostFormData<T>(
  endpoint: string,
  formData: FormData
): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'POST',
    body: formData,
    headers: {}, // Let browser set Content-Type with boundary for FormData
  })
}

/**
 * Handle API errors in components
 */
export function handleApiError(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'Noma\'lum xatolik yuz berdi'
}

/**
 * Check if error is unauthorized (401)
 */
export function isUnauthorizedError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 401
}

export { ApiError }


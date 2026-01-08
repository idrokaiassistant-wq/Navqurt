import { NextResponse } from 'next/server'
import type { ApiErrorResponse as ApiErrorType } from './types'

/**
 * Unified Error Handling and Response Builder
 */

export class ApiErrorResponse extends Error {
  constructor(
    public status: number,
    public message: string,
    public detail?: string
  ) {
    super(message)
    this.name = 'ApiErrorResponse'
  }
}

/**
 * Handle API errors consistently
 */
export function handleApiError(error: unknown): NextResponse<ApiErrorType> {
  // Custom API error
  if (error instanceof ApiErrorResponse) {
    return NextResponse.json(
      { error: error.message, ...(error.detail && { detail: error.detail }) },
      { status: error.status }
    )
  }

  // Unauthorized error (from assertAdmin)
  if (error instanceof Error && error.message === 'Unauthorized') {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  // Prisma errors
  if (error instanceof Error && error.name === 'PrismaClientKnownRequestError') {
    // Check for Prisma error codes
    const prismaError = error as Error & { code?: string }
    
    // Unique constraint violation
    if (prismaError.code === 'P2002') {
      return NextResponse.json(
        { error: 'Bu ma\'lumot allaqachon mavjud' },
        { status: 409 }
      )
    }

    // Record not found
    if (prismaError.code === 'P2025') {
      return NextResponse.json(
        { error: 'Ma\'lumot topilmadi' },
        { status: 404 }
      )
    }
  }

  // Generic error
  const message = error instanceof Error ? error.message : 'Noma\'lum xatolik'
  
  // Don't expose internal errors in production
  const detail = process.env.NODE_ENV === 'development' && error instanceof Error 
    ? error.stack 
    : undefined

  return NextResponse.json(
    { error: message, ...(detail && { detail }) },
    { status: 500 }
  )
}

/**
 * Success response helpers
 */
export function successResponse<T>(data: T, status: number = 200): NextResponse<{ data: T }> {
  return NextResponse.json({ data }, { status })
}

export function createdResponse<T>(data: T): NextResponse<{ data: T }> {
  return NextResponse.json({ data }, { status: 201 })
}

export function messageResponse(message: string, status: number = 200): NextResponse<{ message: string }> {
  return NextResponse.json({ message }, { status })
}

/**
 * Error response helpers
 */
export function unauthorizedResponse(message: string = 'Unauthorized'): NextResponse<ApiErrorType> {
  return NextResponse.json({ error: message }, { status: 401 })
}

export function forbiddenResponse(message: string = 'Forbidden'): NextResponse<ApiErrorType> {
  return NextResponse.json({ error: message }, { status: 403 })
}

export function notFoundResponse(message: string = 'Ma\'lumot topilmadi'): NextResponse<ApiErrorType> {
  return NextResponse.json({ error: message }, { status: 404 })
}

export function badRequestResponse(message: string): NextResponse<ApiErrorType> {
  return NextResponse.json({ error: message }, { status: 400 })
}

export function conflictResponse(message: string): NextResponse<ApiErrorType> {
  return NextResponse.json({ error: message }, { status: 409 })
}

/**
 * API route wrapper for consistent error handling
 */
export async function withApiErrorHandler<T>(
  handler: () => Promise<NextResponse<T | ApiErrorType>>
): Promise<NextResponse<T | ApiErrorType>> {
  try {
    return await handler()
  } catch (error) {
    return handleApiError(error)
  }
}


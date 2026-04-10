import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export function apiResponse<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, data }, { status });
}

export function apiError(message: string, status = 400): NextResponse<ApiResponse> {
  return NextResponse.json({ success: false, error: message }, { status });
}

export function apiSuccess(message: string, data?: unknown): NextResponse<ApiResponse> {
  return NextResponse.json({ success: true, message, data }, { status: 200 });
}

export function handleZodError(error: ZodError): NextResponse<ApiResponse> {
  const messages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
  return apiError(messages, 400);
}

export function handleApiError(error: unknown): NextResponse<ApiResponse> {
  console.error('API Error:', error);
  if (error instanceof Error) {
    return apiError(error.message, 500);
  }
  return apiError('An unexpected error occurred', 500);
}

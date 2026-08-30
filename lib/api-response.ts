import { NextResponse } from 'next/server';

/** Shared, non-leaking API failure shape for route handlers. */
export function apiError(error: string, status = 500, details?: Record<string, unknown>) {
  return NextResponse.json({ success: false, error, ...(details ? { details } : {}) }, { status });
}

export function apiSuccess<T extends Record<string, unknown>>(data: T, status = 200) {
  return NextResponse.json({ success: true, ...data }, { status });
}

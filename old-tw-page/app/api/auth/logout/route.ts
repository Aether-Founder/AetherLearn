import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // In a real implementation, you might want to invalidate the refresh token
  // For now, we'll just return success
  return NextResponse.json({ success: true });
}

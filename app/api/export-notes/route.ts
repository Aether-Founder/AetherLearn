import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  return NextResponse.json({ 
    error: 'Export notes feature is currently unavailable. The workspace_items table does not exist in the database schema.' 
  }, { status: 503 });
}

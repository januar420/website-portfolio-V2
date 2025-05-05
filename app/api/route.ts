import { NextResponse } from 'next/server';

// File: app/api/route.ts
// Fallback untuk static export

export const dynamic = 'force-static';

export async function GET() {
  // Redirect ke homepage dengan status 307 (temporary redirect)
  return NextResponse.redirect('/', { status: 307 });
}

// Handle preflight requests untuk CORS
export async function OPTIONS() {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
  
  return new NextResponse(null, { status: 204, headers });
} 
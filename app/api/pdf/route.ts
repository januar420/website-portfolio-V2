import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Penting: Di Netlify dan hosting lainnya, akses file harus melalui /public
// File tidak dapat disajikan dari folder selain /public di production

// Jadikan handler ini statis untuk performa
export const dynamic = "force-static";

// Mapping file PDF yang tersedia
const pdfFiles = {
  "Certified Network Security Practitioner (CNSP).pdf": "/pdfs/certificates/cnsp.pdf",
  "Januar Galuh Certified Network Security Practitioner (CNSP).pdf": "/pdfs/certificates/cnsp.pdf",
  "CC Certified in Cybersecurity (CC).pdf": "/pdfs/certificates/cc.pdf",
  "CC Course Conclusion & Final Assessment.pdf": "/pdfs/certificates/cc-conclusion.pdf",
  "CC Domain 5 Security Operations.pdf": "/pdfs/certificates/cc-domain5.pdf",
  "CC  Domain 4 Network Security.pdf": "/pdfs/certificates/cc-domain4.pdf",
  "CC Domain 4 Network Security.pdf": "/pdfs/certificates/cc-domain4.pdf",
  "CC Domain 3 Access Control Concepts.pdf": "/pdfs/certificates/cc-domain3.pdf",
  "CC Domain 2 Incident Response, Business Continuity And Disaster Recovery Concepts.pdf": "/pdfs/certificates/cc-domain2.pdf",
  "CC Domain 1 Security Principles.pdf": "/pdfs/certificates/cc-domain1.pdf",
};

export async function GET(request: NextRequest) {
  try {
    // Dapatkan parameter file dari URL
    const fileParam = request.nextUrl.searchParams.get('file');
    
    if (!fileParam) {
      return NextResponse.json(
        { error: 'File parameter is required' },
        { status: 400 }
      );
    }

    // Verifikasi file parameter untuk mencegah path traversal
    if (fileParam.includes('..') || fileParam.startsWith('/') || fileParam.startsWith('\\')) {
      return NextResponse.json(
        { error: 'Invalid file parameter' },
        { status: 400 }
      );
    }

    // Dapatkan path file dari mapping
    const publicPath = pdfFiles[fileParam];
    
    if (!publicPath) {
      console.error(`File mapping not found for: ${fileParam}`);
      
      // Redirect ke file contoh jika file tidak ditemukan dalam mapping
      return NextResponse.redirect(new URL('/pdfs/certificates/sample.pdf', request.url));
    }
    
    // Redirect ke URL publik
    const redirectUrl = new URL(publicPath, request.url);
    console.log(`Redirecting to: ${redirectUrl}`);
    
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Error serving PDF:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle preflight requests untuk CORS
export async function OPTIONS() {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
  
  return new NextResponse(null, { status: 204, headers });
} 
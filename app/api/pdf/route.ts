import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    // Mendapatkan parameter filename dari query string
    const url = new URL(request.url);
    const filename = url.searchParams.get('file');

    if (!filename) {
      return new NextResponse('Filename parameter is missing', { status: 400 });
    }

    // Memastikan path aman dan tidak ada traversal direktori
    const sanitizedFilename = path.basename(filename);
    
    // Path ke direktori sertifikasi
    const certDir = path.join(process.cwd(), 'CERTIFICATION CYBER SECURITY');
    const filePath = path.join(certDir, sanitizedFilename);

    // Memeriksa apakah file ada
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      return new NextResponse('File not found', { status: 404 });
    }

    // Membaca file
    const fileBuffer = fs.readFileSync(filePath);
    
    // Mengembalikan file sebagai stream
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${sanitizedFilename}"`,
      },
    });
  } catch (error) {
    console.error('Error serving PDF:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 
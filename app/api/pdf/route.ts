import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

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
    if (fileParam.includes('..') || fileParam.includes('/') || fileParam.includes('\\')) {
      return NextResponse.json(
        { error: 'Invalid file parameter' },
        { status: 400 }
      );
    }

    // Path ke direktori sertifikasi
    const certDir = path.join(process.cwd(), 'CERTIFICATION CYBER SECURITY');
    const filePath = path.join(certDir, fileParam);

    // Cek apakah file ada
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Baca file
    const fileBuffer = fs.readFileSync(filePath);
    
    // Buat response dengan header yang tepat
    const response = new NextResponse(fileBuffer);
    
    // Set header yang sesuai
    response.headers.set('Content-Type', 'application/pdf');
    response.headers.set('Content-Disposition', `inline; filename="${fileParam}"`);
    
    return response;
  } catch (error) {
    console.error('Error serving PDF:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
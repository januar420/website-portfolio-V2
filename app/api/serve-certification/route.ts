import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { stat } from 'fs/promises';

export const dynamic = "force-static";

export async function GET(request: NextRequest) {
  try {
    // Dapatkan parameter path dari URL
    const pathParam = request.nextUrl.searchParams.get('path');
    
    if (!pathParam) {
      return NextResponse.json(
        { error: 'Path parameter is required' },
        { status: 400 }
      );
    }

    // Validasi path parameter untuk keamanan
    const normalizedPath = pathParam
      .split('/')
      .filter(part => part !== '..' && part !== '.' && part !== '')
      .join('/');

    // Path ke direktori sertifikasi
    const certDir = path.join(process.cwd(), 'CERTIFICATION CYBER SECURITY');
    const filePath = path.join(certDir, normalizedPath);

    // Cek apakah file ada
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Dapatkan informasi file
    const stats = await stat(filePath);
    
    if (stats.isDirectory()) {
      // Jika direktori, kirim listing direktori
      const files = fs.readdirSync(filePath).map(file => {
        const fullPath = path.join(filePath, file);
        const isDir = fs.statSync(fullPath).isDirectory();
        return {
          name: file,
          isDirectory: isDir,
          path: path.join(normalizedPath, file),
        };
      });
      
      return NextResponse.json({ files });
    } else {
      // Jika file, kirim konten file
      const fileBuffer = fs.readFileSync(filePath);
      
      // Tentukan Content-Type berdasarkan ekstensi file
      const ext = path.extname(filePath).toLowerCase();
      let contentType = 'application/octet-stream';
      
      if (ext === '.pdf') contentType = 'application/pdf';
      else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
      else if (ext === '.png') contentType = 'image/png';
      else if (ext === '.gif') contentType = 'image/gif';
      else if (ext === '.txt') contentType = 'text/plain';
      
      // Buat response dengan header yang tepat
      const response = new NextResponse(fileBuffer);
      
      // Set header yang sesuai
      response.headers.set('Content-Type', contentType);
      response.headers.set('Content-Disposition', `inline; filename="${path.basename(filePath)}"`);
      
      return response;
    }
  } catch (error) {
    console.error('Error serving certification file:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
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
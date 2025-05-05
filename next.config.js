/** @type {import('next').NextConfig} */
const nextConfig = {
  // Mode output statis untuk Netlify
  output: 'export',
  
  // Mengabaikan error tipe
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Mengabaikan error lint
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Konfigurasi image untuk static export
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  
  // Konfigurasi webpack untuk PDF.js
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Pastikan worker file tersedia
      config.resolve.alias['pdfjs-dist/build/pdf.worker'] = 'pdfjs-dist/build/pdf.worker.min.js';
      
      // Tangani impor PDF.js worker
      config.module.rules.push({
        test: /pdf\.worker\.(min\.)?js/,
        type: 'asset/resource',
        generator: {
          filename: 'static/chunks/[name][ext]',
        },
      });
    }
    
    return config;
  },
  
  // Mode development
  reactStrictMode: true,
  
  // Tidak menggunakan fitur trailing slash
  trailingSlash: false,
};

// Deteksi jika berjalan di lingkungan Netlify
if (process.env.NETLIFY === 'true') {
  console.log('🚀 Optimizing build for Netlify...');
}

module.exports = nextConfig; 
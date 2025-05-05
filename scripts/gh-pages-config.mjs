// Konfigurasi khusus untuk deployment GitHub Pages
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const packageJson = require('../package.json');

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  output: 'export',
  // Atur base path sesuai dengan nama repositori
  // Format: /{nama-repo}
  basePath: '/website-portfolio-v2',
  
  // Nonaktifkan penggunaan gambar Next.js yang dinamis 
  // karena GitHub Pages adalah host statis
  images: {
    unoptimized: true,
  },
  
  // Sesuaikan bagian ini dengan domain yang diizinkan untuk CORS
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET',
          },
        ],
      },
    ];
  },
  
  // Setting untuk GitHub Pages
  env: {
    NEXT_PUBLIC_BASE_PATH: '/website-portfolio-v2',
  },
};

export default nextConfig; 
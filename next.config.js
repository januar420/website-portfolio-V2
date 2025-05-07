/** @type {import('next').NextConfig} */
const path = require('path');
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
  
  // Konfigurasi webpack yang lebih sederhana
  webpack: (config, { isServer }) => {
    // Penanganan file statis
    config.module.rules.push({
      test: /\.(pdf|jpg|jpeg|png|gif|svg|ico|woff|woff2)$/,
      type: 'asset/resource',
    });
    
    // Fallback untuk mode browser
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }
    
    return config;
  },
  
  // Mode development
  reactStrictMode: true,
  
  // Tidak menggunakan fitur trailing slash
  trailingSlash: false,
  
  // Definisikan assetPrefix berdasarkan deployment target
  assetPrefix: process.env.DEPLOY_TARGET === 'gh-pages' 
    ? '/website-portfolio-V2' 
    : process.env.DEPLOY_TARGET === 'netlify'
      ? ''
      : '',
  
  // Transpile paket yang memerlukan transpilasi
  transpilePackages: [
    'three', 
    '@react-three/fiber', 
    '@react-three/drei',
    'react-pdf',
    'pdfjs-dist'
  ],
  
  experimental: {
    optimizeCss: true, // Optimasi CSS
    optimizePackageImports: ['framer-motion', '@radix-ui'],
  },
  
  // Variabel lingkungan tambahan
  env: {
    NEXT_PUBLIC_BASE_PATH: process.env.DEPLOY_TARGET === 'gh-pages' ? '/website-portfolio-V2' : '',
  },
  
  // Pengaturan penting untuk build di Netlify dengan App Router
  swcMinify: false,
  productionBrowserSourceMaps: true,
  poweredByHeader: false,
};

// Tambahkan Promise.withResolvers polyfill global
try {
  if (typeof Promise.withResolvers !== 'function') {
    console.log('🔧 Menambahkan Promise.withResolvers polyfill di next.config.js');
    Promise.withResolvers = function() {
      let resolve, reject;
      const promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
      });
      return { promise, resolve, reject };
    };
  }
} catch (e) {
  console.warn('⚠️ Gagal menambahkan Promise.withResolvers polyfill:', e.message);
}

// Deteksi jika berjalan di lingkungan Netlify
if (process.env.NETLIFY === 'true') {
  console.log('🚀 Optimizing build for Netlify...');
  // Pastikan tidak menggunakan trailingSlash untuk Netlify
  nextConfig.trailingSlash = false;
  
  // Hapus i18n jika berjalan di App Router dengan Netlify
  if (process.env.NEXT_PUBLIC_DISABLE_I18N === 'true') {
    console.log('🌐 Disabling i18n for compatibility with App Router on Netlify');
    if (nextConfig.i18n) {
      delete nextConfig.i18n;
    }
  }
  
  // Memastikan Next.js berjalan di mode yang benar untuk Netlify
  nextConfig.distDir = '.next';
}

// Deteksi jika berjalan di lingkungan GitHub Pages
if (process.env.DEPLOY_TARGET === 'gh-pages') {
  console.log('📦 Optimizing build for GitHub Pages deployment...');
  nextConfig.basePath = '/website-portfolio-V2';
}

module.exports = nextConfig; 
/**
 * Next.js Configuration for Windows Compatibility
 * ===================================================
 * Konfigurasi sederhana untuk portfolio website
 * Januar Galuh Prabakti
 */

// Mengambil daftar route yang diabaikan dari file konfigurasi
// Route yang diabaikan hanya berlaku saat menggunakan output: 'export'
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Mendapatkan __dirname dalam ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cek deployment target
const isGitHubPages = process.env.GITHUB_PAGES === 'true' || process.env.DEPLOY_TARGET === 'gh-pages';
const isNetlify = process.env.NETLIFY === 'true' || process.env.DEPLOY_TARGET === 'netlify';

// Repository name untuk GitHub Pages
const REPO_NAME = 'website-portfolio-v2';

// Cek apakah file rsc-ignored.js ada
let ignoredRoutes = [];
try {
  const rscIgnoredPath = path.join(__dirname, 'scripts', 'rsc-ignored.js');
  if (fs.existsSync(rscIgnoredPath)) {
    const { ignoredRoutes: ignored } = await import('./scripts/rsc-ignored.js');
    ignoredRoutes = ignored || [];
    console.log('✅ Using ignored routes configuration:', ignoredRoutes);
  }
} catch (e) {
  console.warn('⚠️ Failed to load rsc-ignored.js:', e.message);
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true, // Set ke true untuk static export
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
      },
      {
        protocol: 'https',
        hostname: 'imgur.com',
      },
      {
        protocol: 'https',
        hostname: 'github.com',
      },
      {
        protocol: 'https',
        hostname: 'githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'google.com',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Konfigurasi untuk development behavior
  reactStrictMode: false,
  
  // Transpile Three.js dan related packages
  transpilePackages: ['@react-three/fiber', '@react-three/drei', 'react-pdf', 'pdfjs-dist'],
  
  // Server external packages - memindahkan three ke sini dari serverComponentsExternalPackages
  serverExternalPackages: ['three', 'pdf-lib'],
  
  // Output mode - selalu export untuk static deployment
  output: 'export',
  
  // Konfigurasi khusus untuk GitHub Pages
  basePath: isGitHubPages ? `/${REPO_NAME}` : '',
  assetPrefix: isGitHubPages ? `/${REPO_NAME}/` : '',
  
  // Pindahkan outputFileTracing ke root config
  outputFileTracingRoot: path.join(__dirname, '../'),
  outputFileTracingExcludes: {
    '*': [
      'node_modules/@swc/core-win32-x64-msvc',
      'node_modules/next/dist/compiled/@napi-rs',
      'node_modules/.pnpm',
    ],
  },
  
  // Tambahkan route yang ingin diabaikan dari export statis
  // Ini diperlukan karena API route seperti /api/pdf tidak bisa di-prerender saat mode export
  distDir: '.next',
  skipTrailingSlashRedirect: true,
  trailingSlash: isGitHubPages, // Gunakan trailing slash hanya untuk GitHub Pages
  
  // Gunakan excludeDefaultMomentLocales untuk memperkecil ukuran bundle
  excludeDefaultMomentLocales: true,
  
  // Membuat ID build yang stabil
  generateBuildId: async () => {
    if (isNetlify) {
      return `netlify-build-${Date.now()}`;
    }
    return 'january-portfolio-static-build';
  },
  
  // Konfigurasi Page Options
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  
  // Konfigurasi experimental yang didukung
  experimental: {
    // Umum untuk semua mode
    optimizePackageImports: ['@react-three/fiber', '@react-three/drei'],
  },
  
  // Konfigurasi webpack tambahan untuk three.js
  webpack: (config, { isServer }) => {
    // Handling untuk model 3D dan file lainnya
    config.module.rules.push({
      test: /\.(glb|gltf|fbx|obj|mtl|usdc)$/,
      use: {
        loader: 'file-loader',
        options: {
          publicPath: '/_next/static/files',
          outputPath: 'static/files',
          name: '[name].[hash].[ext]',
        },
      },
    });

    // Pastikan three.js shader dan file terkait di-handle dengan benar
    config.module.rules.push({
      test: /\.(glsl|vs|fs)$/,
      type: 'asset/source',
    });
    
    // Tambahkan dukungan untuk font files
    config.module.rules.push({
      test: /\.(woff|woff2|eot|ttf|otf)$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/fonts/[name].[hash][ext]',
      },
    });
    
    // Tambahkan dukungan untuk file PDF
    config.module.rules.push({
      test: /\.pdf$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/pdfs/[name].[hash][ext]',
      },
    });
    
    // Konfigurasi PDF.js worker khusus untuk Netlify
    if (!isServer && isNetlify) {
      // Pastikan worker PDF.js tersedia
      config.resolve.alias = {
        ...config.resolve.alias,
        'pdfjs-dist/build/pdf.worker': 'pdfjs-dist/build/pdf.worker.min.js',
      };
      
      // Tangani impor PDF.js worker
      config.module.rules.push({
        test: /pdf\.worker\.(min\.)?js/,
        type: 'asset/resource',
        generator: {
          filename: 'pdf.worker.min.js',
        },
      });
    }
    
    // Konfigurasi untuk menghindari masalah symlink pada Windows
    config.resolve = {
      ...config.resolve,
      symlinks: false
    };
    
    // Meningkatkan timeout untuk webpack
    config.watchOptions = {
      ...config.watchOptions,
      aggregateTimeout: 600,
      poll: 1000,
    };

    // Mematikan symlink di file cache webpack untuk Windows
    if (process.platform === 'win32') {
      config.resolve.symlinks = false;
      config.watchOptions.followSymlinks = false;
      config.node = {
        ...config.node,
        __filename: true,
        __dirname: true,
      };
    }

    return config;
  },
}

// Log khusus untuk deployment
if (isNetlify) {
  console.log('🚀 Optimizing build for Netlify deployment...');
} else if (isGitHubPages) {
  console.log('🚀 Optimizing build for GitHub Pages deployment...');
} else {
  console.log('🚀 Building for standard static output...');
}

// Ekspor konfigurasi final untuk portfolio Januar Galuh Prabakti
export default nextConfig;

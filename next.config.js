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
  
  // Konfigurasi webpack untuk PDF.js dan polyfill
  webpack: (config, { isServer }) => {
    // Penanganan khusus untuk pdfjs-dist dan file PDF
    config.resolve.alias['pdfjs-dist'] = require.resolve('pdfjs-dist');
    
    // Penanganan untuk file-file statis
    config.module.rules.push({
      test: /\.(pdf|jpg|jpeg|png|gif|svg|ico|woff|woff2)$/,
      use: [
        {
          loader: 'file-loader',
          options: {
            publicPath: '/_next/static/media',
            outputPath: 'static/media',
            name: '[name].[hash].[ext]',
          },
        },
      ],
    });
    
    // Pastikan Promise.withResolvers dan DOMMatrix tersedia di bundling
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
      
      // Tambahkan PromisePolyfill sebagai entry point tambahan
      const originalEntry = config.entry;
      config.entry = async () => {
        const entries = await originalEntry();
        
        // Jika Promise.withResolvers tidak ada, tambahkan polyfill
        if (typeof Promise.withResolvers !== 'function') {
          // Tambahkan polyfill ke setiap entrypoint
          Object.keys(entries).forEach((entry) => {
            if (entry !== 'polyfills') {
              entries[entry].import.unshift(require.resolve('../scripts/fix-promise-polyfill.js'));
            }
          });
        }
        
        return entries;
      };
    } else {
      // Polyfill untuk DOMMatrix di server-side rendering
      config.externals.push({
        canvas: 'commonjs canvas',
      });
      
      // Server side polyfill untuk Promise.withResolvers
      try {
        require('../scripts/fix-promise-polyfill.js');
      } catch (e) {
        console.warn('Warning: Promise.withResolvers polyfill gagal dimuat di server:', e.message);
      }
    }
    
    // Inject DOMMatrix polyfill
    const definePlugin = config.plugins.find(
      (plugin) => plugin.constructor.name === 'DefinePlugin'
    );
    
    if (definePlugin) {
      definePlugin.definitions = {
        ...definePlugin.definitions,
        'globalThis.DOMMatrix': isServer 
          ? 'function() { return {}; }'
          : 'window.DOMMatrix',
        
        // Add Promise.withResolvers polyfill check
        'Promise.withResolvers': 
          `typeof Promise.withResolvers === 'function' 
          ? Promise.withResolvers 
          : function() { 
              let resolve, reject; 
              const promise = new Promise((res, rej) => { 
                resolve = res; 
                reject = rej; 
              }); 
              return { promise, resolve, reject }; 
            }`
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
  swcMinify: true,
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
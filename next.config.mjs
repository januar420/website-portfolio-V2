/**
 * Next.js Configuration for Windows Compatibility
 * ===================================================
 * Konfigurasi sederhana untuk portfolio website
 * Januar Galuh Prabakti
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Konfigurasi untuk development behavior
  reactStrictMode: false,
  
  // Transpile Three.js dan related packages
  transpilePackages: ['@react-three/fiber', '@react-three/drei'],
  
  // Server external packages - memindahkan three ke sini dari serverComponentsExternalPackages
  serverExternalPackages: ['three'],
  
  // Mengatasi masalah symlink pada Windows
  output: 'standalone',
  
  // Membuat ID build yang stabil
  generateBuildId: async () => {
    return 'january-portfolio-static-build';
  },
  
  // Konfigurasi Page Options
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  
  // Konfigurasi experimental yang didukung
  experimental: {
    // Fitur performance yang didukung
    serverActions: {
      bodySizeLimit: '4mb', // Meningkatkan batas ukuran untuk server actions
    },
    // WebGL dan 3D optimizations
    optimizePackageImports: ['@react-three/fiber', '@react-three/drei'],
  },
  
  // Konfigurasi webpack tambahan untuk three.js
  webpack: (config) => {
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

    return config;
  },
  
  // Konfigurasi untuk asset files
  async rewrites() {
    return [
      {
        source: '/CERTIFICATION CYBER SECURITY/:path*',
        destination: '/api/serve-certification?path=:path*',
      },
    ];
  },
}

// Ekspor konfigurasi final untuk portfolio Januar Galuh Prabakti
export default nextConfig;

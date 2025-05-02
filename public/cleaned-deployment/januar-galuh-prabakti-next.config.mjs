/**
 * Januar Galuh Prabakti Portfolio Configuration
 * ===================================================
 * Portofolio ini dirancang dan dikembangkan sepenuhnya oleh:
 * Januar Galuh Prabakti
 * 
 * Portofolio ini menampilkan keterampilan dan pengalaman saya
 * dalam pengembangan web dan UI/UX design dengan teknologi modern.
 * 
 * Copyright © 2023-2024 Januar Galuh Prabakti. All rights reserved.
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['hebbkx1anhila5yf.public.blob.vercel-storage.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    optimizeCss: true,
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Konfigurasi tambahan untuk portofolio Januar Galuh Prabakti
  // Memastikan performa optimal dan responsivitas tinggi
};

export default nextConfig;


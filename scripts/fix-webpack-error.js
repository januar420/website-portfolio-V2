/**
 * Script untuk memperbaiki masalah webpack error pada Next.js
 * Jalankan: node scripts/fix-webpack-error.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Memperbaiki masalah webpack error pada Next.js...');

// Lokasi file yang perlu diperbaiki
const nextConfigPath = path.join(__dirname, '..', 'next.config.js');

if (!fs.existsSync(nextConfigPath)) {
  console.error('❌ File next.config.js tidak ditemukan!');
  process.exit(1);
}

// Baca isi file next.config.js
let configContent = fs.readFileSync(nextConfigPath, 'utf8');

// Penyederhanaan webpack config untuk menghindari konflik
const simplifiedWebpackConfig = `
  // Konfigurasi webpack yang lebih sederhana
  webpack: (config, { isServer }) => {
    // Penanganan file statis
    config.module.rules.push({
      test: /\\.(pdf|jpg|jpeg|png|gif|svg|ico|woff|woff2)$/,
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
`;

// Cari dan ganti bagian webpack config
const webpackConfigRegex = /webpack:\s*\(\s*config,\s*\{\s*isServer\s*\}\s*\)\s*=>\s*\{[\s\S]*?\},/;
if (webpackConfigRegex.test(configContent)) {
  configContent = configContent.replace(webpackConfigRegex, simplifiedWebpackConfig);
  console.log('✅ Konfigurasi webpack berhasil disederhanakan');
} else {
  console.log('⚠️ Tidak dapat menemukan konfigurasi webpack yang tepat untuk diganti');
}

// Tambahkan flag swcMinify: false untuk menghindari error
if (configContent.includes('swcMinify: true')) {
  configContent = configContent.replace('swcMinify: true', 'swcMinify: false');
  console.log('✅ Menonaktifkan swcMinify untuk menghindari error minifikasi');
} else if (!configContent.includes('swcMinify: false')) {
  // Tambahkan jika belum ada
  configContent = configContent.replace(
    /const nextConfig = \{/,
    'const nextConfig = {\n  swcMinify: false,'
  );
  console.log('✅ Menambahkan swcMinify: false ke konfigurasi');
}

// Tulis kembali file konfigurasi
fs.writeFileSync(nextConfigPath, configContent);
console.log('✅ File next.config.js berhasil diperbarui');

// Sarankan untuk membersihkan cache dan reinstall dependencies
console.log('\n🧹 Jalankan perintah berikut untuk membersihkan cache build:');
console.log('npm run clean:full');
console.log('npm install --force');
console.log('npm run build');

console.log('\n🎉 Selesai! Coba build project lagi setelah membersihkan cache dan dependencies.') 
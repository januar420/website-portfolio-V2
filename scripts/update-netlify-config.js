/**
 * Script untuk memperbarui konfigurasi Netlify
 * Jalankan: node scripts/update-netlify-config.js
 */

const fs = require('fs');
const path = require('path');

// Token Netlify yang sudah diberikan
const NETLIFY_AUTH_TOKEN = 'nfp_MtmuQHpogJ98Znrmqj8koXVA4Bko9MCgaaf4';

console.log('🔧 Memperbarui konfigurasi Netlify...');

// Lokasi file netlify.toml
const netlifyConfigPath = path.join(__dirname, '..', 'netlify.toml');

// Periksa apakah file netlify.toml ada
let configExists = fs.existsSync(netlifyConfigPath);
let configContent = configExists 
  ? fs.readFileSync(netlifyConfigPath, 'utf8')
  : '';

// Jika tidak ada file netlify.toml, buat file baru
if (!configExists) {
  console.log('⚠️ File netlify.toml tidak ditemukan, membuat file baru...');
  configContent = `
[build]
  publish = "out"
  command = "npm run build:netlify"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
`;
}

// Tulis file netlify.toml
fs.writeFileSync(netlifyConfigPath, configContent);
console.log('✅ File netlify.toml telah diperbarui');

// Update .netlify/state.json jika ada
const netlifyStatePath = path.join(__dirname, '..', '.netlify', 'state.json');
const netlifyStateDir = path.join(__dirname, '..', '.netlify');

// Buat direktori .netlify jika belum ada
if (!fs.existsSync(netlifyStateDir)) {
  fs.mkdirSync(netlifyStateDir, { recursive: true });
}

// Periksa apakah ada file state.json
let stateExists = fs.existsSync(netlifyStatePath);

console.log('Mengatur token di file konfigurasi Netlify lokal...');

// Simpan token di file .netlify/auth-token untuk penggunaan lokal
fs.writeFileSync(
  path.join(netlifyStateDir, 'auth-token'),
  NETLIFY_AUTH_TOKEN
);

console.log('✅ Token Netlify berhasil disimpan untuk penggunaan lokal');
console.log('\n🎉 Konfigurasi Netlify berhasil diperbarui!');
console.log('Sekarang Anda dapat menjalankan perintah deployment:');
console.log('npm run deploy:netlify');
console.log('\nUntuk mengatur NETLIFY_SITE_ID, jalankan:');
console.log('node scripts/setup-netlify-token.js'); 
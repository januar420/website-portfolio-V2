/**
 * Script untuk mengatur token Netlify secara lokal
 * Jalankan: node scripts/setup-netlify-token.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Token yang diberikan
const NETLIFY_AUTH_TOKEN = 'nfp_MtmuQHpogJ98Znrmqj8koXVA4Bko9MCgaaf4';

console.log('🔑 Mengatur NETLIFY_AUTH_TOKEN untuk penggunaan lokal...');

// Cek apakah Netlify CLI sudah terinstall
try {
  console.log('Memeriksa instalasi Netlify CLI...');
  execSync('netlify --version', { stdio: 'pipe' });
  console.log('✅ Netlify CLI terinstall');
} catch (error) {
  console.log('⚠️ Netlify CLI belum terinstall. Menginstall...');
  try {
    execSync('npm install -g netlify-cli', { stdio: 'inherit' });
    console.log('✅ Netlify CLI berhasil diinstall');
  } catch (installError) {
    console.error('❌ Gagal menginstall Netlify CLI:', installError.message);
    process.exit(1);
  }
}

// Mengatur token Netlify secara lokal
try {
  console.log('Mengatur Netlify auth token...');
  execSync(`netlify auth:set ${NETLIFY_AUTH_TOKEN}`, { stdio: 'pipe' });
  console.log('✅ Token Netlify berhasil dikonfigurasi');
  
  // Mencoba mendapatkan info akun untuk verifikasi
  console.log('Memverifikasi token...');
  const accountInfo = execSync('netlify api getUser', { encoding: 'utf8' });
  console.log('✅ Token valid! Login berhasil.');
  
  const accountData = JSON.parse(accountInfo);
  console.log(`🔵 Login sebagai: ${accountData.full_name || accountData.email}`);
  
  // Mendapatkan dan menampilkan daftar situs
  console.log('\n📋 Daftar situs Netlify tersedia:');
  const sites = JSON.parse(execSync('netlify api listSites', { encoding: 'utf8' }));
  
  if (sites && sites.length > 0) {
    sites.forEach((site, index) => {
      console.log(`${index + 1}. ${site.name} (${site.url})`);
      console.log(`   ID: ${site.id}`);
      console.log(`   Tambahkan ID ini ke NETLIFY_SITE_ID di GitHub secrets\n`);
    });
  } else {
    console.log('Tidak ada situs yang ditemukan di akun Anda.');
  }
  
  console.log('\n✅ Setup selesai. Anda sekarang dapat menjalankan:');
  console.log('   npm run deploy:netlify');
  
} catch (error) {
  console.error('❌ Gagal mengatur token Netlify:', error.message);
  process.exit(1);
} 
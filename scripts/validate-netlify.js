/**
 * Script untuk memvalidasi output Next.js untuk deployment ke Netlify
 * Ini memeriksa file-file yang diperlukan dan konfigurasi yang benar
 */

const fs = require('fs');
const path = require('path');

// Fungsi untuk log dengan warna berbeda
function log(message, type = 'info') {
  const colors = {
    info: '\x1b[34m', // biru
    success: '\x1b[32m', // hijau
    warning: '\x1b[33m', // kuning
    error: '\x1b[31m', // merah
    reset: '\x1b[0m'
  };
  
  const prefix = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌'
  };
  
  console.log(`${colors[type]}${prefix[type]} ${message}${colors.reset}`);
}

// Direktori output
const outputDir = path.join(__dirname, '..', 'out');

log('Memulai validasi output Next.js untuk deployment Netlify...', 'info');

// 1. Periksa apakah direktori output ada
if (!fs.existsSync(outputDir)) {
  log('Direktori output tidak ditemukan!', 'error');
  log('Jalankan `next build` terlebih dahulu', 'info');
  process.exit(1);
}

// 2. Periksa file-file penting
const requiredFiles = [
  'index.html',
  '_redirects',
  '_headers',
  'promise-polyfill.js'
];

const missingFiles = [];

for (const file of requiredFiles) {
  const filePath = path.join(outputDir, file);
  if (!fs.existsSync(filePath)) {
    missingFiles.push(file);
    log(`File ${file} tidak ditemukan di direktori output`, 'error');
  } else {
    log(`File ${file} ditemukan`, 'success');
  }
}

if (missingFiles.length > 0) {
  log('Ada file penting yang hilang! Jalankan `npm run prepare-netlify` untuk memperbaiki', 'warning');
} else {
  log('Semua file penting ditemukan', 'success');
}

// 3. Periksa isi file _redirects
const redirectsPath = path.join(outputDir, '_redirects');
if (fs.existsSync(redirectsPath)) {
  const redirectsContent = fs.readFileSync(redirectsPath, 'utf8');
  
  // Periksa apakah ada rute SPA fallback
  if (!redirectsContent.includes('/* /index.html') && !redirectsContent.includes('/*  /index.html')) {
    log('File _redirects tidak memiliki rute SPA fallback (/* /index.html)', 'warning');
    log('Ini diperlukan untuk routing klien di Netlify', 'info');
  } else {
    log('File _redirects memiliki rute SPA fallback yang benar', 'success');
  }
  
  // Periksa apakah ada rute untuk asset statis
  if (!redirectsContent.includes('/_next/static/')) {
    log('File _redirects tidak memiliki rute untuk asset statis (/_next/static/)', 'warning');
    log('Ini diperlukan untuk loading asset statis dengan benar', 'info');
  } else {
    log('File _redirects memiliki rute untuk asset statis', 'success');
  }
} else {
  log('File _redirects tidak ada, tidak dapat memeriksa rute', 'warning');
}

// 4. Periksa isi file index.html untuk polyfill Promise.withResolvers
const indexPath = path.join(outputDir, 'index.html');
if (fs.existsSync(indexPath)) {
  const indexContent = fs.readFileSync(indexPath, 'utf8');
  
  if (!indexContent.includes('promise-polyfill.js')) {
    log('File index.html tidak memiliki referensi ke promise-polyfill.js', 'warning');
    log('Ini diperlukan untuk kompatibilitas Promise.withResolvers', 'info');
  } else {
    log('File index.html memiliki referensi ke promise-polyfill.js', 'success');
  }
  
  // Periksa apakah ada Next.js Data Scripts
  if (!indexContent.includes('__NEXT_DATA__')) {
    log('File index.html tidak memiliki __NEXT_DATA__', 'warning');
    log('Ini mungkin berarti Next.js tidak dikonfigurasi dengan benar untuk export statis', 'info');
  } else {
    log('File index.html memiliki __NEXT_DATA__ yang benar', 'success');
  }
} else {
  log('File index.html tidak ada, tidak dapat memeriksa isi', 'warning');
}

// 5. Periksa file netlify.toml
const netlifyTomlPath = path.join(__dirname, '..', 'netlify.toml');
if (fs.existsSync(netlifyTomlPath)) {
  const netlifyTomlContent = fs.readFileSync(netlifyTomlPath, 'utf8');
  
  // Periksa publish directory
  if (!netlifyTomlContent.includes('publish = "out"')) {
    log('netlify.toml tidak memiliki pengaturan publish = "out"', 'warning');
    log('Ini diperlukan untuk menentukan direktori yang akan di-deploy', 'info');
  } else {
    log('netlify.toml memiliki pengaturan publish directory yang benar', 'success');
  }
  
  // Periksa build command
  if (!netlifyTomlContent.includes('command = "npm run')) {
    log('netlify.toml tidak memiliki perintah build yang benar', 'warning');
    log('Ini diperlukan untuk menentukan cara membangun proyek', 'info');
  } else {
    log('netlify.toml memiliki build command yang benar', 'success');
  }
  
  // Periksa header settings
  if (!netlifyTomlContent.includes('[[headers]]')) {
    log('netlify.toml tidak memiliki konfigurasi headers', 'warning');
    log('Ini diperlukan untuk mengoptimalkan caching dan keamanan', 'info');
  } else {
    log('netlify.toml memiliki konfigurasi headers', 'success');
  }
} else {
  log('File netlify.toml tidak ditemukan!', 'error');
  log('Ini diperlukan untuk konfigurasi deployment Netlify', 'info');
}

// 6. Ringkasan hasil
console.log('\n----- RINGKASAN VALIDASI -----');

if (missingFiles.length === 0) {
  log('✓ Semua file penting ada', 'success');
} else {
  log(`✗ Ada ${missingFiles.length} file penting yang hilang`, 'error');
}

if (missingFiles.length > 0) {
  log('\nUntuk memperbaiki masalah ini, jalankan:', 'info');
  log('npm run prepare-netlify', 'info');
  
  process.exit(1);
} else {
  log('\nProyek siap untuk di-deploy ke Netlify!', 'success');
  log('Untuk men-deploy, jalankan:', 'info');
  log('npm run deploy:netlify', 'info');
} 
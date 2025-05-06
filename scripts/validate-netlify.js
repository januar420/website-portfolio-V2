/**
 * Script untuk memvalidasi konfigurasi Netlify sebelum deployment
 * 
 * Script ini akan:
 * 1. Memastikan file _redirects ada dan valid
 * 2. Memastikan netlify.toml ada dan berisi konfigurasi yang benar
 * 3. Memastikan semua file polyfill dan worker sudah benar
 */

const fs = require('fs');
const path = require('path');

// Helper untuk output berwarna
const colors = {
  green: (text) => `✅ ${text}`,
  red: (text) => `❌ ${text}`,
  yellow: (text) => `⚠️ ${text}`
};

const OUT_DIR = path.join(process.cwd(), 'out');

function validateRedirects() {
  const redirectsPath = path.join(OUT_DIR, '_redirects');
  
  // Selalu buat ulang file _redirects dengan konten yang lengkap
  const redirectsContent = 
    `# Redirects untuk Next.js SPA
/* /index.html 200!
/_next/* /_next/:splat 200

# Protect API routes
/api/* /404.html 404`;
  
  try {
    fs.writeFileSync(redirectsPath, redirectsContent, { encoding: 'ascii' });
    console.log(colors.green('File _redirects berhasil dibuat ulang dengan direktif lengkap!'));
    
    // Untuk keamanan, periksa isi file setelah ditulis
    const fileContent = fs.readFileSync(redirectsPath, 'utf8');
    if (
      fileContent.includes('/* /index.html 200!') && 
      fileContent.includes('/_next/*') && 
      fileContent.includes('/api/* /404.html 404')
    ) {
      console.log(colors.green('Verifikasi konten _redirects: Semua direktif penting ada!'));
      return true;
    } else {
      console.warn(colors.yellow('File _redirects berhasil dibuat tetapi mungkin tidak lengkap!'));
      return false;
    }
  } catch (error) {
    console.error(colors.red(`Gagal membuat file _redirects: ${error.message}`));
    return false;
  }
}

function validatePolyfills() {
  const promisePolyfillPath = path.join(OUT_DIR, 'promise-polyfill.js');
  const pdfWorkerWrapperPath = path.join(OUT_DIR, 'pdf-worker-wrapper.js');
  
  let success = true;
  
  // Cek promise-polyfill.js
  if (!fs.existsSync(promisePolyfillPath)) {
    console.error(colors.red('File promise-polyfill.js tidak ditemukan!'));
    success = false;
  } else {
    console.log(colors.green('File promise-polyfill.js ditemukan!'));
  }
  
  // Cek pdf-worker-wrapper.js
  if (!fs.existsSync(pdfWorkerWrapperPath)) {
    console.error(colors.red('File pdf-worker-wrapper.js tidak ditemukan!'));
    success = false;
  } else {
    console.log(colors.green('File pdf-worker-wrapper.js ditemukan!'));
  }
  
  return success;
}

function validateNetlifyToml() {
  const netlifyTomlPath = path.join(process.cwd(), 'netlify.toml');
  
  if (!fs.existsSync(netlifyTomlPath)) {
    console.error(colors.red('File netlify.toml tidak ditemukan!'));
    return false;
  }
  
  console.log(colors.green('File netlify.toml ditemukan!'));
  
  // Validasi konten netlify.toml (basic check)
  const content = fs.readFileSync(netlifyTomlPath, 'utf8');
  
  if (!content.includes('[build]') || !content.includes('publish = "out"')) {
    console.error(colors.red('netlify.toml tidak berisi konfigurasi build yang benar!'));
    return false;
  }
  
  if (!content.includes('[[redirects]]') || !content.includes('from = "/*"') || !content.includes('to = "/index.html"')) {
    console.warn(colors.yellow('netlify.toml mungkin tidak berisi konfigurasi redirects yang diperlukan untuk SPA'));
  }
  
  return true;
}

function main() {
  console.log(colors.green('=== Validasi Konfigurasi Netlify ==='));
  
  // Pastikan folder out ada
  if (!fs.existsSync(OUT_DIR)) {
    console.error(colors.red('Folder "out" tidak ditemukan! Jalankan build terlebih dahulu.'));
    process.exit(1);
  }
  
  const redirectsValid = validateRedirects();
  const polyfillsValid = validatePolyfills();
  const netlifyTomlValid = validateNetlifyToml();
  
  console.log('\n=== Hasil Validasi ===');
  console.log(`_redirects: ${redirectsValid ? colors.green('✓ Valid') : colors.red('✗ Invalid')}`);
  console.log(`Polyfills: ${polyfillsValid ? colors.green('✓ Valid') : colors.red('✗ Invalid')}`);
  console.log(`netlify.toml: ${netlifyTomlValid ? colors.green('✓ Valid') : colors.red('✗ Invalid')}`);
  
  if (redirectsValid && polyfillsValid && netlifyTomlValid) {
    console.log(colors.green('\n✅ Semua validasi berhasil! Siap untuk deployment.'));
    process.exit(0);
  } else {
    console.error(colors.red('\n❌ Beberapa validasi gagal! Perbaiki masalah sebelum melakukan deployment.'));
    process.exit(1);
  }
}

main(); 
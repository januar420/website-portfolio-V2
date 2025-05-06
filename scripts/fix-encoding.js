/**
 * Script untuk memperbaiki encoding file-file penting
 * 
 * Script ini akan:
 * 1. Memeriksa file-file penting (_redirects, netlify.toml, dsb)
 * 2. Memastikan encoding yang digunakan adalah ASCII/UTF-8 tanpa BOM
 * 3. Memperbaiki file-file yang memiliki encoding salah
 */

const fs = require('fs');
const path = require('path');

// Helper untuk output berwarna
const colors = {
  green: (text) => `✅ ${text}`,
  red: (text) => `❌ ${text}`,
  yellow: (text) => `⚠️ ${text}`,
  blue: (text) => `🔵 ${text}`
};

// Fungsi untuk memeriksa dan memperbaiki file _redirects
function fixRedirectsFile() {
  const outDir = path.join(__dirname, '..', 'out');
  const redirectsPath = path.join(outDir, '_redirects');
  
  if (!fs.existsSync(outDir)) {
    console.error(colors.red(`Direktori output '${outDir}' tidak ditemukan!`));
    console.log(colors.yellow('Jalankan build terlebih dahulu: npm run build:netlify'));
    return false;
  }
  
  // Konten untuk file _redirects
  const redirectsContent = `# Redirects untuk Next.js SPA
/* /index.html 200!
/_next/* /_next/:splat 200

# Protect API routes
/api/* /404.html 404`;
  
  try {
    // Tulis ulang file dengan encoding ASCII
    fs.writeFileSync(redirectsPath, redirectsContent, { encoding: 'ascii' });
    console.log(colors.green(`File _redirects berhasil ditulis ulang dengan encoding ASCII!`));
    return true;
  } catch (error) {
    console.error(colors.red(`Gagal menulis file _redirects: ${error.message}`));
    return false;
  }
}

// Fungsi untuk memeriksa file netlify.toml
function checkNetlifyToml() {
  const netlifyTomlPath = path.join(__dirname, '..', 'netlify.toml');
  
  if (!fs.existsSync(netlifyTomlPath)) {
    console.error(colors.red(`File netlify.toml tidak ditemukan!`));
    return false;
  }
  
  try {
    // Baca file dan periksa encoding
    const content = fs.readFileSync(netlifyTomlPath, 'utf8');
    
    // Deteksi kemungkinan masalah dengan BOM atau karakter khusus
    const hasBOM = content.charCodeAt(0) === 0xFEFF;
    const hasInvalidChars = /[^\x00-\x7F]/.test(content);
    
    if (hasBOM || hasInvalidChars) {
      console.log(colors.yellow(`File netlify.toml memiliki masalah encoding! ${hasBOM ? 'BOM terdeteksi.' : ''} ${hasInvalidChars ? 'Karakter non-ASCII terdeteksi.' : ''}`));
      
      // Hapus BOM jika ada
      const cleanContent = hasBOM ? content.substring(1) : content;
      
      // Ganti karakter non-ASCII
      const asciiContent = cleanContent.replace(/[^\x00-\x7F]/g, '');
      
      // Tulis ulang file
      fs.writeFileSync(netlifyTomlPath, asciiContent, { encoding: 'utf8' });
      console.log(colors.green(`File netlify.toml berhasil ditulis ulang dengan encoding yang benar!`));
    } else {
      console.log(colors.green(`File netlify.toml memiliki encoding yang benar!`));
    }
    
    return true;
  } catch (error) {
    console.error(colors.red(`Gagal memeriksa file netlify.toml: ${error.message}`));
    return false;
  }
}

// Fungsi untuk memeriksa file HTML utama
function checkMainHtmlFile() {
  const outDir = path.join(__dirname, '..', 'out');
  const indexHtmlPath = path.join(outDir, 'index.html');
  
  if (!fs.existsSync(indexHtmlPath)) {
    console.error(colors.red(`File index.html tidak ditemukan!`));
    return false;
  }
  
  try {
    // Baca file dan periksa encoding
    const content = fs.readFileSync(indexHtmlPath, 'utf8');
    
    // Periksa apakah ada script Promise.withResolvers
    if (!content.includes('promise-polyfill.js')) {
      console.log(colors.yellow(`File index.html tidak memiliki script polyfill untuk Promise.withResolvers!`));
      
      // Tambahkan script polyfill
      const updatedContent = content.replace('</head>', '<script src="/promise-polyfill.js"></script></head>');
      
      // Tulis ulang file
      fs.writeFileSync(indexHtmlPath, updatedContent, { encoding: 'utf8' });
      console.log(colors.green(`File index.html berhasil ditambahkan script polyfill!`));
    } else {
      console.log(colors.green(`File index.html sudah memiliki script polyfill!`));
    }
    
    return true;
  } catch (error) {
    console.error(colors.red(`Gagal memeriksa file index.html: ${error.message}`));
    return false;
  }
}

// Jalankan semua pemeriksaan
console.log(colors.blue('=== Memperbaiki Encoding File-File Penting ==='));

const redirectsFixed = fixRedirectsFile();
const netlifyTomlChecked = checkNetlifyToml();
const htmlChecked = checkMainHtmlFile();

if (redirectsFixed && netlifyTomlChecked && htmlChecked) {
  console.log(colors.green('\n✅ Semua file penting sudah diperbaiki dan memiliki encoding yang benar!'));
} else {
  console.log(colors.yellow('\n⚠️ Beberapa file masih memiliki masalah. Jalankan npm run fix-netlify untuk perbaikan lengkap.'));
} 
/**
 * Script pre-build untuk mengganti penggunaan Promise.withResolvers
 * dengan implementasi yang kompatibel di semua environment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Install polyfill global
require('./fix-promise-polyfill');

console.log('🔍 Mencari dan memperbaiki file yang menggunakan Promise.withResolvers...');

// Direktori yang akan discan
const dirsToScan = [
  path.join(__dirname, '..', 'node_modules', 'pdfjs-dist'),
  path.join(__dirname, '..', 'node_modules', 'react-pdf')
];

// Pattern untuk mencari penggunaan Promise.withResolvers
const withResolversPattern = /Promise\.withResolvers\(\)/g;
const withResolversReplacement = `
(function() { 
  let _resolve, _reject;
  const _promise = new Promise((res, rej) => {
    _resolve = res;
    _reject = rej;
  });
  return { promise: _promise, resolve: _resolve, reject: _reject };
})()
`;

// Fungsi untuk memproses file
function processFile(filePath) {
  try {
    // Hanya proses file JavaScript dan TypeScript
    if (!/\.(js|jsx|ts|tsx)$/.test(filePath)) return;
    
    // Baca konten file
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Jika tidak menggunakan Promise.withResolvers, lanjutkan
    if (!withResolversPattern.test(content)) return;
    
    console.log(`🔧 Memperbaiki file: ${filePath}`);
    
    // Ganti penggunaan Promise.withResolvers dengan implementasi kompatibel
    const fixedContent = content.replace(withResolversPattern, withResolversReplacement);
    
    // Tulis kembali file
    fs.writeFileSync(filePath, fixedContent, 'utf8');
    
    console.log(`✅ File berhasil diperbaiki: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`❌ Error saat memproses file ${filePath}:`, error.message);
    return false;
  }
}

// Fungsi untuk memproses direktori secara rekursif
function processDirectory(dir) {
  try {
    // Periksa apakah direktori ada
    if (!fs.existsSync(dir)) {
      console.log(`⚠️ Direktori tidak ditemukan: ${dir}`);
      return;
    }
    
    // Baca semua file dalam direktori
    const items = fs.readdirSync(dir);
    
    let fixedFilesCount = 0;
    
    // Proses setiap item
    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory()) {
        // Proses sub-direktori secara rekursif
        fixedFilesCount += processDirectory(itemPath) || 0;
      } else if (stats.isFile()) {
        // Proses file
        if (processFile(itemPath)) {
          fixedFilesCount++;
        }
      }
    }
    
    return fixedFilesCount;
  } catch (error) {
    console.error(`❌ Error saat memproses direktori ${dir}:`, error.message);
    return 0;
  }
}

// Copy polyfill ke direktori publik
function copyPolyfillToPublic() {
  const sourceFile = path.join(__dirname, 'fix-promise-polyfill.js');
  const destFile = path.join(__dirname, '..', 'public', 'promise-polyfill.js');
  
  try {
    fs.copyFileSync(sourceFile, destFile);
    console.log('✅ Polyfill disalin ke public/promise-polyfill.js');
  } catch (error) {
    console.error('❌ Error saat menyalin polyfill:', error.message);
  }
}

// Fungsi utama
function main() {
  console.log('=== Persiapan Build: Perbaikan Promise.withResolvers ===');
  
  // Copy polyfill ke direktori publik
  copyPolyfillToPublic();
  
  // Proses direktori node_modules
  let totalFixed = 0;
  for (const dir of dirsToScan) {
    console.log(`🔍 Memproses direktori: ${dir}`);
    const fixedCount = processDirectory(dir) || 0;
    totalFixed += fixedCount;
    console.log(`📊 Total ${fixedCount} file diperbaiki di ${dir}`);
  }
  
  console.log(`🎉 Proses selesai. Total ${totalFixed} file diperbaiki.`);
}

// Jalankan fungsi utama
main(); 
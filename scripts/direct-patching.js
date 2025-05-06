/**
 * Script untuk melakukan patching langsung ke node_modules untuk memperbaiki 
 * masalah Promise.withResolvers di lingkungan build GitHub Actions
 */

const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');

console.log('🔧 Direct patching untuk dependencies...');

/**
 * Mencari file-file di node_modules yang menggunakan Promise.withResolvers
 */
function findFilesWithPattern() {
  try {
    console.log('🔍 Mencari file dengan penggunaan Promise.withResolvers...');
    
    // Jalankan grep untuk menemukan file
    const result = childProcess.execSync(
      'grep -r "Promise.withResolvers" --include="*.js" --include="*.ts" --include="*.jsx" --include="*.tsx" ./node_modules',
      { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }
    );
    
    // Ekstrak path file
    const files = result.split('\n')
      .filter(line => line.trim() !== '')
      .map(line => {
        const colonIndex = line.indexOf(':');
        return line.substring(0, colonIndex);
      })
      .filter((value, index, self) => self.indexOf(value) === index); // unique values
    
    console.log(`✅ Ditemukan ${files.length} file yang menggunakan Promise.withResolvers`);
    return files;
  } catch (error) {
    console.error('❌ Error saat mencari file:', error.message);
    // Jika grep tidak menemukan apa-apa
    return [];
  }
}

/**
 * Memperbaiki file dengan mengganti Promise.withResolvers
 */
function patchFile(filePath) {
  try {
    console.log(`🔧 Memperbaiki file: ${filePath}`);
    
    // Baca file
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Ganti Promise.withResolvers dengan implementasi inline
    const patchedContent = content.replace(
      /Promise\.withResolvers\(\)/g,
      `(function() { 
        let _resolve, _reject;
        const _promise = new Promise(function(res, rej) {
          _resolve = res;
          _reject = rej;
        });
        return { promise: _promise, resolve: _resolve, reject: _reject };
      })()`
    );
    
    // Tulis file
    fs.writeFileSync(filePath, patchedContent, 'utf8');
    
    console.log(`✅ Berhasil memperbaiki file: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`❌ Error saat memperbaiki file ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Memperbaiki semua versi pdfjs-dist
 */
function patchPdfjsDist() {
  try {
    const pdfjsPath = path.join('node_modules', 'pdfjs-dist');
    
    if (!fs.existsSync(pdfjsPath)) {
      console.log('⚠️ Package pdfjs-dist tidak ditemukan, melanjutkan...');
      return 0;
    }
    
    console.log('🔧 Memperbaiki package pdfjs-dist...');
    
    // Mencari file PDF.js yang berisi Promise.withResolvers
    const pdfjsFiles = findFilesWithPattern();
    
    let patchedCount = 0;
    for (const file of pdfjsFiles) {
      if (file.includes('pdfjs-dist') || file.includes('react-pdf')) {
        if (patchFile(file)) {
          patchedCount++;
        }
      }
    }
    
    console.log(`📊 Total ${patchedCount} file pdfjs-dist telah diperbaiki`);
    return patchedCount;
  } catch (error) {
    console.error('❌ Error saat memperbaiki pdfjs-dist:', error.message);
    return 0;
  }
}

/**
 * Implementasi global Promise.withResolvers
 */
function applyGlobalPolyfill() {
  try {
    if (typeof Promise.withResolvers !== 'function') {
      Promise.withResolvers = function() {
        let resolve, reject;
        const promise = new Promise(function(res, rej) {
          resolve = res;
          reject = rej;
        });
        return { promise, resolve, reject };
      };
      console.log('✅ Promise.withResolvers polyfill global berhasil diterapkan');
      return true;
    } else {
      console.log('ℹ️ Promise.withResolvers sudah tersedia di global scope');
      return false;
    }
  } catch (error) {
    console.error('❌ Error saat menerapkan polyfill global:', error.message);
    return false;
  }
}

/**
 * Fungsi utama
 */
function main() {
  console.log('=== Direct Patching untuk Dependencies ===');
  
  // Terapkan polyfill global
  applyGlobalPolyfill();
  
  // Patch pdfjs-dist
  const patchedCount = patchPdfjsDist();
  
  console.log(`🎉 Proses selesai. Total ${patchedCount} file berhasil diperbaiki.`);
}

// Jalankan fungsi utama
main(); 
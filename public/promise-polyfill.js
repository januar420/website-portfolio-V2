/**
 * Script untuk menambahkan polyfill Promise.withResolvers ke Node.js
 * Digunakan untuk build process di lingkungan GitHub Actions 
 */

'use strict';

console.log('🔧 Menambahkan polyfill untuk Promise.withResolvers...');

// Patch global Promise object di Node.js
if (typeof Promise.withResolvers !== 'function') {
  // Definisi polyfill yang kompatibel dengan semua versi Node.js
  Object.defineProperty(Promise, 'withResolvers', {
    configurable: true,
    writable: true,
    value: function withResolvers() {
      let resolve, reject;
      const promise = new Promise(function(res, rej) {
        resolve = res;
        reject = rej;
      });
      return { promise, resolve, reject };
    }
  });
  
  console.log('✅ Promise.withResolvers polyfill berhasil ditambahkan dengan Object.defineProperty');
  
  // Verifikasi polyfill berfungsi
  try {
    const { promise, resolve } = Promise.withResolvers();
    resolve('test');
    promise.then(() => {
      console.log('✅ Polyfill berfungsi dengan benar');
    });
  } catch (error) {
    console.error('❌ Error pada polyfill:', error);
    
    // Fallback jika defineProperty tidak berhasil
    console.log('⚠️ Mencoba metode polyfill alternatif...');
    Promise.withResolvers = function withResolvers() {
      let resolve, reject;
      const promise = new Promise(function(res, rej) {
        resolve = res;
        reject = rej;
      });
      return { promise, resolve, reject };
    };
    
    // Verifikasi lagi
    try {
      const { promise, resolve } = Promise.withResolvers();
      resolve('test-fallback');
      promise.then(() => {
        console.log('✅ Polyfill alternatif berfungsi dengan benar');
      });
    } catch (e) {
      console.error('❌ Kedua metode polyfill gagal:', e);
      process.exit(1);
    }
  }
} else {
  console.log('ℹ️ Promise.withResolvers sudah tersedia, tidak perlu polyfill');
}

// Tambahkan ke global jika berjalan di browser-like environment
if (typeof window !== 'undefined' && typeof window.Promise === 'function' && 
    typeof window.Promise.withResolvers !== 'function') {
  Object.defineProperty(window.Promise, 'withResolvers', {
    configurable: true,
    writable: true,
    value: Promise.withResolvers
  });
  console.log('✅ Promise.withResolvers polyfill ditambahkan ke window.Promise');
}

// Ekspor polyfill dan fungsi utilitas
module.exports = {
  installPromisePolyfill() {
    return typeof Promise.withResolvers === 'function';
  },
  
  // Mengekspos fungsi withResolvers langsung jika diperlukan
  withResolvers: function() {
    if (typeof Promise.withResolvers === 'function') {
      return Promise.withResolvers();
    }
    
    // Fallback implementasi
    let resolve, reject;
    const promise = new Promise(function(res, rej) {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  }
}; 
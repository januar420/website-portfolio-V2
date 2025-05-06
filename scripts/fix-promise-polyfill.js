/**
 * Script untuk menambahkan polyfill Promise.withResolvers ke Node.js
 * Digunakan untuk build process di lingkungan GitHub Actions 
 */

'use strict';

console.log('🔧 Menambahkan polyfill untuk Promise.withResolvers...');

// Tambahkan polyfill jika belum ada
if (typeof Promise.withResolvers !== 'function') {
  Promise.withResolvers = function() {
    let resolve, reject;
    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };
  console.log('✅ Promise.withResolvers polyfill berhasil ditambahkan');
} else {
  console.log('ℹ️ Promise.withResolvers sudah tersedia, tidak perlu polyfill');
}

// Pastikan polyfill bekerja dengan benar
try {
  const { promise, resolve } = Promise.withResolvers();
  resolve('test');
  promise.then(() => {
    console.log('✅ Polyfill berfungsi dengan benar');
  });
} catch (error) {
  console.error('❌ Error pada polyfill:', error);
  process.exit(1);
}

// Ekspor polyfill untuk digunakan di file lain
module.exports = {
  installPromisePolyfill() {
    return typeof Promise.withResolvers === 'function';
  }
}; 
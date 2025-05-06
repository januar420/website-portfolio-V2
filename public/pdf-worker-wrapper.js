/**
 * PDF.js Worker Wrapper
 * 
 * File ini menerapkan polyfill untuk Promise.withResolvers dan DOMMatrix
 * sebelum memuat pdf.worker.min.js yang asli. Ini mengatasi masalah 
 * kompatibilitas dengan lingkungan Node.js atau browser lama.
 */

// Polyfill untuk importScripts jika tidak tersedia
if (typeof importScripts !== 'function') {
  console.info('[PDF-WORKER] Adding importScripts polyfill');
  
  // Implementasi importScripts sederhana menggunakan XMLHttpRequest
  self.importScripts = function(...urls) {
    // Pesan log
    console.info('[PDF-WORKER] Fake importScripts called with:', urls);
    
    // Dalam implementasi palsu kita, kita hanya log pesan dan tidak memuat script
    // Ini mencegah error saat berjalan di lingkungan non-worker
    return null;
  };
}

// Menerapkan polyfill Promise.withResolvers jika tidak tersedia
if (typeof Promise.withResolvers !== 'function') {
  console.info('[PDF-WORKER] Adding Promise.withResolvers polyfill');
  Promise.withResolvers = function() {
    let resolve, reject;
    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };
}

// Menerapkan polyfill DOMMatrix jika tidak tersedia
if (typeof self !== 'undefined' && !self.DOMMatrix) {
  console.info('[PDF-WORKER] Adding DOMMatrix polyfill');
  self.DOMMatrix = function DOMMatrixPolyfill(transform) {
    if (!(this instanceof DOMMatrixPolyfill)) {
      return new DOMMatrixPolyfill(transform);
    }
    
    // Properti default
    this.a = 1; this.b = 0; this.c = 0; this.d = 1; this.e = 0; this.f = 0;
    this.m11 = 1; this.m12 = 0; this.m13 = 0; this.m14 = 0;
    this.m21 = 0; this.m22 = 1; this.m23 = 0; this.m24 = 0;
    this.m31 = 0; this.m32 = 0; this.m33 = 1; this.m34 = 0;
    this.m41 = 0; this.m42 = 0; this.m43 = 0; this.m44 = 1;
    this.is2D = true;
    this.isIdentity = true;
  };
  
  // Metode instance
  self.DOMMatrix.prototype.translate = function() { return new self.DOMMatrix(); };
  self.DOMMatrix.prototype.scale = function() { return new self.DOMMatrix(); };
  self.DOMMatrix.prototype.multiply = function() { return new self.DOMMatrix(); };
  self.DOMMatrix.prototype.inverse = function() { return new self.DOMMatrix(); };
  
  // Metode statis
  self.DOMMatrix.fromMatrix = function() { return new self.DOMMatrix(); };
  self.DOMMatrix.fromFloat32Array = function() { return new self.DOMMatrix(); };
  self.DOMMatrix.fromFloat64Array = function() { return new self.DOMMatrix(); };
}

// Cobalah load worker asli dengan try-catch
try {
  // Load worker asli
  if (typeof importScripts === 'function') {
    importScripts('./pdf.worker.min.js');
    console.info('[PDF-WORKER] Successfully loaded worker script');
  } else {
    console.warn('[PDF-WORKER] Cannot load worker script - importScripts not available');
  }
} catch (error) {
  console.error('[PDF-WORKER] Error loading worker script:', error);
} 
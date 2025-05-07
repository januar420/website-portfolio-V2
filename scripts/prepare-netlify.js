/**
 * Script untuk mempersiapkan output Next.js untuk deployment ke Netlify
 * Ini menangani masalah hidrasi dan rute untuk aplikasi Next.js App Router
 */

const fs = require('fs');
const path = require('path');

// Function untuk log tanpa dependensi chalk
const log = {
  info: (msg) => console.log('ℹ️ ' + msg),
  success: (msg) => console.log('✅ ' + msg),
  warning: (msg) => console.log('⚠️ ' + msg),
  error: (msg) => console.log('❌ ' + msg)
};

log.info('Mempersiapkan output Next.js untuk Netlify...');

// Path ke direktori output
const outputDir = path.join(__dirname, '..', 'out');

// Pastikan direktori output ada
if (!fs.existsSync(outputDir)) {
  log.error('Direktori output tidak ditemukan di ' + outputDir);
  log.info('Pastikan Anda telah menjalankan `next build` sebelum script ini.');
  process.exit(1);
}

// Tambahkan _redirects file jika belum ada
const redirectsFile = path.join(outputDir, '_redirects');
if (!fs.existsSync(redirectsFile)) {
  log.info('Membuat file _redirects untuk Netlify...');
  
  const redirectsContent = `
# Redirects untuk Netlify - Next.js App Router
# Tangani asset statis
/_next/static/*  /_next/static/:splat  200
/_next/*  /_next/:splat  200

# Tangani file statis di root
/pdf.worker.min.js  /pdf.worker.min.js  200
/pdf-worker-fallback.js  /pdf-worker-fallback.js  200
/promise-polyfill.js  /promise-polyfill.js  200

# API routes tidak digunakan di static export
/api/*  /404.html  404

# SPA fallback untuk semua rute lainnya
/*  /index.html  200
`;
  
  fs.writeFileSync(redirectsFile, redirectsContent.trim());
  log.success('File _redirects berhasil dibuat');
}

// Tambahkan polyfill untuk Promise.withResolvers ke direktori output
const promisePolyfillFile = path.join(outputDir, 'promise-polyfill.js');
log.info('Menambahkan polyfill untuk Promise.withResolvers...');

const polyfillContent = `
// Polyfill untuk Promise.withResolvers
if (typeof Promise.withResolvers !== 'function') {
  Promise.withResolvers = function withResolvers() {
    let resolve, reject;
    const promise = new Promise(function(res, rej) {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };
  console.log('Promise.withResolvers polyfill telah dimuat');
}
`;

fs.writeFileSync(promisePolyfillFile, polyfillContent.trim());
log.success('Polyfill Promise.withResolvers berhasil ditambahkan');

// Tambahkan file _headers untuk mengoptimalkan cache
const headersFile = path.join(outputDir, '_headers');
if (!fs.existsSync(headersFile)) {
  log.info('Membuat file _headers untuk Netlify...');
  
  const headersContent = `
# Cache headers untuk Netlify
/_next/static/*
  Cache-Control: public, max-age=31536000, immutable

/images/*
  Cache-Control: public, max-age=86400

/*.pdf
  Content-Type: application/pdf
  Content-Disposition: inline
  Cache-Control: public, max-age=604800

/*.js
  Cache-Control: public, max-age=86400

/promise-polyfill.js
  Cache-Control: public, max-age=3600
`;
  
  fs.writeFileSync(headersFile, headersContent.trim());
  log.success('File _headers berhasil dibuat');
}

// Tambahkan tag script untuk Promise.withResolvers di index.html
const indexFile = path.join(outputDir, 'index.html');
if (fs.existsSync(indexFile)) {
  log.info('Menambahkan polyfill Promise.withResolvers ke index.html...');
  
  let indexContent = fs.readFileSync(indexFile, 'utf8');
  
  // Tambahkan polyfill sebelum tag </head>
  if (!indexContent.includes('promise-polyfill.js')) {
    indexContent = indexContent.replace(
      '</head>',
      '<script src="/promise-polyfill.js"></script></head>'
    );
    
    fs.writeFileSync(indexFile, indexContent);
    log.success('Polyfill berhasil ditambahkan ke index.html');
  } else {
    log.info('Polyfill sudah ada di index.html');
  }
}

log.success('Persiapan untuk Netlify selesai!');
log.info('Untuk deploy ke Netlify, jalankan: netlify deploy --prod --dir=out'); 
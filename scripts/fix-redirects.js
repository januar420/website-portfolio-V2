/**
 * Script untuk membuat file _redirects yang sesuai dengan kebutuhan Netlify
 */

const fs = require('fs');
const path = require('path');

// Path ke direktori output dan file _redirects
const outDir = path.join(__dirname, '..', 'out');
const redirectsPath = path.join(outDir, '_redirects');
const rootRedirectsPath = path.join(__dirname, '..', '_redirects');

// Konten _redirects yang lebih komprehensif untuk Next.js
const redirectsContent = `# Redirects untuk Next.js SPA
# Penting: Urutannya sangat berpengaruh!

# Penanganan aset khusus
/_next/static/*  /_next/static/:splat  200
/_next/image*  /_next/image:splat  200
/static/*  /static/:splat  200
/fonts/*  /fonts/:splat  200
/images/*  /images/:splat  200
/assets/*  /assets/:splat  200

# PDF Worker dan file terkait
/pdf.worker.min.js  /pdf.worker.min.js  200
/pdf-worker-wrapper.js  /pdf-worker-wrapper.js  200
/pdf-worker-fallback.js  /pdf-worker-fallback.js  200
/promise-polyfill.js  /promise-polyfill.js  200

# Penanganan aset lainnya
*.js  /:splat  200
*.css  /:splat  200
*.svg  /:splat  200
*.jpg  /:splat  200
*.png  /:splat  200
*.ico  /:splat  200
*.json  /:splat  200
*.woff2  /:splat  200

# Lindungi API routes
/api/*  /404.html  404

# Rute SPA - harus di baris terakhir
/*  /index.html  200!`;

// Tulis file _redirects
try {
  fs.writeFileSync(redirectsPath, redirectsContent, { encoding: 'ascii' });
  console.log('✅ File _redirects berhasil ditulis dengan konten yang benar!');
  
  // Tampilkan konten file untuk konfirmasi
  console.log('\nIsi file _redirects:\n-------------------');
  console.log(redirectsContent);
  console.log('-------------------\n');
  console.log('✅ File siap untuk deployment!');
  
  // Buat salinan di root folder sebagai backup
  fs.writeFileSync(rootRedirectsPath, redirectsContent, { encoding: 'ascii' });
  console.log('✅ Juga telah dibuat salinan file _redirects di root folder sebagai backup!');
} catch (error) {
  console.error('❌ Error saat menulis file _redirects:', error);
  process.exit(1);
} 
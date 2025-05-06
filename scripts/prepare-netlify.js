/**
 * Script untuk mempersiapkan deployment ke Netlify
 * - Membuat redirects untuk SPA
 * - Menyiapkan worker files
 * - Melakukan optimasi lainnya
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Versi PDF.js yang kompatibel
const PDFJS_VERSION = '5.2.133';

// Pastikan direktori output ada
const outDir = path.join(__dirname, '..', 'out');
if (!fs.existsSync(outDir)) {
  console.error('❌ Output directory does not exist!');
  console.log('Checking for .next/standalone or .next directories...');
  
  // Periksa apakah kita menggunakan 'output: export' di next.config.js
  const nextStaticDir = path.join(__dirname, '..', '.next', 'static');
  const nextStandaloneDir = path.join(__dirname, '..', '.next', 'standalone');
  
  if (fs.existsSync(nextStaticDir)) {
    console.log('Found .next/static directory, copying to out...');
    fs.mkdirSync(outDir, { recursive: true });
    
    // Salin semua dari .next/static ke out
    const copyDirRecursiveSync = (source, target) => {
      if (!fs.existsSync(target)) {
        fs.mkdirSync(target, { recursive: true });
      }
      
      const files = fs.readdirSync(source);
      
      files.forEach(file => {
        const currentSource = path.join(source, file);
        const currentTarget = path.join(target, file);
        
        if (fs.statSync(currentSource).isDirectory()) {
          copyDirRecursiveSync(currentSource, currentTarget);
        } else {
          fs.copyFileSync(currentSource, currentTarget);
        }
      });
    };
    
    try {
      copyDirRecursiveSync(path.join(__dirname, '..', '.next'), outDir);
      console.log('✅ Copied .next contents to out directory');
    } catch (error) {
      console.error('❌ Error copying .next contents:', error.message);
    }
  } else if (fs.existsSync(nextStandaloneDir)) {
    console.log('Found .next/standalone directory, copying to out...');
    fs.mkdirSync(outDir, { recursive: true });
    
    try {
      const copyDirRecursiveSync = (source, target) => {
        if (!fs.existsSync(target)) {
          fs.mkdirSync(target, { recursive: true });
        }
        
        const files = fs.readdirSync(source);
        
        files.forEach(file => {
          const currentSource = path.join(source, file);
          const currentTarget = path.join(target, file);
          
          if (fs.statSync(currentSource).isDirectory()) {
            copyDirRecursiveSync(currentSource, currentTarget);
          } else {
            fs.copyFileSync(currentSource, currentTarget);
          }
        });
      };
      
      copyDirRecursiveSync(nextStandaloneDir, outDir);
      console.log('✅ Copied .next/standalone contents to out directory');
    } catch (error) {
      console.error('❌ Error copying .next/standalone contents:', error.message);
    }
  } else {
    console.error('❌ No output directories found. Make sure your next.config.js has "output: export" set');
    console.log('Creating empty output directory anyway...');
    fs.mkdirSync(outDir, { recursive: true });
  }
}

// Fungsi helper untuk menyalin file
const copyFile = (source, destination) => {
  try {
    fs.copyFileSync(source, destination);
    console.log(`✅ Copied ${source} to ${destination}`);
  } catch (error) {
    console.error(`❌ Error copying ${source} to ${destination}:`, error.message);
  }
};

// Fungsi untuk membuat direktori jika belum ada
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
    return true;
  }
  return false;
};

// Fungsi untuk membuat _redirects file
const createRedirects = () => {
  try {
    const redirectsContent = `# Redirects untuk Next.js SPA
/* /index.html 200!
/_next/* /_next/:splat 200

# Protect API routes
/api/* /404.html 404`;
    
    fs.writeFileSync(path.join(outDir, '_redirects'), redirectsContent, { encoding: 'ascii' });
    console.log('✅ Created _redirects file for Netlify');
  } catch (error) {
    console.error('❌ Error creating _redirects file:', error.message);
  }
};

// Fungsi untuk menyalin pdf.worker.min.js
const copyPdfWorker = () => {
  const possibleSourcePaths = [
    path.join(__dirname, '..', 'public', 'pdf.worker.min.js'),
    path.join(__dirname, '..', 'node_modules', 'pdfjs-dist', 'build', 'pdf.worker.min.js')
  ];
  
  const destWorker = path.join(outDir, 'pdf.worker.min.js');
  
  let workerFound = false;
  
  // Periksa daftar sumber yang mungkin
  for (const sourcePath of possibleSourcePaths) {
    if (fs.existsSync(sourcePath)) {
      copyFile(sourcePath, destWorker);
      workerFound = true;
      break;
    }
  }
  
  // Jika worker tidak ditemukan, coba download dari unpkg
  if (!workerFound) {
    console.warn('⚠️ PDF worker file not found in possible paths!');
    
    try {
      console.log(`Downloading pdf.worker.min.js v${PDFJS_VERSION} as fallback...`);
      execSync(`curl -L https://unpkg.com/pdfjs-dist@${PDFJS_VERSION}/build/pdf.worker.min.js -o ${destWorker}`);
      console.log('✅ Downloaded pdf.worker.min.js from unpkg');
    } catch (downloadError) {
      console.error('❌ Failed to download PDF worker from unpkg:', downloadError.message);
      
      try {
        console.log('Trying alternative CDN (jsdelivr)...');
        execSync(`curl -L https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_VERSION}/build/pdf.worker.min.js -o ${destWorker}`);
        console.log('✅ Downloaded pdf.worker.min.js from jsdelivr');
      } catch (altDownloadError) {
        console.error('❌ Failed to download PDF worker from alternative CDN:', altDownloadError.message);
      }
    }
  }
};

// Fungsi untuk menyiapkan cmaps dan font
const setupCmapsAndFonts = () => {
  // Buat direktori cmaps dan standard_fonts
  const cmapsDir = path.join(outDir, 'cmaps');
  const standardFontsDir = path.join(outDir, 'standard_fonts');
  
  ensureDir(cmapsDir);
  ensureDir(standardFontsDir);
  
  // Buat file placeholder untuk memastikan direktori ada dan diindeks
  try {
    fs.writeFileSync(path.join(cmapsDir, 'README.md'), 
      `# PDF.js CMaps\n\nThis directory contains character maps (CMaps) for PDF.js.\nThese files are automatically loaded from CDN when needed.`);
    
    fs.writeFileSync(path.join(standardFontsDir, 'README.md'), 
      `# PDF.js Standard Fonts\n\nThis directory contains standard fonts for PDF.js.\nThese files are automatically loaded from CDN when needed.`);
    
    console.log('✅ Created placeholder files for cmaps and standard_fonts directories');
  } catch (error) {
    console.error('❌ Error creating placeholder files:', error.message);
  }
};

// Fungsi untuk membuat file konfigurasi Netlify jika belum ada
const ensureNetlifyConfig = () => {
  const netlifyTomlPath = path.join(__dirname, '..', 'netlify.toml');
  if (!fs.existsSync(netlifyTomlPath)) {
    const minimalConfig = `
[build]
  publish = "out"
  command = "npm run build:netlify"

[[headers]]
  for = "/pdf.worker.min.js"
  [headers.values]
    Access-Control-Allow-Origin = "*"
    Content-Type = "application/javascript"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
`;
    fs.writeFileSync(netlifyTomlPath, minimalConfig.trim());
    console.log('✅ Created minimal netlify.toml configuration');
  } else {
    console.log('✅ netlify.toml configuration already exists');
  }
};

// Fungsi untuk membuat Custom 404 page
const create404Page = () => {
  const notFoundPath = path.join(outDir, '404.html');
  if (!fs.existsSync(notFoundPath)) {
    const notFoundContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page Not Found</title>
  <style>
    body { 
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      height: 100vh; 
      margin: 0; 
      background-color: #f9fafb; 
      color: #111827;
    }
    .container { 
      text-align: center; 
      padding: 2rem; 
      max-width: 600px;
    }
    h1 { 
      font-size: 3rem; 
      margin-bottom: 1rem; 
      color: #3b82f6;
    }
    p { 
      margin-bottom: 2rem; 
      line-height: 1.5;
    }
    .button {
      display: inline-block;
      background-color: #3b82f6;
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 0.375rem;
      text-decoration: none;
      font-weight: 500;
      transition: background-color 0.2s;
    }
    .button:hover {
      background-color: #2563eb;
    }
    @media (prefers-color-scheme: dark) {
      body { 
        background-color: #111827; 
        color: #f9fafb;
      }
      h1 { 
        color: #60a5fa;
      }
      .button {
        background-color: #60a5fa;
      }
      .button:hover {
        background-color: #3b82f6;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>404</h1>
    <p>Halaman yang Anda cari tidak ditemukan. Mungkin URL yang dimasukkan salah atau halaman tersebut telah dipindahkan.</p>
    <a href="/" class="button">Kembali ke Beranda</a>
  </div>
</body>
</html>
`;
    fs.writeFileSync(notFoundPath, notFoundContent.trim());
    console.log('✅ Created custom 404 page');
  } else {
    console.log('✅ 404 page already exists');
  }
};

// Fungsi untuk menyiapkan file PDF.js fallback
const createPdfJsFallback = () => {
  try {
    // Buat file JS kecil yang akan me-load PDF.js worker jika file asli tidak ditemukan
    const fallbackContent = `
// PDF.js Worker Fallback
// Akan mencoba memuat worker dari berbagai CDN jika file lokal tidak tersedia
(function() {
  const workerUrls = [
    "https://unpkg.com/pdfjs-dist@${PDFJS_VERSION}/build/pdf.worker.min.js",
    "https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_VERSION}/build/pdf.worker.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.js"
  ];

  let loaded = false;

  function tryLoadWorker(index) {
    if (index >= workerUrls.length || loaded) return;
    
    const script = document.createElement('script');
    script.src = workerUrls[index];
    script.onerror = function() {
      console.warn("Failed to load PDF.js worker from " + workerUrls[index]);
      tryLoadWorker(index + 1);
    };
    script.onload = function() {
      console.log("PDF.js worker loaded from " + workerUrls[index]);
      loaded = true;
    };
    document.head.appendChild(script);
  }

  window.addEventListener('DOMContentLoaded', function() {
    // Jika browser mendukung fetch, coba fetch worker file lokal dulu
    if (typeof fetch === 'function') {
      fetch('/pdf.worker.min.js', { method: 'HEAD' })
        .then(response => {
          if (!response.ok) throw new Error("Local worker not available");
          loaded = true;
        })
        .catch(e => {
          console.warn("Local PDF.js worker not available, trying CDN...");
          tryLoadWorker(0);
        });
    } else {
      // Jika fetch tidak didukung, langsung coba CDN
      tryLoadWorker(0);
    }
  });
})();
`;

    fs.writeFileSync(path.join(outDir, 'pdf-worker-fallback.js'), fallbackContent.trim());
    console.log('✅ Created PDF.js worker fallback script');
  } catch (error) {
    console.error('❌ Error creating PDF.js fallback script:', error.message);
  }
};

// Tambahkan polyfill untuk Promise.withResolvers jika belum ada
try {
  // Polyfill utama
  const promisePolyfillContent = `
  /**
   * Polyfill untuk Promise.withResolvers
   * 
   * Fitur ini tersedia di browser modern dan Node.js 20+, tetapi tidak di Node.js 18
   * yang digunakan pada build environment Netlify
   */
  if (typeof Promise.withResolvers !== 'function') {
    console.info('[POLYFILL] Adding Promise.withResolvers polyfill');
    Promise.withResolvers = function() {
      let resolve, reject;
      const promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
      });
      return { promise, resolve, reject };
    };
  }`;

  // Tulis file promise-polyfill.js ke output
  fs.writeFileSync(path.join(outDir, 'promise-polyfill.js'), promisePolyfillContent);
  console.log('✅ Written promise-polyfill.js to output directory');

  // Tambahkan polyfill ke dalam file HTML
  const indexHtmlPath = path.join(outDir, 'index.html');
  if (fs.existsSync(indexHtmlPath)) {
    let indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
    
    // Inject script sebelum </head>
    if (!indexHtml.includes('promise-polyfill.js')) {
      indexHtml = indexHtml.replace(
        '</head>',
        '<script src="/promise-polyfill.js"></script></head>'
      );
      fs.writeFileSync(indexHtmlPath, indexHtml);
      console.log('✅ Injected Promise.withResolvers polyfill into index.html');
    }
  }

  // Cek dan salin pdf-worker-wrapper.js jika belum ada
  const sourcePdfWorkerWrapper = path.join('public', 'pdf-worker-wrapper.js');
  const destPdfWorkerWrapper = path.join(outDir, 'pdf-worker-wrapper.js');
  
  if (fs.existsSync(sourcePdfWorkerWrapper)) {
    fs.copyFileSync(sourcePdfWorkerWrapper, destPdfWorkerWrapper);
    console.log('✅ Copied pdf-worker-wrapper.js to output directory');
  } else {
    // Buat file wrapper jika tidak ada
    const pdfWorkerWrapperContent = `
    /**
     * PDF.js Worker Wrapper
     * 
     * File ini menerapkan polyfill untuk Promise.withResolvers sebelum memuat
     * pdf.worker.min.js yang asli. Ini mengatasi masalah kompatibilitas
     * dengan lingkungan Node.js atau browser lama.
     */
    
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
    
    // Load worker asli
    importScripts('./pdf.worker.min.js');`;
    
    fs.writeFileSync(destPdfWorkerWrapper, pdfWorkerWrapperContent);
    console.log('✅ Created pdf-worker-wrapper.js in output directory');
  }
} catch (error) {
  console.error('❌ Error adding polyfill files:', error);
}

// Fungsi untuk menyalin file dari public ke out
const copyPublicDir = () => {
  const publicDir = path.join(__dirname, '..', 'public');
  if (fs.existsSync(publicDir)) {
    console.log('Menyalin konten public ke direktori out...');
    
    try {
      const copyDirRecursiveSync = (source, target) => {
        if (!fs.existsSync(target)) {
          fs.mkdirSync(target, { recursive: true });
        }
        
        const files = fs.readdirSync(source);
        
        files.forEach(file => {
          // Abaikan subfolder 'cleaned-deployment'
          if (file === 'cleaned-deployment') return;
          
          const currentSource = path.join(source, file);
          const currentTarget = path.join(target, file);
          
          if (fs.statSync(currentSource).isDirectory()) {
            copyDirRecursiveSync(currentSource, currentTarget);
          } else {
            fs.copyFileSync(currentSource, currentTarget);
          }
        });
      };
      
      copyDirRecursiveSync(publicDir, outDir);
      console.log('✅ Berhasil menyalin konten public ke direktori out');
    } catch (error) {
      console.error('❌ Error menyalin public ke out:', error.message);
    }
  }
};

// Panggil fungsi-fungsi utama
const main = () => {
  copyPublicDir(); // Salin file dari public ke out terlebih dahulu
  createRedirects();
  copyPdfWorker();
  setupCmapsAndFonts();
  ensureNetlifyConfig();
  create404Page();
  createPdfJsFallback();
};

// Jalankan script
main(); 
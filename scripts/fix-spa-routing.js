/**
 * Script untuk membuat file HTML fallback untuk routing SPA di Netlify
 * - Menyalin index.html ke 200.html untuk Netlify SPA redirection
 * - Memperbaiki script loading di index.html
 */

const fs = require('fs');
const path = require('path');

// Direktori output
const outDir = path.join(__dirname, '..', 'out');

// Fungsi untuk menyalin file
const copyFile = (source, destination) => {
  try {
    fs.copyFileSync(source, destination);
    console.log(`✅ Berhasil menyalin ${path.basename(source)} ke ${path.basename(destination)}`);
    return true;
  } catch (error) {
    console.error(`❌ Gagal menyalin ${path.basename(source)}: ${error.message}`);
    return false;
  }
};

// Fungsi untuk memastikan script loading yang benar
const fixHtmlFile = (filePath) => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 1. Pastikan next-patch.js dimuat
    if (!content.includes('next-patch.js')) {
      content = content.replace(
        '<script src="/promise-polyfill.js"></script>',
        '<script src="/promise-polyfill.js"></script>\n<script src="/next-patch.js"></script>'
      );
    }
    
    // 2. Tambahkan global __NEXT_DATA__ untuk routing
    if (!content.includes('__NEXT_DATA__')) {
      const nextDataScript = `
<script>
  // Fallback Next.js data
  window.__NEXT_DATA__ = {
    props: { pageProps: {} },
    page: window.location.pathname,
    query: {},
    buildId: "static-export"
  };
</script>`;
      
      content = content.replace('</head>', nextDataScript + '\n</head>');
    }
    
    // 3. Pastikan script main-app dan page terkait
    if (!content.includes('app/page')) {
      // Dapatkan daftar file JavaScript dari direktori chunks/app
      const appDir = path.join(outDir, '_next', 'static', 'chunks', 'app');
      const layoutJsPath = fs.readdirSync(appDir)
        .find(file => file.startsWith('layout-') && file.endsWith('.js'));
      const pageJsPath = fs.readdirSync(appDir)
        .find(file => file.startsWith('page-') && file.endsWith('.js'));
      const mainAppJsPath = fs.readdirSync(path.join(outDir, '_next', 'static', 'chunks'))
        .find(file => file.startsWith('main-app-') && file.endsWith('.js'));
      
      if (layoutJsPath && pageJsPath) {
        const scriptsToAdd = `
<!-- App Scripts -->
<script src="/_next/static/chunks/app/${layoutJsPath}"></script>
<script src="/_next/static/chunks/app/${pageJsPath}"></script>
<script src="/_next/static/chunks/${mainAppJsPath || 'main-app-38678ce8b5ac2961.js'}"></script>
</head>`;
        
        content = content.replace('</head>', scriptsToAdd);
      }
    }
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Berhasil memperbaiki file: ${path.basename(filePath)}`);
    return true;
  } catch (error) {
    console.error(`❌ Gagal memperbaiki file ${path.basename(filePath)}: ${error.message}`);
    return false;
  }
};

// Fungsi utama
const main = () => {
  console.log('=== Mempersiapkan file HTML untuk SPA routing ===');
  
  // Cek apakah direktori output ada
  if (!fs.existsSync(outDir)) {
    console.error('❌ Direktori output tidak ditemukan!');
    console.log('Jalankan npm run build:netlify terlebih dahulu...');
    process.exit(1);
  }
  
  // Path ke file sumber dan tujuan
  const indexPath = path.join(outDir, 'index.html');
  const fallbackPath = path.join(outDir, '200.html');
  
  // Cek apakah index.html ada
  if (!fs.existsSync(indexPath)) {
    console.error('❌ File index.html tidak ditemukan di direktori output!');
    process.exit(1);
  }
  
  // 1. Perbaiki index.html
  if (!fixHtmlFile(indexPath)) {
    console.warn('⚠️ Gagal memperbaiki index.html, tapi melanjutkan proses...');
  }
  
  // 2. Salin index.html ke 200.html untuk SPA routing
  if (!copyFile(indexPath, fallbackPath)) {
    console.error('❌ Gagal membuat file 200.html untuk SPA routing');
  }
  
  console.log('✅ Selesai mempersiapkan file HTML untuk SPA routing');
};

// Eksekusi script
main(); 
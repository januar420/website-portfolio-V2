/**
 * Script untuk memperbaiki masalah hydration Next.js di Netlify
 * Menggunakan data dari build untuk memperbaiki file HTML dan JavaScript
 */

const fs = require('fs');
const path = require('path');

// Direktori output
const outDir = path.join(__dirname, '..', 'out');

// Memeriksa apakah direktori output ada
if (!fs.existsSync(outDir)) {
  console.error('❌ Direktori output tidak ditemukan!');
  console.log('Jalankan npm run build terlebih dahulu...');
  process.exit(1);
}

// Fungsi untuk memperbaiki file HTML
const fixHtmlFiles = () => {
  console.log('🔧 Memperbaiki file HTML untuk hydration...');
  
  // Daftar file HTML yang perlu diperbaiki
  const htmlFiles = [
    'index.html',
    '200.html', // SPA fallback
    '404.html',
    // Tambahkan file HTML lain jika perlu
  ];
  
  let fixedCount = 0;
  
  for (const htmlFile of htmlFiles) {
    const filePath = path.join(outDir, htmlFile);
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️ File ${htmlFile} tidak ditemukan, melewati...`);
      continue;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 1. Tambahkan script untuk memperbaiki hydration issues
    if (!content.includes('window.__NEXT_HYDRATION_DATA__')) {
      const hydrationScript = `
<script>
  // Hydration Fix untuk Next.js di Netlify
  window.__NEXT_HYDRATION_DATA__ = {
    appRouter: true,
    page: window.location.pathname,
    buildId: "static-export-${Date.now()}",
    assetPrefix: "",
    rsc: {},
    head: [], 
    dynamicIds: []
  };
  
  // Deteksi dan tangani masalah hydration
  window.__NEXT_HYDRATION_ERROR_HANDLER__ = function(error) {
    console.warn("Hydration error detected:", error.message);
    if (error.message.includes("hydration") || error.message.includes("content does not match")) {
      console.log("Attempting to recover from hydration error...");
      // Jika belum pernah refresh, lakukan sekali
      if (!sessionStorage.getItem('__NEXT_HYDRATION_RESET')) {
        sessionStorage.setItem('__NEXT_HYDRATION_RESET', '1');
        console.log("Reloading page to fix hydration...");
        window.location.reload();
      }
    }
  };
  
  // Tangkap error untuk hydration
  window.addEventListener('error', function(event) {
    if (
      event.error && 
      (event.error.message.includes('hydration') || 
       event.error.message.includes('content does not match'))
    ) {
      window.__NEXT_HYDRATION_ERROR_HANDLER__(event.error);
    }
  });
</script>
`;
      content = content.replace('</head>', hydrationScript + '</head>');
    }
    
    // 2. Pastikan ada loader untuk chunk files
    if (!content.includes('window.__NEXT_CHUNK_LOADER__')) {
      const chunksScript = `
<script>
  // Fungsi loader untuk chunk Next.js
  window.__NEXT_CHUNK_LOADER__ = function(chunkPath) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = "/_next/" + chunkPath;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };
</script>
`;
      content = content.replace('</head>', chunksScript + '</head>');
    }
    
    // 3. Simpan perubahan
    fs.writeFileSync(filePath, content);
    console.log(`✅ File ${htmlFile} berhasil diperbaiki`);
    fixedCount++;
  }
  
  console.log(`✅ Total ${fixedCount} file HTML diperbaiki untuk hydration`);
  return fixedCount > 0;
};

// Membuat atau memperbaiki file data-manifest.json
const createDataManifest = () => {
  console.log('📝 Membuat data-manifest.json...');
  
  const buildId = `static-export-${Date.now()}`;
  const manifest = {
    buildId,
    pages: {
      '/_app': {
        chunks: [],
        name: '_app',
        static: true
      },
      '/': {
        chunks: [],
        name: 'index',
        static: true
      },
      '/404': {
        chunks: [],
        name: '404',
        static: true
      }
    }
  };
  
  // Mendapatkan daftar chunks dari direktori
  const chunksDir = path.join(outDir, '_next', 'static', 'chunks');
  if (fs.existsSync(chunksDir)) {
    const chunksFiles = fs.readdirSync(chunksDir);
    manifest.chunks = chunksFiles
      .filter(file => file.endsWith('.js'))
      .map(file => file.replace(/\.js$/, ''));
  }
  
  const manifestPath = path.join(outDir, '_next', 'data-manifest.json');
  fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  
  console.log(`✅ data-manifest.json berhasil dibuat dengan buildId: ${buildId}`);
  return true;
};

// Fungsi utama
const main = () => {
  console.log('=== Memperbaiki masalah hydration Next.js di Netlify ===');
  
  let success = true;
  
  // 1. Perbaiki file HTML
  success = fixHtmlFiles() && success;
  
  // 2. Buat data manifest
  success = createDataManifest() && success;
  
  if (success) {
    console.log('✅ Semua perbaikan hydration berhasil diterapkan!');
  } else {
    console.warn('⚠️ Beberapa perbaikan hydration tidak berhasil diterapkan.');
  }
};

// Jalankan fungsi utama
main(); 
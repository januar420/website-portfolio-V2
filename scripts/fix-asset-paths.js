/**
 * Script untuk memperbaiki path aset dalam file HTML
 * 
 * Script ini akan:
 * 1. Memeriksa file HTML yang di-generate Next.js
 * 2. Memperbaiki path CSS, JavaScript, dan aset lainnya 
 * 3. Memastikan polyfill diinjeksi dengan benar
 */

const fs = require('fs');
const path = require('path');

// Helper untuk output berwarna
const colors = {
  green: (text) => `✅ ${text}`,
  red: (text) => `❌ ${text}`,
  yellow: (text) => `⚠️ ${text}`,
  blue: (text) => `🔵 ${text}`
};

// Folder output
const outDir = path.join(__dirname, '..', 'out');

// Fungsi untuk membaca dan memperbaiki file HTML
const fixHtmlFile = (filePath) => {
  if (!fs.existsSync(filePath)) {
    console.error(colors.red(`File ${filePath} tidak ditemukan!`));
    return false;
  }

  try {
    // Baca konten file
    let content = fs.readFileSync(filePath, 'utf8');

    // === 1. Perbaikan prefix path ===
    
    // Perbaiki path relatif untuk aset statis
    content = content.replace(/href="\/([^"]*?)"/g, 'href="./$1"');
    content = content.replace(/src="\/([^"]*?)"/g, 'src="./$1"');
    
    // Tapi pertahankan path absolut untuk /_next
    content = content.replace(/href="\.\/(\_next\/[^"]*?)"/g, 'href="/$1"');
    content = content.replace(/src="\.\/(\_next\/[^"]*?)"/g, 'src="/$1"');
    
    // === 2. Injeksi Promise polyfill ===
    
    // Pastikan promise polyfill ada di <head>
    if (!content.includes('promise-polyfill.js')) {
      content = content.replace('</head>', '<script src="./promise-polyfill.js"></script></head>');
      console.log(colors.green(`Berhasil menambahkan promise-polyfill ke ${path.basename(filePath)}`));
    }
    
    // === 3. Tambahkan preloading untuk performa ===
    
    // Tambahkan preload untuk CSS penting
    const cssMatches = content.match(/href="([^"]*\.css)"/g) || [];
    const uniqueCssFiles = [...new Set(cssMatches.map(match => match.match(/href="([^"]*\.css)"/)[1]))];
    
    let preloadTags = '';
    uniqueCssFiles.forEach(cssFile => {
      preloadTags += `<link rel="preload" href="${cssFile}" as="style">\n`;
    });
    
    // Tambahkan preloading sebelum </head>
    if (preloadTags) {
      content = content.replace('</head>', `${preloadTags}</head>`);
    }
    
    // === 4. Perbaiki inline script ===
    
    // Tambahkan atribut crossorigin jika perlu
    content = content.replace(/<script src="([^"]*)" defer><\/script>/g, 
                             '<script src="$1" defer crossorigin="anonymous"></script>');
    
    // === 5. Tambahkan loader fallback jika fetch gagal ===
    
    // Perbaiki konten dan simpan
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(colors.green(`Berhasil memperbaiki ${path.basename(filePath)}`));
    return true;
  } catch (error) {
    console.error(colors.red(`Gagal memperbaiki ${path.basename(filePath)}: ${error.message}`));
    return false;
  }
};

// Fungsi untuk membuat file fallback loader
const createFallbackLoader = () => {
  const fallbackLoaderPath = path.join(outDir, 'asset-loader-fallback.js');
  const fallbackContent = `
/**
 * Fallback loader untuk mengatasi masalah saat loading aset gagal
 */
(function() {
  // Helper untuk mencoba load script dengan beberapa alternatif
  function tryLoadScript(src, retries = 3) {
    return new Promise((resolve, reject) => {
      let attempt = 0;
      function attemptLoad() {
        attempt++;
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve(true);
        script.onerror = () => {
          if (attempt < retries) {
            console.warn(\`Failed to load \${src}, retrying (\${attempt}/\${retries})...\`);
            setTimeout(attemptLoad, 1000);
          } else {
            console.error(\`Failed to load \${src} after \${retries} attempts\`);
            reject(new Error(\`Failed to load \${src}\`));
          }
        };
        document.head.appendChild(script);
      }
      attemptLoad();
    });
  }

  // Helper untuk memuat CSS
  function loadCSS(href) {
    return new Promise((resolve) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.onload = () => resolve(true);
      link.onerror = () => {
        console.warn(\`Failed to load CSS: \${href}, using alternative method\`);
        
        // Coba cara alternatif dengan fetch
        fetch(href)
          .then(response => response.text())
          .then(css => {
            const style = document.createElement('style');
            style.textContent = css;
            document.head.appendChild(style);
            resolve(true);
          })
          .catch(() => {
            console.error(\`Could not load \${href} through any method\`);
            resolve(false);
          });
      };
      document.head.appendChild(link);
    });
  }

  // Cek kesehatan koneksi ke aset
  function checkAssetHealth() {
    // Daftar aset penting
    const criticalAssets = document.querySelectorAll('script[src], link[href][rel="stylesheet"]');
    
    // Untuk setiap aset, coba periksa
    criticalAssets.forEach(asset => {
      const url = asset.src || asset.href;
      if (!url) return;
      
      fetch(url, { method: 'HEAD' })
        .catch(() => {
          console.warn(\`Failed to load asset: \${url}, attempting recovery\`);
          
          // Jika script, coba load ulang
          if (asset.tagName === 'SCRIPT') {
            tryLoadScript(url);
          } 
          // Jika CSS, coba load ulang
          else if (asset.tagName === 'LINK' && asset.rel === 'stylesheet') {
            loadCSS(url);
          }
        });
    });
  }

  // Jalankan pemeriksaan ketika halaman dimuat
  window.addEventListener('DOMContentLoaded', checkAssetHealth);
})();
`;

  try {
    fs.writeFileSync(fallbackLoaderPath, fallbackContent, 'utf8');
    console.log(colors.green('Berhasil membuat asset-loader-fallback.js'));
    return true;
  } catch (error) {
    console.error(colors.red(`Gagal membuat asset-loader-fallback.js: ${error.message}`));
    return false;
  }
};

// Fungsi utama untuk memperbaiki semua file HTML
const main = () => {
  console.log(colors.blue('=== Memperbaiki Path Aset di File HTML ==='));
  
  if (!fs.existsSync(outDir)) {
    console.error(colors.red(`Folder output '${outDir}' tidak ditemukan!`));
    console.log(colors.yellow('Jalankan build terlebih dahulu: npm run build:netlify'));
    return false;
  }
  
  // Buat fallback loader
  createFallbackLoader();
  
  // Temukan semua file HTML
  const htmlFiles = [];
  const readDirRecursive = (dir) => {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        readDirRecursive(filePath);
      } else if (path.extname(file) === '.html') {
        htmlFiles.push(filePath);
      }
    });
  };
  
  readDirRecursive(outDir);
  console.log(colors.blue(`Ditemukan ${htmlFiles.length} file HTML untuk diperbaiki`));
  
  // Perbaiki semua file HTML
  const results = htmlFiles.map(fixHtmlFile);
  const success = results.every(result => result);
  
  if (success) {
    console.log(colors.green('\n✅ Semua file HTML berhasil diperbaiki!'));
    
    // Tambahkan fallback loader ke index.html
    const indexHtmlPath = path.join(outDir, 'index.html');
    if (fs.existsSync(indexHtmlPath)) {
      let indexContent = fs.readFileSync(indexHtmlPath, 'utf8');
      if (!indexContent.includes('asset-loader-fallback.js')) {
        indexContent = indexContent.replace('</body>', '<script src="./asset-loader-fallback.js"></script></body>');
        fs.writeFileSync(indexHtmlPath, indexContent, 'utf8');
        console.log(colors.green('Berhasil menambahkan fallback loader ke index.html'));
      }
    }
  } else {
    console.error(colors.red('\n❌ Beberapa file HTML gagal diperbaiki!'));
  }
  
  return success;
};

// Jalankan
main(); 
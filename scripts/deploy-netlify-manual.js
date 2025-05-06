/**
 * Script untuk melakukan deploy manual ke Netlify dengan error handling lebih baik
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Direktori output
const outDir = path.join(__dirname, '..', 'out');

// Dapatkan Site ID dari file state.json atau dari parameter CLI
const getNetlifySiteId = () => {
  try {
    // Coba baca dari state.json
    const stateFilePath = path.join(__dirname, '..', '.netlify', 'state.json');
    if (fs.existsSync(stateFilePath)) {
      const stateContent = fs.readFileSync(stateFilePath, 'utf8');
      const stateData = JSON.parse(stateContent);
      if (stateData && stateData.siteId) {
        return stateData.siteId;
      }
    }
    
    // Coba baca dari netlify.toml
    const tomlPath = path.join(__dirname, '..', 'netlify.toml');
    if (fs.existsSync(tomlPath)) {
      const tomlContent = fs.readFileSync(tomlPath, 'utf8');
      const siteIdMatch = tomlContent.match(/ID\s*=\s*"([^"]+)"/);
      if (siteIdMatch && siteIdMatch[1]) {
        return siteIdMatch[1];
      }
    }
    
    // Default ID jika tidak ditemukan
    return "02a6fa83-7aa8-4d12-9d14-db7279b92914";
  } catch (error) {
    console.error('Error mendapatkan Netlify Site ID:', error);
    return "02a6fa83-7aa8-4d12-9d14-db7279b92914";
  }
};

// Verifikasi direktori output
const checkOutputDirectory = () => {
  if (!fs.existsSync(outDir)) {
    console.error('❌ Direktori output tidak ditemukan!');
    console.log('Jalankan npm run fix-netlify terlebih dahulu...');
    return false;
  }
  
  // Verifikasi file utama
  const requiredFiles = ['index.html', '_redirects', 'pdf.worker.min.js'];
  const missingFiles = requiredFiles.filter(file => !fs.existsSync(path.join(outDir, file)));
  
  if (missingFiles.length > 0) {
    console.error(`❌ File penting tidak ditemukan di direktori output: ${missingFiles.join(', ')}`);
    console.log('Jalankan npm run fix-netlify terlebih dahulu...');
    return false;
  }
  
  return true;
};

// Pastikan file index.html memiliki script yang diperlukan
const fixIndexHtml = () => {
  try {
    const indexPath = path.join(outDir, 'index.html');
    let indexContent = fs.readFileSync(indexPath, 'utf8');
    
    // Cek apakah script next-patch.js sudah ada
    if (!indexContent.includes('next-patch.js')) {
      console.log('⚒️ Menambahkan next-patch.js ke index.html...');
      indexContent = indexContent.replace(
        '<script src="/promise-polyfill.js"></script>',
        '<script src="/promise-polyfill.js"></script>\n<script src="/next-patch.js"></script>'
      );
    }
    
    // Pastikan script app/layout dan app/page ada
    if (!indexContent.includes('app/page')) {
      console.log('⚒️ Menambahkan script App ke index.html...');
      const scriptInsertionPoint = '</head>';
      const appScripts = `
<!-- Script App -->
<script src="/_next/static/chunks/app/layout-0efd3b8d8b4e1d38.js"></script>
<script src="/_next/static/chunks/app/page-81d4eab59fcc134e.js"></script>
<script src="/_next/static/chunks/main-app-38678ce8b5ac2961.js"></script>
</head>`;
      
      indexContent = indexContent.replace(scriptInsertionPoint, appScripts);
    }
    
    fs.writeFileSync(indexPath, indexContent);
    console.log('✅ index.html diperbaiki');
    return true;
  } catch (error) {
    console.error('❌ Error saat memperbaiki index.html:', error);
    return false;
  }
};

// Jalankan deployment
const runDeployment = (siteId) => {
  try {
    console.log('🚀 Memulai deployment ke Netlify...');
    
    const deployCommand = `npx netlify deploy --prod --dir=out --site=${siteId}`;
    console.log(`Menjalankan: ${deployCommand}`);
    
    // Jalankan perintah deployment
    execSync(deployCommand, { stdio: 'inherit' });
    
    console.log('\n✅ Deployment berhasil!');
    return true;
  } catch (error) {
    console.error('❌ Error saat deployment:', error.message);
    
    // Mencoba fallback dengan perintah sederhana
    try {
      console.log('\n⚠️ Mencoba dengan perintah alternatif...');
      execSync(`npx netlify deploy --prod --dir=out`, { stdio: 'inherit' });
      console.log('\n✅ Deployment berhasil dengan metode alternatif!');
      return true;
    } catch (fallbackError) {
      console.error('❌ Deployment gagal dengan semua metode:', fallbackError.message);
      
      // Saran untuk pengguna
      console.log('\n💡 Saran:');
      console.log('1. Coba login ulang: npx netlify login');
      console.log('2. Inisialisasi ulang: npx netlify init');
      console.log('3. Deploy manual melalui dashboard Netlify dengan folder "out"');
      
      return false;
    }
  }
};

// Fungsi utama
const main = () => {
  console.log('=== Deploy Manual ke Netlify ===');
  
  // Verifikasi direktori output
  if (!checkOutputDirectory()) {
    process.exit(1);
  }
  
  // Perbaiki index.html
  if (!fixIndexHtml()) {
    console.log('⚠️ Lanjut meskipun ada masalah dengan index.html...');
  }
  
  // Dapatkan Netlify Site ID
  const siteId = getNetlifySiteId();
  console.log(`Menggunakan Netlify Site ID: ${siteId}`);
  
  // Jalankan deployment
  if (!runDeployment(siteId)) {
    process.exit(1);
  }
};

// Mulai eksekusi
main(); 
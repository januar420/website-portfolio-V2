#!/usr/bin/env node

/**
 * Script optimasi loading yang dijalankan setelah build
 * Script ini melakukan beberapa optimasi untuk mempercepat waktu inisialisasi aplikasi
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Menjalankan optimasi loading setelah build...');

// Mendapatkan direktori output build
const buildDir = path.resolve(process.cwd(), '.next');
const staticDir = path.resolve(buildDir, 'static');

// Memeriksa apakah direktori build tersedia
if (!fs.existsSync(buildDir)) {
  console.error('❌ Direktori build (.next) tidak ditemukan! Pastikan build telah dijalankan.');
  process.exit(1);
}

// Fungsi untuk menambahkan kode preload pada HTML
function injectPreload() {
  try {
    // Tambahkan preloading ke file HTML yang terbuat
    const serverDir = path.resolve(buildDir, 'server');
    const htmlFiles = findHtmlFiles(serverDir);
    
    console.log(`📝 Menemukan ${htmlFiles.length} file HTML untuk dioptimasi`);
    
    let modifiedCount = 0;
    
    htmlFiles.forEach(filePath => {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Tambahkan preload untuk JS utama dan 3D assets
      if (!content.includes('rel="preload" as="script" href="/models/')) {
        const preloadTags = `
    <!-- Preload optimization -->
    <link rel="preload" as="script" href="/_next/static/chunks/main.js" />
    <link rel="preload" as="fetch" href="/models/scene.gltf" crossorigin="anonymous" />`;
        
        // Sisipkan tag sebelum penutup </head>
        content = content.replace('</head>', `${preloadTags}\n</head>`);
        
        fs.writeFileSync(filePath, content);
        modifiedCount++;
      }
    });
    
    console.log(`✅ Berhasil mengoptimasi ${modifiedCount} file HTML`);
  } catch (error) {
    console.error('❌ Gagal menginjeksi preload:', error);
  }
}

// Fungsi rekursif untuk menemukan semua file HTML
function findHtmlFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findHtmlFiles(filePath, fileList);
    } else if (file.endsWith('.html')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Jalankan berbagai optimasi
injectPreload();

console.log('✨ Optimasi loading selesai!'); 
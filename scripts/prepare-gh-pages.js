/**
 * Script untuk mempersiapkan deployment ke GitHub Pages
 * - Menambahkan file .nojekyll untuk memungkinkan file dengan underscore (_next)
 * - Menyalin file index.html ke 404.html untuk routing Client-side 
 */

const fs = require('fs');
const path = require('path');

// Path ke direktori output
const outputDir = path.join(process.cwd(), 'out');

// Fungsi untuk membuat file .nojekyll
function createNojekyllFile() {
  const filePath = path.join(outputDir, '.nojekyll');
  fs.writeFileSync(filePath, '');
  console.log('✅ File .nojekyll dibuat');
}

// Fungsi untuk menyalin index.html ke 404.html
function copyIndexTo404() {
  const indexPath = path.join(outputDir, 'index.html');
  const notFoundPath = path.join(outputDir, '404.html');
  
  if (fs.existsSync(indexPath)) {
    fs.copyFileSync(indexPath, notFoundPath);
    console.log('✅ index.html disalin ke 404.html');
  } else {
    console.error('❌ index.html tidak ditemukan');
    process.exit(1);
  }
}

// Fungsi untuk membuat file CNAME jika ingin menggunakan custom domain
// Uncomment dan sesuaikan domain jika diperlukan
function createCnameFile() {
  // Jika Anda memiliki custom domain, uncomment dan ganti domain di bawah
  // const filePath = path.join(outputDir, 'CNAME');
  // fs.writeFileSync(filePath, 'yourdomain.com');
  // console.log('✅ File CNAME dibuat dengan domain: yourdomain.com');
  
  console.log('ℹ️ File CNAME tidak dibuat. Uncomment fungsi di prepare-gh-pages.js jika Anda ingin menggunakan custom domain.');
}

// Eksekusi fungsi utama
function main() {
  console.log('🔍 Mempersiapkan output untuk GitHub Pages...');
  
  // Pastikan direktori output ada
  if (!fs.existsSync(outputDir)) {
    console.error('❌ Direktori "out" tidak ditemukan. Jalankan "next build && next export" terlebih dahulu.');
    process.exit(1);
  }
  
  // Jalankan fungsi-fungsi
  createNojekyllFile();
  copyIndexTo404();
  createCnameFile();  // Uncomment jika Anda ingin membuat file CNAME
  
  console.log('✨ Persiapan untuk GitHub Pages selesai!');
}

// Jalankan fungsi utama
main(); 
/**
 * CATATAN: FILE INI HANYA UNTUK DEPLOYMENT GITHUB PAGES!
 * =====================================================
 * Script ini hanya diperlukan jika Anda mendeploy ke GitHub Pages.
 * Jika Anda mendeploy ke platform lain (Netlify, Vercel, dll), file ini tidak diperlukan.
 * 
 * ==== GITHUB_PAGES_ONLY ====
 * 
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
function createCnameFile() {
  // Menonaktifkan pembuatan CNAME untuk menggunakan domain GitHub Pages default
  console.log('ℹ️ File CNAME tidak dibuat. Menggunakan domain GitHub Pages default: januar420.github.io/website-portfolio-v2');
  
  // Hapus file CNAME jika sudah ada (dari deployment sebelumnya)
  const filePath = path.join(outputDir, 'CNAME');
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log('✅ File CNAME dihapus dari deployment sebelumnya');
  }
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
  createCnameFile();  // Tetap memanggil fungsi ini tetapi sekarang akan menonaktifkan CNAME
  
  console.log('✨ Persiapan untuk GitHub Pages selesai!');
}

// Jalankan fungsi utama
main(); 
/**
 * Script untuk inisialisasi situs Netlify
 * 
 * Script ini akan:
 * 1. Memeriksa apakah CLI Netlify sudah terinstal
 * 2. Membantu pengguna menghubungkan repositori dengan Netlify
 * 3. Memberikan panduan untuk otentikasi manual jika CLI gagal
 */

const fs = require('fs');
const path = require('path');
const { execSync, exec } = require('child_process');

// Helper untuk output berwarna
const colors = {
  green: (text) => `✅ ${text}`,
  red: (text) => `❌ ${text}`,
  yellow: (text) => `⚠️ ${text}`,
  blue: (text) => `🔵 ${text}`
};

// Fungsi untuk menjalankan perintah shell
const runCommand = (command) => {
  try {
    return { success: true, output: execSync(command, { encoding: 'utf8' }) };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Fungsi untuk memeriksa apakah Netlify CLI sudah terinstal
const checkNetlifyCLI = () => {
  const result = runCommand('npx netlify --version');
  if (!result.success) {
    console.log(colors.yellow('Netlify CLI belum terinstal, menginstal...'));
    const installResult = runCommand('npm install -g netlify-cli');
    if (!installResult.success) {
      console.error(colors.red('Gagal menginstal Netlify CLI:'));
      console.error(installResult.error);
      return false;
    }
    console.log(colors.green('Netlify CLI berhasil diinstal!'));
  } else {
    console.log(colors.green(`Netlify CLI terdeteksi: ${result.output.trim()}`));
  }
  return true;
};

// Fungsi untuk memeriksa status login Netlify
const checkNetlifyLogin = () => {
  const result = runCommand('npx netlify status');
  if (!result.success || result.output.includes('You need to log in')) {
    console.log(colors.yellow('Anda belum login ke Netlify, mencoba login...'));
    console.log(colors.blue('Browser akan terbuka untuk melakukan otentikasi. Silakan selesaikan proses login.'));
    
    // Menampilkan instruksi untuk login manual jika login otomatis gagal
    console.log(colors.yellow('\nJika browser tidak terbuka atau otentikasi gagal, ikuti langkah-langkah berikut:'));
    console.log('1. Buka Command Prompt');
    console.log('2. Ketikkan perintah: npx netlify login');
    console.log('3. Ikuti instruksi di layar untuk menyelesaikan otentikasi\n');
    
    // Coba login dengan Netlify CLI
    const loginResult = runCommand('npx netlify login');
    if (!loginResult.success) {
      console.error(colors.red('Gagal login ke Netlify:'));
      console.error(loginResult.error);
      return false;
    }
    console.log(colors.green('Berhasil login ke Netlify!'));
  } else {
    console.log(colors.green('Sudah login ke Netlify!'));
  }
  return true;
};

// Fungsi untuk membuat situs baru di Netlify
const createNetlifySite = () => {
  console.log(colors.blue('Memeriksa situs Netlify yang ada...'));
  
  // Mencoba mendapatkan situs ID dari netlify.toml jika ada
  let siteId = null;
  const netlifyTomlPath = path.join(__dirname, '..', 'netlify.toml');
  if (fs.existsSync(netlifyTomlPath)) {
    const netlifyToml = fs.readFileSync(netlifyTomlPath, 'utf8');
    const siteIdMatch = netlifyToml.match(/site_id\s*=\s*"([^"]+)"/);
    if (siteIdMatch && siteIdMatch[1]) {
      siteId = siteIdMatch[1];
      console.log(colors.green(`Ditemukan Site ID di netlify.toml: ${siteId}`));
    }
  }
  
  // Memeriksa situs yang sudah terhubung
  const siteResult = runCommand('npx netlify sites:list --json');
  if (!siteResult.success) {
    console.error(colors.red('Gagal mendapatkan daftar situs Netlify:'));
    console.error(siteResult.error);
    
    console.log(colors.yellow('\nUntuk membuat situs baru, ikuti langkah-langkah berikut:'));
    console.log('1. Buka browser dan login ke https://app.netlify.com');
    console.log('2. Klik "Add new site" > "Import an existing project"');
    console.log('3. Pilih "Deploy manually"');
    console.log('4. Unggah folder "out" dari proyek Anda');
    return false;
  }
  
  // Jika tidak ada situs yang ditemukan, buat situs baru
  let sites = [];
  try {
    sites = JSON.parse(siteResult.output);
  } catch (error) {
    console.error(colors.red('Gagal mengurai data situs:'));
    console.error(error.message);
  }
  
  if (sites.length === 0) {
    console.log(colors.yellow('Tidak ditemukan situs Netlify yang terhubung, membuat situs baru...'));
    
    console.log(colors.blue('\nUntuk membuat situs baru, ikuti langkah-langkah berikut:'));
    console.log('1. Jalankan perintah: npx netlify sites:create');
    console.log('2. Pilih team dan nama situs');
    console.log('3. Setelah situs dibuat, jalankan: npx netlify link');
    console.log('4. Setelah itu jalankan: npm run deploy:netlify\n');
    
    console.log(colors.yellow('JIKA PERINTAH INTERAKTIF TIDAK BERFUNGSI:'));
    console.log('1. Buka browser dan login ke https://app.netlify.com');
    console.log('2. Buat situs baru secara manual');
    console.log('3. Catat site ID yang diberikan');
    console.log('4. Jalankan: npx netlify link --id SITE_ID_ANDA');
    console.log('5. Lalu jalankan: npm run deploy:netlify\n');
    
    return false;
  } else {
    console.log(colors.green(`Ditemukan ${sites.length} situs Netlify yang terhubung dengan akun Anda.`));
    console.log('Sites:');
    sites.forEach((site, index) => {
      console.log(`${index + 1}. ${site.name} (${site.url})`);
      if (site.id === siteId) {
        console.log(colors.green(`   ↳ Ini adalah situs aktif di netlify.toml`));
      }
    });
    
    if (!siteId && sites.length > 0) {
      console.log(colors.blue('\nUntuk menghubungkan ke situs yang ada, jalankan:'));
      console.log(`npx netlify link --id SITE_ID_ANDA`);
    }
    
    console.log(colors.blue('\nJika Anda ingin menambahkan site_id ke netlify.toml:'));
    console.log('1. Buka file netlify.toml');
    console.log('2. Tambahkan baris berikut di bawah [build]:');
    console.log('   site_id = "SITE_ID_ANDA"');
  }
  
  return true;
};

// Fungsi utama
const main = async () => {
  console.log(colors.green('=== Inisialisasi Situs Netlify ==='));
  
  const cliInstalled = checkNetlifyCLI();
  if (!cliInstalled) {
    return;
  }
  
  const loggedIn = checkNetlifyLogin();
  if (!loggedIn) {
    return;
  }
  
  // Membuat atau menghubungkan ke situs Netlify
  createNetlifySite();
  
  console.log(colors.green('\n=== Inisialisasi selesai ==='));
  console.log(colors.blue('Setelah menghubungkan ke situs, jalankan perintah berikut untuk deploy:'));
  console.log('npm run fix-netlify && npx netlify deploy --prod --dir=out');
};

// Jalankan fungsi utama
main().catch(error => {
  console.error(colors.red('Terjadi kesalahan saat inisialisasi Netlify:'));
  console.error(error);
}); 
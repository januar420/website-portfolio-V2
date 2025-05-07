/**
 * Script untuk mengatur token Netlify secara lokal
 * Jalankan: node scripts/setup-netlify-token.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Token yang diberikan
const NETLIFY_AUTH_TOKEN = 'nfp_MtmuQHpogJ98Znrmqj8koXVA4Bko9MCgaaf4';

console.log('🔑 Mengatur NETLIFY_AUTH_TOKEN untuk penggunaan lokal...');

// Cek apakah Netlify CLI sudah terinstall
try {
  console.log('Memeriksa instalasi Netlify CLI...');
  execSync('netlify --version', { stdio: 'pipe' });
  console.log('✅ Netlify CLI terinstall');
} catch (error) {
  console.log('⚠️ Netlify CLI belum terinstall. Menginstall...');
  try {
    execSync('npm install -g netlify-cli', { stdio: 'inherit' });
    console.log('✅ Netlify CLI berhasil diinstall');
  } catch (installError) {
    console.error('❌ Gagal menginstall Netlify CLI:', installError.message);
    process.exit(1);
  }
}

// Membuat folder .netlify jika belum ada
const netlifyConfigDir = path.join(process.env.HOME || process.env.USERPROFILE, '.netlify');
if (!fs.existsSync(netlifyConfigDir)) {
  fs.mkdirSync(netlifyConfigDir, { recursive: true });
}

// Menyimpan token secara manual ke file konfigurasi
console.log('Menyimpan token Netlify ke file konfigurasi...');
try {
  // Tulis ke file auth-token
  fs.writeFileSync(path.join(netlifyConfigDir, 'config.json'), JSON.stringify({
    userId: "netlify-user",
    users: {
      "netlify-user": {
        auth: {
          token: NETLIFY_AUTH_TOKEN
        }
      }
    }
  }, null, 2));
  
  console.log('✅ Token Netlify berhasil dikonfigurasi');
  
  // Mencoba mendapatkan info akun untuk verifikasi
  console.log('Memverifikasi token...');
  try {
    const accountInfo = execSync('netlify api getCurrentUser', { encoding: 'utf8' });
    console.log('✅ Token valid! Login berhasil.');
    
    const accountData = JSON.parse(accountInfo);
    console.log(`🔵 Login sebagai: ${accountData.full_name || accountData.email}`);
    
    // Mendapatkan dan menampilkan daftar situs
    console.log('\n📋 Daftar situs Netlify tersedia:');
    const sites = JSON.parse(execSync('netlify api listSites', { encoding: 'utf8' }));
    
    if (sites && sites.length > 0) {
      sites.forEach((site, index) => {
        console.log(`${index + 1}. ${site.name} (${site.url})`);
        console.log(`   ID: ${site.id}`);
        console.log(`   Tambahkan ID ini ke NETLIFY_SITE_ID di GitHub secrets\n`);
      });
    } else {
      console.log('Tidak ada situs yang ditemukan di akun Anda.');
    }
  } catch (apiError) {
    console.error('❌ Gagal memverifikasi token:', apiError.message);
    console.log('Anda mungkin perlu menjalankan perintah berikut secara manual:');
    console.log(`netlify login`);
  }
  
  console.log('\n✅ Setup selesai. Anda sekarang dapat menjalankan:');
  console.log('   npm run deploy:netlify');
  
} catch (error) {
  console.error('❌ Gagal mengatur token Netlify:', error.message);
  process.exit(1);
} 
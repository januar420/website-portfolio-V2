/**
 * Script untuk membuat situs Netlify baru
 * Jalankan: node scripts/create-netlify-site.js
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 Membuat situs Netlify baru');
console.log('===========================');

// Cek apakah sudah login ke Netlify
try {
  console.log('Memeriksa status login Netlify...');
  const userInfo = JSON.parse(execSync('netlify api getCurrentUser', { encoding: 'utf8' }));
  console.log(`✅ Login sebagai: ${userInfo.full_name || userInfo.email}`);
} catch (error) {
  console.error('❌ Anda belum login ke Netlify. Jalankan script setup terlebih dahulu:');
  console.error('   npm run setup-netlify');
  process.exit(1);
}

// Fungsi bantuan untuk prompt di terminal
function askQuestion(query) {
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      resolve(answer);
    });
  });
}

// Meminta input untuk nama situs
async function main() {
  try {
    // Mendapatkan nama default dari package.json
    const packageJsonPath = path.join(__dirname, '..', 'package.json');
    const packageData = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const defaultName = packageData.name.replace(/[^a-zA-Z0-9]/g, '-');
    
    // Meminta konfirmasi nama situs
    const siteName = await askQuestion(`Nama situs Netlify [${defaultName}]: `);
    const finalSiteName = siteName.trim() || defaultName;
    
    console.log(`\nMembuat situs "${finalSiteName}"...`);
    
    // Membuat situs baru menggunakan Netlify API dengan format JSON yang benar
    const siteConfig = JSON.stringify({ name: finalSiteName, ssl: true });
    // Untuk Windows, gunakan tanda kutip ganda di luar dan gunakan writeFileSync/tempFile
    const tempDataFile = path.join(__dirname, 'temp-site-config.json');
    fs.writeFileSync(tempDataFile, siteConfig);
    
    const createSiteCommand = `netlify api createSite --data-file "${tempDataFile}"`;
    const siteData = JSON.parse(execSync(createSiteCommand, { encoding: 'utf8' }));
    
    console.log('\n✅ Situs berhasil dibuat!');
    console.log(`🌐 URL: ${siteData.ssl_url || siteData.url}`);
    console.log(`🔑 Site ID: ${siteData.id}`);
    
    // Simpan site ID untuk penggunaan berikutnya
    fs.writeFileSync(
      path.join(__dirname, '..', '.netlify', 'site-id'),
      siteData.id
    );
    
    console.log('\n📋 Informasi situs telah disimpan di .netlify/site-id');
    
    // Menyarankan untuk mengatur GitHub secret
    console.log('\n📝 Penting: Tambahkan Site ID ke GitHub secrets:');
    console.log('1. Buka repositori GitHub Anda di browser');
    console.log('2. Buka Settings -> Secrets and variables -> Actions');
    console.log('3. Klik "New repository secret"');
    console.log('4. Tambahkan secret:');
    console.log(`   - Nama: NETLIFY_SITE_ID`);
    console.log(`   - Nilai: ${siteData.id}`);
    
    // Alternatif: menggunakan GitHub CLI untuk mengatur secret
    const useGhCli = await askQuestion('\nApakah ingin mengatur GitHub secret sekarang menggunakan GitHub CLI? (y/n): ');
    
    if (useGhCli.toLowerCase() === 'y') {
      try {
        execSync('gh --version', { stdio: 'pipe' });
        console.log('\nMengatur GitHub secret NETLIFY_SITE_ID...');
        execSync(`echo "${siteData.id}" | gh secret set NETLIFY_SITE_ID`, { stdio: 'inherit' });
        console.log('✅ Secret NETLIFY_SITE_ID berhasil ditambahkan ke GitHub repository');
      } catch (ghError) {
        console.error('❌ Gagal mengatur GitHub secret:', ghError.message);
        console.log('Silakan atur secret secara manual menggunakan langkah di atas.');
      }
    }
    
    console.log('\n🎉 Setup situs Netlify selesai!');
    console.log('Anda sekarang dapat menjalankan:');
    console.log('npm run deploy:netlify');
  } catch (error) {
    console.error('❌ Gagal membuat situs Netlify:', error.message);
    process.exit(1);
  } finally {
    // Membersihkan file temporary
    const tempDataFile = path.join(__dirname, 'temp-site-config.json');
    if (fs.existsSync(tempDataFile)) {
      fs.unlinkSync(tempDataFile);
    }
    rl.close();
  }
}

main(); 
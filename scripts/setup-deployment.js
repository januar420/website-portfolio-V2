/**
 * Script untuk menjalankan seluruh proses konfigurasi deployment
 * Jalankan: node scripts/setup-deployment.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setup Deployment Website Portfolio');
console.log('====================================');

// Token Netlify yang sudah diberikan
const NETLIFY_AUTH_TOKEN = 'nfp_MtmuQHpogJ98Znrmqj8koXVA4Bko9MCgaaf4';

// Fungsi untuk menjalankan script dengan penanganan error
function runScript(scriptPath, description) {
  console.log(`\n📋 ${description}...`);
  try {
    execSync(`node ${scriptPath}`, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`❌ Gagal menjalankan ${scriptPath}: ${error.message}`);
    return false;
  }
}

// Langkah 1: Update konfigurasi Netlify
const netlifyConfigSuccess = runScript(
  path.join(__dirname, 'update-netlify-config.js'),
  'Memperbarui konfigurasi Netlify'
);

// Langkah 2: Setup token Netlify
if (netlifyConfigSuccess) {
  const netlifyTokenSuccess = runScript(
    path.join(__dirname, 'setup-netlify-token.js'),
    'Mengatur token Netlify dan mendapatkan ID situs'
  );

  // Langkah 3: Setup GitHub secrets
  if (netlifyTokenSuccess) {
    console.log('\n⚠️ Catatan: Untuk mengatur GitHub Secrets, Anda memerlukan GitHub CLI yang terinstall dan login.');
    console.log('   Jika tidak ingin menggunakan GitHub CLI, Anda dapat mengatur secrets secara manual di repositori GitHub.\n');
    
    const response = askQuestion('Apakah Anda ingin mencoba setup GitHub secrets sekarang? (y/n) ');
    
    if (response.toLowerCase() === 'y') {
      runScript(
        path.join(__dirname, 'setup-github-secrets.js'),
        'Mengatur GitHub secrets'
      );
    } else {
      console.log('\n📝 Petunjuk untuk setup GitHub secrets manual:');
      console.log('1. Buka repositori GitHub Anda di browser');
      console.log('2. Buka Settings -> Secrets and variables -> Actions');
      console.log('3. Klik "New repository secret"');
      console.log('4. Tambahkan secret berikut:');
      console.log(`   - Nama: NETLIFY_AUTH_TOKEN`);
      console.log(`   - Nilai: ${NETLIFY_AUTH_TOKEN}`);
      console.log('5. Tambahkan secret NETLIFY_SITE_ID dengan nilai ID situs Netlify Anda');
    }
  }
}

console.log('\n🎉 Proses setup selesai!');
console.log('Selanjutnya, Anda dapat menjalankan:');
console.log('npm run deploy:netlify');

// Fungsi bantuan untuk prompt di terminal
function askQuestion(query) {
  const { execSync } = require('child_process');
  const readline = require('readline');
  
  process.stdout.write(query);
  const result = execSync('cmd /c "set /p response="<con', { stdio: [process.stdin, 'pipe', process.stderr] }).toString().trim();
  process.stdout.write('\n');
  
  return result;
} 
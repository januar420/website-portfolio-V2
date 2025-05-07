/**
 * Script untuk mengatur GitHub Actions secrets
 * Membutuhkan GitHub CLI (gh) yang terinstall dan login
 * Jalankan: node scripts/setup-github-secrets.js
 */

const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Token Netlify yang sudah diberikan
const NETLIFY_AUTH_TOKEN = 'nfp_MtmuQHpogJ98Znrmqj8koXVA4Bko9MCgaaf4';

console.log('🔧 Setup GitHub Actions Secrets untuk Website Portfolio');
console.log('=====================================================');

// Cek GitHub CLI
try {
  console.log('Memeriksa GitHub CLI...');
  execSync('gh --version', { stdio: 'pipe' });
  console.log('✅ GitHub CLI terinstall\n');
} catch (error) {
  console.error('❌ GitHub CLI tidak terinstall. Silakan install dengan perintah:');
  console.error('   npm install -g gh');
  console.error('   atau kunjungi: https://cli.github.com/');
  process.exit(1);
}

// Cek login status
try {
  const statusOutput = execSync('gh auth status', { stdio: 'pipe', encoding: 'utf8' });
  console.log('✅ GitHub CLI sudah login\n');
} catch (error) {
  console.error('❌ Anda belum login ke GitHub CLI. Silakan login dengan perintah:');
  console.error('   gh auth login');
  process.exit(1);
}

// Mendapatkan repo saat ini
let repoInfo;
try {
  repoInfo = execSync('gh repo view --json owner,name', { encoding: 'utf8' });
  repoInfo = JSON.parse(repoInfo);
  console.log(`📂 Repo: ${repoInfo.owner}/${repoInfo.name}\n`);
} catch (error) {
  console.error('❌ Gagal mendapatkan info repo. Pastikan Anda berada di direktori repo GitHub.');
  process.exit(1);
}

console.log('Menyiapkan secrets untuk GitHub Actions...\n');

// Fungsi untuk set secret
async function setSecret(name, value) {
  try {
    execSync(`echo "${value}" | gh secret set ${name}`, { stdio: 'pipe' });
    console.log(`✅ Secret ${name} berhasil diatur`);
    return true;
  } catch (error) {
    console.error(`❌ Gagal mengatur secret ${name}: ${error.message}`);
    return false;
  }
}

// Mengatur NETLIFY_AUTH_TOKEN
console.log('Mengatur NETLIFY_AUTH_TOKEN...');
setSecret('NETLIFY_AUTH_TOKEN', NETLIFY_AUTH_TOKEN);

// Meminta NETLIFY_SITE_ID
console.log('\nUntuk mendapatkan NETLIFY_SITE_ID, jalankan terlebih dahulu:');
console.log('node scripts/setup-netlify-token.js');

rl.question('\nMasukkan NETLIFY_SITE_ID Anda (kosongkan untuk melewati): ', async (siteId) => {
  if (siteId && siteId.trim()) {
    await setSecret('NETLIFY_SITE_ID', siteId.trim());
  } else {
    console.log('⚠️ NETLIFY_SITE_ID dilewati');
  }
  
  // Email.js secrets (opsional)
  console.log('\nApakah Anda ingin mengatur EmailJS secrets? (y/n)');
  rl.question('> ', async (answer) => {
    if (answer.toLowerCase() === 'y') {
      rl.question('EMAILJS_SERVICE_ID: ', async (serviceId) => {
        if (serviceId) await setSecret('EMAILJS_SERVICE_ID', serviceId);
        
        rl.question('EMAILJS_TEMPLATE_ID: ', async (templateId) => {
          if (templateId) await setSecret('EMAILJS_TEMPLATE_ID', templateId);
          
          rl.question('EMAILJS_USER_ID: ', async (userId) => {
            if (userId) await setSecret('EMAILJS_USER_ID', userId);
            finish();
          });
        });
      });
    } else {
      finish();
    }
  });
});

function finish() {
  console.log('\n✅ Setup GitHub Actions secrets selesai!');
  console.log('Sekarang Anda dapat melakukan push ke GitHub untuk menjalankan workflow GitHub Actions.');
  rl.close();
} 
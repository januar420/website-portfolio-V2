/**
 * Script untuk memperbarui konfigurasi GitHub Actions workflow
 * Jalankan: node scripts/update-github-workflow.js
 */

const fs = require('fs');
const path = require('path');

console.log('🛠️ Memperbarui konfigurasi GitHub Actions...');

// Netlify Site ID
const siteIdFile = path.join(__dirname, '..', '.netlify', 'site-id');
let siteId = '';

if (fs.existsSync(siteIdFile)) {
  siteId = fs.readFileSync(siteIdFile, 'utf8').trim();
  console.log(`✅ Netlify Site ID ditemukan: ${siteId}`);
} else {
  console.log('⚠️ Netlify Site ID tidak ditemukan di .netlify/site-id');
  console.log('Jalankan script create-netlify-site terlebih dahulu:');
  console.log('npm run create-netlify-site');
  process.exit(1);
}

// Daftar file GitHub workflow yang perlu diperbarui
const workflowFiles = [
  '.github/workflows/deploy.yml',
  '.github/workflows/netlify-deploy.yml',
  '.github/workflows/netlify-deploy-full.yml',
  '.github/workflows/deploy-netlify.yml'
];

// Fungsi untuk memperbarui konten file
function updateWorkflowFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️ File tidak ditemukan: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  
  // Tambahkan komentar tentang konfigurasi
  const headerComment = `# File workflow ini telah diperbarui secara otomatis oleh script
# Netlify Site ID: ${siteId}
# Netlify Auth Token: [SENSITIVE] - Harap atur di GitHub repository secrets
# Terakhir diperbarui: ${new Date().toISOString()}
`;

  // Periksa apakah file sudah memiliki komentar header
  if (!content.includes('# File workflow ini telah diperbarui secara otomatis oleh script')) {
    content = headerComment + content;
  }

  // Simpan perubahan
  fs.writeFileSync(filePath, content);
  console.log(`✅ File workflow diperbarui: ${filePath}`);
  return true;
}

// Buat README dengan panduan konfigurasi
function createReadme() {
  const readmePath = path.join(__dirname, '..', 'DEPLOYMENT.md');
  
  const readmeContent = `# Panduan Deployment

## Konfigurasi GitHub Actions

Website ini dikonfigurasi untuk otomatis deploy ke Netlify menggunakan GitHub Actions.

### Secrets yang Diperlukan

Tambahkan secrets berikut di GitHub repository Anda:

1. \`NETLIFY_AUTH_TOKEN\`: Token autentikasi Netlify (sudah dikonfigurasi)
2. \`NETLIFY_SITE_ID\`: ID situs Netlify Anda (${siteId})

### Cara Menambahkan Secrets

1. Buka repositori GitHub Anda di browser
2. Buka "Settings" -> "Secrets and variables" -> "Actions"
3. Klik "New repository secret"
4. Tambahkan secrets dengan detail di atas

## Netlify Site

URL: https://\`[netlify-subdomain]\`.netlify.app
Site ID: ${siteId}

## Cara Deploy Manual

Jalankan perintah berikut untuk deploy manual:

\`\`\`bash
npm run deploy:netlify
\`\`\`

## Troubleshooting

Jika mengalami masalah dengan deployment:

1. Pastikan secrets sudah dikonfigurasi dengan benar
2. Periksa log actions di GitHub repository
3. Jalankan \`npm run setup-netlify\` untuk memverifikasi konfigurasi Netlify

`;

  fs.writeFileSync(readmePath, readmeContent);
  console.log(`✅ File panduan deployment dibuat: ${readmePath}`);
}

// Update semua file workflow
let updatedCount = 0;
for (const file of workflowFiles) {
  const fullPath = path.join(__dirname, '..', file);
  if (updateWorkflowFile(fullPath)) {
    updatedCount++;
  }
}

// Buat README
createReadme();

console.log(`\n🎉 Konfigurasi GitHub Actions selesai!`);
console.log(`${updatedCount} file workflow diperbarui.`);
console.log(`\nPenting: Anda masih perlu menambahkan secrets berikut di GitHub repository:`);
console.log(`1. NETLIFY_AUTH_TOKEN (token autentikasi Netlify)`);
console.log(`2. NETLIFY_SITE_ID: ${siteId}`);
console.log(`\nLihat DEPLOYMENT.md untuk panduan lengkap.`); 
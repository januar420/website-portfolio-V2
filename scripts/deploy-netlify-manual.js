/**
 * Script untuk deploy manual ke Netlify
 * Ini menjalankan semua langkah perbaikan dan deployment secara berurutan
 */

const { execSync } = require('child_process');
const readline = require('readline');

// Fungsi log sederhana tanpa dependensi chalk
const log = {
  info: (msg) => console.log('ℹ️ ' + msg),
  success: (msg) => console.log('✅ ' + msg),
  warning: (msg) => console.log('⚠️ ' + msg),
  error: (msg) => console.log('❌ ' + msg),
  blue: (msg) => console.log('🔵 ' + msg),
  yellow: (msg) => console.log('🟡 ' + msg),
  gray: (msg) => console.log('⚪ ' + msg),
  bold: {
    blue: (msg) => console.log('🔷 ' + msg),
    green: (msg) => console.log('✳️ ' + msg),
    yellow: (msg) => console.log('🟨 ' + msg)
  },
  green: {
    bold: (msg) => console.log('✳️ ' + msg)
  },
  yellow: {
    bold: (msg) => console.log('🟨 ' + msg)
  }
};

// Fungsi tambahan untuk log.yellow
log.yellow = (msg) => console.log('🟡 ' + msg);
log.green = (msg) => console.log('✅ ' + msg);
log.red = (msg) => console.log('❌ ' + msg);

// Fungsi untuk menjalankan perintah dan log output
function runCommand(command, description) {
  log.blue(`🚀 ${description}...`);
  log.gray(`$ ${command}`);
  
  try {
    // Jalankan perintah dan tampilkan output secara langsung
    execSync(command, { stdio: 'inherit' });
    log.success(`${description} berhasil`);
    return true;
  } catch (error) {
    log.error(`${description} gagal: ${error.message}`);
    return false;
  }
}

// Fungsi untuk tanya jawab
function askQuestion(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer);
    });
  });
}

// Banner
log.bold.blue('\n=======================================');
log.bold.blue('    DEPLOYMENT MANUAL KE NETLIFY');
log.bold.blue('=======================================\n');

// Urutan langkah deployment
const steps = [
  {
    command: 'npm run clean',
    description: 'Membersihkan direktori build'
  },
  {
    command: 'node scripts/fix-rollup-deps.js',
    description: 'Memperbaiki dependensi rollup'
  },
  {
    command: 'node scripts/platform-fix.js',
    description: 'Memperbaiki masalah platform'
  },
  {
    command: 'node scripts/direct-patching.js',
    description: 'Menerapkan patching langsung'
  },
  {
    command: 'npm run build:netlify',
    description: 'Membangun proyek untuk Netlify'
  },
  {
    command: 'node scripts/prepare-netlify.js',
    description: 'Menyiapkan output untuk Netlify'
  },
  {
    command: 'node scripts/validate-netlify.js',
    description: 'Memvalidasi output Netlify'
  },
  {
    command: 'npx netlify deploy --prod --dir=out --site=05986322-27d2-402a-a2cc-ec8c52d44aeb',
    description: 'Men-deploy ke Netlify'
  }
];

// Jalankan langkah-langkah secara berurutan
async function main() {
  let success = true;
  
  for (let i = 0; i < steps.length; i++) {
    const { command, description } = steps[i];
    
    log.yellow(`\nLangkah ${i+1}/${steps.length}: ${description}`);
    
    const stepSuccess = runCommand(command, description);
    if (!stepSuccess) {
      success = false;
      
      // Tanya apakah ingin melanjutkan meskipun ada error
      const response = await askQuestion('⚠️ Langkah gagal. Lanjutkan proses? (y/N): ');
      
      if (response.toLowerCase() !== 'y') {
        log.error('Deployment dibatalkan oleh pengguna.');
        process.exit(1);
      }
    }
  }
  
  if (success) {
    log.bold.green('\n🎉 Semua langkah deployment berhasil!');
    log.success('Website telah di-deploy ke Netlify.');
  } else {
    log.bold.yellow('\n⚠️ Deployment selesai dengan beberapa masalah.');
    log.warning('Periksa pesan error di atas dan perbaiki jika diperlukan.');
  }
}

// Jalankan fungsi utama
main(); 
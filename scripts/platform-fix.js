/**
 * Script untuk mengatasi masalah platform dependencies
 * Khususnya untuk mengatasi error EBADPLATFORM pada CI/CD
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Memperbaiki masalah platform dependencies...');

// Fungsi untuk memperbaiki optionalDependencies yang terkait dengan platform
function fixOptionalDependencies() {
  try {
    // Cari semua package.json di node_modules
    console.log('🔍 Mencari package.json dengan optionalDependencies...');
    
    // Daftar package yang sering bermasalah dengan platform
    const targetPackages = [
      'node_modules/@rollup/rollup-*/package.json',
      'node_modules/esbuild*/package.json',
      'node_modules/fsevents/package.json',
      'node_modules/canvas/package.json',
      'node_modules/@swc/*/package.json',
      'node_modules/@next/swc*/package.json',
      'node_modules/sharp/package.json',
      'node_modules/node-gyp*/package.json'
    ];
    
    let modifiedCount = 0;
    
    for (const packagePattern of targetPackages) {
      try {
        // Gunakan glob untuk menemukan package.json yang cocok dengan pattern
        const findCmd = process.platform === 'win32'
          ? `dir /s /b ${packagePattern.replace(/\//g, '\\')}` 
          : `find ./node_modules -path "${packagePattern}" -type f`;
        
        let packagePaths;
        try {
          packagePaths = execSync(findCmd, { encoding: 'utf8' })
            .split('\n')
            .filter(p => p.trim() !== '');
        } catch (err) {
          // Jika command tidak menemukan file, lanjutkan ke pattern berikutnya
          continue;
        }
        
        for (const packagePath of packagePaths) {
          // Baca package.json
          const pkgJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
          
          // Jika memiliki optionalDependencies, modifikasi
          if (pkgJson.optionalDependencies) {
            console.log(`🔧 Memperbaiki: ${packagePath}`);
            
            // Hapus optionalDependencies dan pindahkan ke peerDependencies
            if (!pkgJson.peerDependencies) {
              pkgJson.peerDependencies = {};
            }
            
            // Pindahkan optionalDependencies ke peerDependencies
            Object.assign(pkgJson.peerDependencies, pkgJson.optionalDependencies);
            delete pkgJson.optionalDependencies;
            
            // Tulis package.json yang dimodifikasi
            fs.writeFileSync(packagePath, JSON.stringify(pkgJson, null, 2));
            modifiedCount++;
          }
        }
      } catch (err) {
        console.warn(`⚠️ Error saat memproses ${packagePattern}:`, err.message);
      }
    }
    
    console.log(`✅ Berhasil memperbaiki ${modifiedCount} package.json`);
    return modifiedCount;
  } catch (error) {
    console.error('❌ Error saat memperbaiki optionalDependencies:', error.message);
    return 0;
  }
}

// Fungsi untuk membuat override untuk @rollup/* packages
function createRollupOverrides() {
  try {
    const packageJsonPath = path.join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    console.log('🔧 Memperbaiki @rollup/* packages di package.json...');
    
    // Tetapkan versi rollup yang stabil
    const rollupVersion = '4.9.5';
    
    // Buat atau perbarui overrides untuk @rollup/*
    if (!packageJson.overrides) {
      packageJson.overrides = {};
    }
    
    const rollupPackages = [
      '@rollup/rollup-android-arm-eabi',
      '@rollup/rollup-android-arm64',
      '@rollup/rollup-darwin-arm64',
      '@rollup/rollup-darwin-x64',
      '@rollup/rollup-linux-arm-gnueabihf',
      '@rollup/rollup-linux-arm64-gnu',
      '@rollup/rollup-linux-arm64-musl',
      '@rollup/rollup-linux-x64-gnu',
      '@rollup/rollup-linux-x64-musl',
      '@rollup/rollup-win32-arm64-msvc',
      '@rollup/rollup-win32-ia32-msvc',
      '@rollup/rollup-win32-x64-msvc'
    ];
    
    // Tambahkan overrides untuk semua package rollup
    for (const pkg of rollupPackages) {
      packageJson.overrides[pkg] = rollupVersion;
    }
    
    // Tambahkan juga ke resolutions untuk yarn/pnpm
    if (!packageJson.resolutions) {
      packageJson.resolutions = {};
    }
    
    for (const pkg of rollupPackages) {
      packageJson.resolutions[pkg] = rollupVersion;
    }
    
    // Tulis kembali package.json
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    
    console.log('✅ Berhasil memperbaiki @rollup/* packages di package.json');
    return true;
  } catch (error) {
    console.error('❌ Error saat membuat rollup overrides:', error.message);
    return false;
  }
}

// Fungsi untuk membuat .npmrc dengan setting yang mengatasi masalah platform
function createNpmrc() {
  try {
    const npmrcPath = path.join(__dirname, '..', '.npmrc');
    console.log('🔧 Membuat .npmrc untuk mengatasi masalah platform...');
    
    const npmrcContent = `
# Pengaturan NPM untuk mengatasi masalah platform dependencies
legacy-peer-deps=true
node-linker=hoisted
prefer-offline=true
ignore-scripts=false
ignore-platform=true

# Tidak memperdulikan mesin opsional
omit=optional

# Kompatibilitas untuk NPM 7+
strict-peer-dependencies=false
auto-install-peers=true
`;
    
    fs.writeFileSync(npmrcPath, npmrcContent.trim());
    console.log('✅ Berhasil membuat .npmrc');
    return true;
  } catch (error) {
    console.error('❌ Error saat membuat .npmrc:', error.message);
    return false;
  }
}

// Jalankan npm install dengan flag yang mengatasi platform issues
function runNpmInstall() {
  try {
    console.log('🔄 Menjalankan npm install dengan flag untuk mengatasi platform issues...');
    
    execSync('npm install --no-optional --ignore-platform --force', {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit'
    });
    
    console.log('✅ npm install berhasil dijalankan');
    return true;
  } catch (error) {
    console.error('❌ Error saat menjalankan npm install:', error.message);
    return false;
  }
}

// Fungsi utama
function main() {
  console.log('=== Memperbaiki Masalah Platform Dependencies ===');
  
  // Buat .npmrc
  createNpmrc();
  
  // Buat rollup overrides di package.json
  createRollupOverrides();
  
  // Perbaiki optionalDependencies yang sudah ada
  fixOptionalDependencies();
  
  // Tanya pengguna apakah ingin menjalankan npm install
  console.log('');
  console.log('🔔 Untuk menerapkan perubahan sepenuhnya, jalankan:');
  console.log('   npm install --no-optional --ignore-platform --force');
  console.log('');
  
  console.log('✅ Semua perbaikan platform berhasil diterapkan!');
}

// Jalankan fungsi utama
main(); 
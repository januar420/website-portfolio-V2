/**
 * Script untuk memperbaiki masalah dependensi rollup di package-lock.json
 * Ini sangat penting untuk mengatasi error EBADPLATFORM di CI/CD
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Memperbaiki package-lock.json untuk menghilangkan masalah platform...');

// Path ke package-lock.json
const packageLockPath = path.join(__dirname, '..', 'package-lock.json');

// Cek apakah package-lock.json ada
if (!fs.existsSync(packageLockPath)) {
  console.error('❌ package-lock.json tidak ditemukan!');
  process.exit(1);
}

try {
  // Baca package-lock.json
  const packageLockContent = fs.readFileSync(packageLockPath, 'utf8');
  const packageLock = JSON.parse(packageLockContent);
  
  // Daftar pattern untuk dependensi yang bermasalah
  const problematicPatterns = [
    '@rollup/rollup-android-',
    '@rollup/rollup-arm',
    'fsevents',
    'esbuild-android',
    'esbuild-arm',
    'sharp-android',
    'canvas-prebuilt',
    'swc-android',
    'swc-arm'
  ];
  
  console.log('🔍 Mencari dependensi yang bermasalah...');
  
  let removedCount = 0;
  
  // Hapus dari packages
  if (packageLock.packages) {
    const originalPackagesCount = Object.keys(packageLock.packages).length;
    
    Object.keys(packageLock.packages).forEach(pkg => {
      for (const pattern of problematicPatterns) {
        if (pkg.includes(pattern)) {
          console.log(`🗑️ Menghapus package: ${pkg}`);
          delete packageLock.packages[pkg];
          removedCount++;
          break;
        }
      }
    });
    
    console.log(`✅ Menghapus ${removedCount} dari ${originalPackagesCount} packages`);
  }
  
  // Hapus dari dependencies
  if (packageLock.dependencies) {
    let depsRemoved = 0;
    const originalDepsCount = Object.keys(packageLock.dependencies).length;
    
    Object.keys(packageLock.dependencies).forEach(dep => {
      for (const pattern of problematicPatterns) {
        if (dep.includes(pattern)) {
          console.log(`🗑️ Menghapus dependency: ${dep}`);
          delete packageLock.dependencies[dep];
          depsRemoved++;
          break;
        } else if (packageLock.dependencies[dep].dependencies) {
          // Juga periksa sub-dependencies
          const subDeps = packageLock.dependencies[dep].dependencies;
          Object.keys(subDeps).forEach(subDep => {
            for (const pattern of problematicPatterns) {
              if (subDep.includes(pattern)) {
                console.log(`🗑️ Menghapus sub-dependency: ${dep} -> ${subDep}`);
                delete subDeps[subDep];
                depsRemoved++;
                break;
              }
            }
          });
        }
      }
    });
    
    console.log(`✅ Menghapus ${depsRemoved} dari ${originalDepsCount} dependencies`);
    removedCount += depsRemoved;
  }
  
  // Tulis kembali package-lock.json
  fs.writeFileSync(packageLockPath, JSON.stringify(packageLock, null, 2));
  
  console.log(`🎉 Berhasil memperbaiki package-lock.json, menghapus total ${removedCount} dependensi bermasalah.`);
} catch (error) {
  console.error('❌ Error saat memperbaiki package-lock.json:', error.message);
  process.exit(1);
}

// Buat .npmrc untuk memastikan NPM tidak mencoba menginstal dependensi tersebut lagi
try {
  const npmrcPath = path.join(__dirname, '..', '.npmrc');
  
  const npmrcContent = `
# Pengaturan NPM untuk mengatasi masalah platform dependencies
legacy-peer-deps=true
ignore-platform=true
omit=optional
strict-peer-dependencies=false
auto-install-peers=true
platform=linux
arch=x64
optional=false
fund=false
audit=false
`;
  
  fs.writeFileSync(npmrcPath, npmrcContent.trim());
  console.log('✅ Berhasil membuat .npmrc dengan pengaturan yang tepat');
} catch (error) {
  console.error('❌ Error saat membuat .npmrc:', error.message);
}

console.log('');
console.log('🔔 Untuk menerapkan perubahan sepenuhnya, jalankan:');
console.log('   npm install --omit=optional --ignore-platform --force');
console.log(''); 
/**
 * Script untuk melakukan patching langsung pada node_modules
 * Ini dapat memperbaiki masalah yang tidak bisa diselesaikan dengan overrides
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Melakukan patching langsung pada node_modules...');

// Fungsi untuk menemukan semua file yang cocok dengan pola
function findFiles(dir, pattern, callback, ignored = []) {
  if (!fs.existsSync(dir)) return;
  
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    
    // Skip ignored directories
    if (ignored.some(ignoredPath => filePath.includes(ignoredPath))) {
      continue;
    }
    
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findFiles(filePath, pattern, callback, ignored);
    } else if (pattern.test(file)) {
      callback(filePath);
    }
  }
}

// Tambahkan polyfill Promise.withResolvers ke file JavaScript
function addPolyfillToJsFiles() {
  console.log('📝 Menambahkan polyfill Promise.withResolvers ke file yang membutuhkannya...');
  
  const targetFiles = [
    // PDF.js worker files
    /pdf\.worker.*\.js$/,
    // React fiber related files
    /react-reconciler.*\.js$/,
    // Three.js files
    /three.*\.module\.js$/
  ];
  
  const polyfillCode = `
// Polyfill untuk Promise.withResolvers
if (typeof Promise.withResolvers !== 'function') {
  Promise.withResolvers = function withResolvers() {
    let resolve, reject;
    const promise = new Promise(function(res, rej) {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };
}
`;
  
  const nodeModulesDir = path.join(__dirname, '..', 'node_modules');
  const ignoredDirs = ['.cache', '.git', '.next', 'dist', 'build'];
  
  let modifiedCount = 0;
  
  for (const pattern of targetFiles) {
    findFiles(nodeModulesDir, pattern, (filePath) => {
      try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Periksa apakah file menggunakan Promise.withResolvers
        if (content.includes('Promise.withResolvers') && !content.includes('function withResolvers()')) {
          console.log(`🔍 Menemukan penggunaan Promise.withResolvers di: ${path.relative(nodeModulesDir, filePath)}`);
          
          // Tambahkan polyfill di awal file
          content = polyfillCode + content;
          
          fs.writeFileSync(filePath, content);
          modifiedCount++;
          console.log(`✅ Berhasil menambahkan polyfill ke: ${path.relative(nodeModulesDir, filePath)}`);
        }
      } catch (error) {
        console.error(`❌ Error saat modifikasi ${filePath}:`, error.message);
      }
    }, ignoredDirs);
  }
  
  console.log(`🎉 Selesai: ${modifiedCount} file dimodifikasi dengan polyfill Promise.withResolvers`);
}

// Perbaiki versi esbuild dalam file package.json di node_modules
function fixEsbuildVersions() {
  console.log('🔧 Memperbaiki versi esbuild di semua package.json...');
  
  const pattern = /package\.json$/;
  const nodeModulesDir = path.join(__dirname, '..', 'node_modules');
  const targetVersion = '0.18.20'; // Target version yang diinginkan
  
  let modifiedCount = 0;
  
  findFiles(nodeModulesDir, pattern, (filePath) => {
    try {
      const packageJson = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      let modified = false;
      
      // Cek dan perbaiki di dependencies
      if (packageJson.dependencies && packageJson.dependencies.esbuild) {
        packageJson.dependencies.esbuild = targetVersion;
        modified = true;
      }
      
      // Cek dan perbaiki di devDependencies
      if (packageJson.devDependencies && packageJson.devDependencies.esbuild) {
        packageJson.devDependencies.esbuild = targetVersion;
        modified = true;
      }
      
      // Cek dan perbaiki di peerDependencies
      if (packageJson.peerDependencies && packageJson.peerDependencies.esbuild) {
        packageJson.peerDependencies.esbuild = targetVersion;
        modified = true;
      }
      
      // Tulis kembali package.json jika dimodifikasi
      if (modified) {
        fs.writeFileSync(filePath, JSON.stringify(packageJson, null, 2));
        modifiedCount++;
        console.log(`✅ Memperbarui versi esbuild di: ${path.relative(nodeModulesDir, filePath)}`);
      }
    } catch (error) {
      console.error(`❌ Error saat memperbaiki ${filePath}:`, error.message);
    }
  });
  
  console.log(`🎉 Selesai: ${modifiedCount} package.json diperbarui dengan versi esbuild ${targetVersion}`);
}

// Perbaiki @rollup dependencies
function fixRollupDependencies() {
  console.log('🔧 Memperbaiki dependensi @rollup di node_modules...');
  
  const pattern = /package\.json$/;
  const nodeModulesDir = path.join(__dirname, '..', 'node_modules');
  const targetRollupVersion = '4.9.5'; // Target version yang diinginkan
  
  let modifiedCount = 0;
  
  findFiles(nodeModulesDir, pattern, (filePath) => {
    try {
      const packageJson = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      let modified = false;
      
      // Cek dan perbaiki semua dependencies terkait rollup
      ['dependencies', 'devDependencies', 'peerDependencies'].forEach(depType => {
        if (packageJson[depType]) {
          Object.keys(packageJson[depType]).forEach(dep => {
            if (dep.startsWith('@rollup/rollup-')) {
              packageJson[depType][dep] = targetRollupVersion;
              modified = true;
            }
          });
        }
      });
      
      // Tulis kembali package.json jika dimodifikasi
      if (modified) {
        fs.writeFileSync(filePath, JSON.stringify(packageJson, null, 2));
        modifiedCount++;
        console.log(`✅ Memperbarui versi @rollup di: ${path.relative(nodeModulesDir, filePath)}`);
      }
    } catch (error) {
      console.error(`❌ Error saat memperbaiki ${filePath}:`, error.message);
    }
  });
  
  console.log(`🎉 Selesai: ${modifiedCount} package.json diperbarui dengan versi @rollup ${targetRollupVersion}`);
}

// Jalankan semua fungsi patching
addPolyfillToJsFiles();
fixEsbuildVersions();
fixRollupDependencies();

console.log('🎉 Patching langsung ke node_modules selesai!'); 
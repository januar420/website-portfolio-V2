/**
 * Script untuk memperbaiki masalah dengan font pada Windows
 * Digunakan dalam npm script untuk memastikan folder fonts ada dan memiliki konten yang diperlukan
 * 
 * Januar Galuh Prabakti Portfolio
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Daftar font yang dibutuhkan untuk aplikasi
const REQUIRED_FONTS = [
  {
    name: 'inter-latin-400.woff2',
    url: 'https://fonts.gstatic.com/s/inter/v12/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7.woff2'
  },
  {
    name: 'inter-latin-700.woff2',
    url: 'https://fonts.gstatic.com/s/inter/v12/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa25L7SUc.woff2'
  }
];

// Path untuk folder font
const FONTS_DIR = path.join(process.cwd(), 'public', 'fonts');

/**
 * Memastikan folder font ada
 */
function ensureFontDir() {
  if (!fs.existsSync(FONTS_DIR)) {
    console.log('Membuat folder font...');
    fs.mkdirSync(FONTS_DIR, { recursive: true });
  }
}

/**
 * Mengunduh file font jika diperlukan
 */
function downloadFontIfNeeded(font) {
  const fontPath = path.join(FONTS_DIR, font.name);
  
  // Skip jika font sudah ada
  if (fs.existsSync(fontPath)) {
    const stats = fs.statSync(fontPath);
    if (stats.size > 0) {
      console.log(`Font ${font.name} sudah ada (${stats.size} bytes). Melewatinya.`);
      return Promise.resolve();
    }
  }
  
  // Unduh font jika tidak ada atau kosong
  console.log(`Mengunduh font ${font.name} dari ${font.url}...`);
  
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(fontPath);
    
    https.get(font.url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Gagal mengunduh font: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`Font ${font.name} berhasil diunduh.`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(fontPath, () => {}); // Hapus file jika ada error
      reject(err);
    });
  });
}

/**
 * Membuat file CSS untuk font
 */
function createFontCss() {
  const cssPath = path.join(FONTS_DIR, 'inter.css');
  const cssContent = `/* Definisi font Inter lokal */
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('/fonts/inter-latin-400.woff2') format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}

@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url('/fonts/inter-latin-700.woff2') format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}

/* Definisi fallback fonts */
@font-face {
  font-family: 'Inter Fallback';
  font-style: normal;
  font-weight: 400;
  src: local('Arial');
  ascent-override: 90%;
  descent-override: 22%;
  line-gap-override: 0%;
  size-adjust: 107%;
}

@font-face {
  font-family: 'Inter Fallback';
  font-style: normal;
  font-weight: 700;
  src: local('Arial Bold');
  ascent-override: 90%;
  descent-override: 22%;
  line-gap-override: 0%;
  size-adjust: 107%;
}`;

  fs.writeFileSync(cssPath, cssContent);
  console.log('File CSS font dibuat.');
}

/**
 * Fungsi utama untuk memperbaiki font
 */
async function fixFonts() {
  console.log('Mulai memperbaiki font...');
  
  try {
    // Pastikan folder font ada
    ensureFontDir();
    
    // Unduh font yang diperlukan
    for (const font of REQUIRED_FONTS) {
      await downloadFontIfNeeded(font);
    }
    
    // Buat file CSS
    createFontCss();
    
    console.log('Font berhasil diperbaiki!');
  } catch (error) {
    console.error('Error memperbaiki font:', error);
    process.exit(1);
  }
}

// Jalankan fungsi utama
fixFonts(); 
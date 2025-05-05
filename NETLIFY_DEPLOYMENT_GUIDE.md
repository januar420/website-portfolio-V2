# Panduan Deployment ke Netlify

Panduan ini akan menjelaskan cara melakukan deployment website portfolio ke Netlify dengan benar, memastikan semua fitur berfungsi dengan baik termasuk PDF viewer dan download CV.

## Prasyarat

- NodeJS versi 18 atau lebih baru
- NPM versi 9 atau lebih baru
- Git (opsional, untuk clone repository)
- Akun Netlify

## Langkah 1: Persiapan Repository

Pastikan repository sudah siap dengan konfigurasi yang benar:

1. File `next.config.mjs` dengan konfigurasi untuk Netlify
2. File `netlify.toml` untuk konfigurasi deployment
3. File `package.json` dengan script yang diperlukan
4. File worker PDF.js di direktori `public/`

## Langkah 2: Instalasi Dependensi

```bash
# Pastikan Anda berada di direktori proyek
npm install
```

## Langkah 3: Build dan Deploy

### Opsi 1: Menggunakan Script Otomatis

Script otomatis yang telah disediakan akan melakukan semua langkah yang diperlukan untuk build dan deploy:

```bash
# Di Windows (PowerShell)
./scripts/deploy.sh

# Di Unix/Linux/macOS
bash ./scripts/deploy.sh
```

### Opsi 2: Langkah Manual

Jika Anda ingin melakukan langkah-langkah secara manual:

1. Bersihkan build sebelumnya:
   ```bash
   npm run clean
   ```

2. Build aplikasi untuk Netlify:
   ```bash
   $env:DEPLOY_TARGET="netlify" # Di PowerShell
   # ATAU
   export DEPLOY_TARGET=netlify # Di Bash/Linux/macOS
   
   npm run build:netlify
   ```

3. Persiapkan file untuk Netlify:
   ```bash
   npm run prepare-netlify
   ```

4. Deploy ke Netlify:
   ```bash
   # Jika Netlify CLI belum terinstal
   npm install -g netlify-cli
   
   # Login ke Netlify (jika belum)
   netlify login
   
   # Deploy (draft)
   netlify deploy --dir=out
   
   # Deploy ke produksi
   netlify deploy --prod --dir=out
   ```

## Langkah 4: Konfigurasi di Dashboard Netlify

Setelah deployment selesai, ada beberapa pengaturan yang perlu dikonfigurasi di dashboard Netlify:

1. Buka dashboard Netlify dan pilih site yang baru di-deploy
2. Buka tab **Site settings**
3. Pastikan domain sudah dikonfigurasi dengan benar
4. Di bagian **Build & deploy**:
   - Build command: `npm run build:netlify && npm run prepare-netlify`
   - Publish directory: `out`
   - Environment variables:
     - `DEPLOY_TARGET`: `netlify`

## Troubleshooting

Jika terjadi masalah dengan PDF viewer atau download CV, periksa hal berikut:

### 1. File PDF Worker Tidak Ditemukan

Pastikan file `pdf.worker.min.js` ada di direktori `out/` setelah build. Jika tidak, jalankan kembali:

```bash
npm run prepare-netlify
```

### 2. Masalah CORS dengan PDF Worker

Periksa file `netlify.toml` dan pastikan header CORS untuk PDF worker sudah diatur dengan benar:

```toml
[[headers]]
  for = "/pdf.worker.min.js"
  [headers.values]
    Access-Control-Allow-Origin = "*"
    Content-Type = "application/javascript"
```

### 3. Build Error

Jika terjadi error saat build, periksa:
- Dependensi yang hilang
- Versi NodeJS dan NPM
- File konfigurasi Next.js

## Pemeliharaan

Untuk memperbarui website yang sudah di-deploy:

1. Lakukan perubahan yang diperlukan pada kode
2. Commit perubahan ke Git (opsional)
3. Jalankan kembali script deploy:
   ```bash
   ./scripts/deploy.sh
   ```

## Catatan Tambahan

- PDF viewer membutuhkan file worker yang benar untuk berfungsi dengan baik
- File `_redirects` diperlukan untuk SPA routing di Netlify
- File `404.html` memberikan halaman error yang lebih baik

## Referensi

- [Dokumentasi Netlify](https://docs.netlify.com/)
- [Dokumentasi Next.js untuk Static Export](https://nextjs.org/docs/pages/building-your-application/deploying/static-exports)
- [PDF.js Documentation](https://mozilla.github.io/pdf.js/) 
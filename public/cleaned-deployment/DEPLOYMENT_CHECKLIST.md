# Checklist Deployment Aplikasi Portfolio

Dokumen ini berisi daftar langkah-langkah yang harus dilakukan untuk memastikan deployment aplikasi portfolio berjalan dengan lancar.

## A. Persiapan Sebelum Deployment

### 1. Pembersihan Kode

- [ ] Hapus atau tandai file development-only:
  - [ ] `scripts/inject-to-browser.js`
  - [ ] `scripts/enable-devtools.js`
  - [ ] File-file terkait deployment GitHub Pages jika tidak digunakan
  
- [ ] Pastikan tidak ada console.log debugging yang tersisa
  ```bash
  grep -r "console.log" --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js" .
  ```

### 2. Konfigurasi Environment

- [ ] Setup file `.env.local` dengan variabel yang sesuai:
  ```
  NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id
  NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id
  NEXT_PUBLIC_EMAILJS_USER_ID=your_user_id
  NODE_ENV=production
  ```

### 3. Pengujian Build Lokal

- [ ] Jalankan build lokal untuk memastikan tidak ada error:
  ```bash
  npm run build
  ```

- [ ] Pastikan build berhasil tanpa error TypeScript

- [ ] Tes aplikasi dengan server produksi lokal:
  ```bash
  npm run start
  ```

### 4. Optimasi Aset

- [ ] Periksa ukuran gambar, kompresi jika perlu
- [ ] Pastikan script optimasi loading berjalan dengan baik

## B. Proses Deployment

### 1. Pilih Platform Deployment

#### Netlify (Direkomendasikan)

- [ ] Login/daftar ke [Netlify](https://www.netlify.com/)
- [ ] Connect repository dengan Netlify
- [ ] Setup variabel lingkungan di dashboard Netlify:
  - [ ] `NEXT_PUBLIC_EMAILJS_SERVICE_ID`
  - [ ] `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID`
  - [ ] `NEXT_PUBLIC_EMAILJS_USER_ID`
- [ ] Konfigurasi build command: `npm run build`
- [ ] Konfigurasi direktori publikasi: `.next`
- [ ] Deploy situs

#### Vercel

- [ ] Login/daftar ke [Vercel](https://vercel.com/)
- [ ] Import repository
- [ ] Setup variabel lingkungan di dashboard Vercel
- [ ] Deploy dengan pengaturan default

#### GitHub Pages (Opsional)

- [ ] Pastikan variabel lingkungan GitHub Pages dinyalakan:
  ```
  GITHUB_PAGES=true
  ```
- [ ] Jalankan script deployment:
  ```bash
  npm run deploy:gh-pages
  ```

### 2. Periksa Deployment Status

- [ ] Pantau log deployment untuk error
- [ ] Verifikasi build berhasil di platform
- [ ] Pastikan domain/URL sudah aktif

## C. Verifikasi Post-Deployment

### 1. Fungsionalitas

- [ ] Periksa semua halaman dapat diakses
- [ ] Tes fitur pergantian bahasa
- [ ] Verifikasi fitur email berfungsi dengan mengirim email tes
- [ ] Periksa semua link bekerja dengan benar (internal dan eksternal)
- [ ] Tes fitur download CV/resume

### 2. Responsivitas

- [ ] Tes di perangkat mobile:
  - [ ] Android
  - [ ] iOS
- [ ] Tes di ukuran layar berbeda:
  - [ ] Tablet
  - [ ] Desktop
  - [ ] Laptop

### 3. Performa

- [ ] Jalankan Google Lighthouse:
  ```bash
  npx lighthouse https://[your-deployed-url] --view
  ```
- [ ] Periksa skor untuk:
  - [ ] Performance
  - [ ] Accessibility
  - [ ] Best Practices
  - [ ] SEO

### 4. Browser Support

- [ ] Tes di browser berbeda:
  - [ ] Chrome
  - [ ] Firefox
  - [ ] Safari
  - [ ] Edge

## D. Pemeliharaan Berkelanjutan

### 1. Monitoring

- [ ] Setup Google Analytics (opsional)
- [ ] Konfigurasikan notifikasi error di platform deployment

### 2. Backup

- [ ] Simpan backup kode lokal
- [ ] Buat tag/release di GitHub

### 3. Dokumentasikan Perubahan

- [ ] Update README dengan URL yang di-deploy
- [ ] Catat masalah yang ditemukan selama deployment

## Kontak Support

Jika mengalami masalah saat deployment, silakan hubungi:
- Email: januargaluh3099@gmail.com
- WhatsApp: +6281290040769 
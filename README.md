# Januar Galuh Prabakti - Web Portfolio

Ini adalah website portfolio profesional Januar Galuh Prabakti.

## Fitur Utama

- Desain modern dan responsif
- Visualisasi 3D dengan Three.js
- Formulir kontak terintegrasi dengan EmailJS
- Optimasi loading untuk pengalaman pengguna yang lebih cepat:
  - Preloading resource penting
  - Timeout patching yang efisien (300-800ms)
  - Komponen loading dengan indikator progres
  - Postbuild optimization untuk asset

## Cara Deploy ke Netlify

### Metode 1: Menggunakan Script Otomatis

Proyek ini dilengkapi dengan script otomatisasi untuk memudahkan deployment:

1. Di Windows (PowerShell):
   ```powershell
   ./scripts/deploy-netlify.ps1
   ```

2. Di Linux/macOS (bash):
   ```bash
   bash ./scripts/deploy.sh
   ```

Script otomatis akan:
- Membersihkan build sebelumnya
- Memverifikasi keberadaan file PDF worker
- Mengonfigurasi build dengan environment yang benar
- Menjalankan build khusus untuk Netlify
- Mempersiapkan file yang diperlukan (redirects, CORS, dll)
- Menjalankan deployment ke Netlify

### Metode 2: Deploy Manual

1. Siapkan environment dan build aplikasi:
   ```bash
   # Di PowerShell
   $env:DEPLOY_TARGET="netlify"
   npm run build:netlify
   npm run prepare-netlify
   
   # Di bash
   export DEPLOY_TARGET=netlify
   npm run build:netlify
   npm run prepare-netlify
   ```

2. Install Netlify CLI jika belum:
   ```bash
   npm install -g netlify-cli
   ```

3. Login ke Netlify dan deploy:
   ```bash
   netlify login
   netlify deploy --dir=out
   
   # Jika sudah puas dengan preview, deploy ke produksi:
   netlify deploy --prod --dir=out
   ```

### Metode 3: Deploy via GitHub Actions

Proyek ini mencakup konfigurasi GitHub Actions untuk CI/CD ke Netlify:

1. Di repository GitHub, buka tab "Settings" > "Secrets"
2. Tambahkan secrets berikut:
   - `NETLIFY_AUTH_TOKEN`: Token autentikasi dari dashboard Netlify
   - `NETLIFY_SITE_ID`: ID site Netlify (ditemukan di Site settings > Site information)
3. Push ke branch `main` akan memicu build dan deploy otomatis

### Catatan Penting untuk Netlify

- PDF Viewer memerlukan file worker (`pdf.worker.min.js`) yang ditempatkan dengan benar
- Header CORS perlu dikonfigurasi untuk worker file (sudah ditangani dalam `netlify.toml`)
- Redirect diperlukan untuk Single Page Application (sudah ditangani dalam `_redirects`)
- Pastikan variabel lingkungan EmailJS dikonfigurasi di dashboard Netlify

## Struktur Proyek

Proyek ini dibangun dengan:
- Next.js 15
- React 19
- Three.js (untuk visualisasi 3D)
- TailwindCSS
- EmailJS (untuk fungsionalitas kontak)

## Pengembangan Lokal

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

## Kontak

Januar Galuh Prabakti
Email: januargaluh3099@gmail.com

## Panduan Deployment

Berikut adalah panduan untuk mendeploy website portfolio ini ke beberapa platform hosting gratis:

### 1. Deployment dengan Netlify (Direkomendasikan)

Website ini sudah dikonfigurasi untuk Netlify. Untuk mendeploy:

1. Buat akun di [Netlify](https://www.netlify.com/) (gratis)
2. Hubungkan repository GitHub/GitLab/Bitbucket Anda
3. Pilih repository ini dan klik "Deploy site"
4. Netlify akan otomatis menggunakan pengaturan dari file `netlify.toml`

**Catatan Penting**: 
- Pastikan untuk menambahkan variabel lingkungan EmailJS di dashboard Netlify (Settings > Build & Deploy > Environment)
- Tambahkan domain Netlify Anda ke daftar domain yang diizinkan di dashboard EmailJS untuk menghindari masalah CORS

### 2. Deployment dengan Vercel

[Vercel](https://vercel.com/) adalah platform yang dibuat oleh tim Next.js dan sangat cocok untuk proyek Next.js:

1. Buat akun di Vercel (gratis untuk penggunaan personal)
2. Hubungkan repository GitHub/GitLab/Bitbucket Anda
3. Pilih repository ini dan klik "Deploy"
4. Tambahkan variabel lingkungan EmailJS di Settings > Environment Variables

### 3. Deployment dengan GitHub Pages

Untuk mendeploy ke GitHub Pages, tambahkan konfigurasi berikut ke package.json:

```json
"scripts": {
  // ... script lainnya
  "export": "next build && next export -o out",
  "deploy": "npm run export && npx gh-pages -d out"
},
"devDependencies": {
  // ... dependensi lainnya
  "gh-pages": "^6.1.0"
}
```

Kemudian pasang package gh-pages dengan: `npm install --save-dev gh-pages`

### 4. Menyiapkan Custom Domain (Opsional)

Untuk menggunakan domain kustom:
1. Beli domain dari penyedia seperti Namecheap, GoDaddy, atau Niagahoster
2. Konfigurasi DNS untuk mengarahkan ke layanan hosting Anda
3. Tambahkan domain kustom di pengaturan Netlify/Vercel/GitHub Pages

### Tips untuk Deployment yang Sukses:

1. Selalu jalankan `npm run build` secara lokal sebelum mendeploy untuk memastikan tidak ada error build
2. Pastikan semua variabel lingkungan yang diperlukan (terutama untuk EmailJS) sudah dikonfigurasi dengan benar
3. Jika menggunakan fitur kontak, pastikan domain telah didaftarkan di EmailJS untuk menghindari masalah CORS
4. Jika ada masalah dengan build pada Netlify, coba gunakan versi Node.js yang sesuai dengan yang ada di `netlify.toml`

### Perintah Deployment

Untuk menyiapkan deployment:
```bash
npm run prepare-deploy  # Membersihkan cache dan membangun proyek
```

## Mengonfigurasi EmailJS untuk Domain Produksi

Agar fitur formulir kontak berfungsi dengan baik setelah deployment, Anda perlu mengonfigurasi EmailJS untuk mengizinkan domain produksi Anda:

1. Login ke [dashboard EmailJS](https://dashboard.emailjs.com/)
2. Buka menu "Integration" > "Website Integration"
3. Tambahkan domain produksi Anda (misalnya: `https://nama-website-anda.netlify.app`, `https://username.github.io`, atau domain kustom Anda)
4. Untuk development lokal, tambahkan juga `http://localhost:3000`

![Konfigurasi Domain EmailJS](https://i.imgur.com/example-image.png)

### Memecahkan Masalah CORS dengan EmailJS

Jika Anda mengalami error "Access to XMLHttpRequest at 'https://api.emailjs.com/api/v1.0/email/send' from origin 'https://your-domain.com' has been blocked by CORS policy", ikuti langkah-langkah berikut:

1. Pastikan domain produksi Anda sudah ditambahkan di dashboard EmailJS
2. Periksa bahwa format domain sudah benar (termasuk `https://` atau `http://`)
3. Tunggu 5-10 menit agar perubahan diterapkan oleh server EmailJS
4. Jika masalah masih terjadi, coba bersihkan cache browser atau gunakan mode incognito

### Template Email Premium

Website ini menggunakan template email premium untuk formulir kontak. Pastikan:

1. Template ID di `.env` dan `.env.local` sudah benar
2. Service ID EmailJS sudah dikonfigurasi dengan benar
3. User ID (Public Key) EmailJS sudah sesuai dengan akun Anda

## Pemecahan Masalah Deployment

### Masalah umum pada Netlify:

1. **Build gagal** - Periksa log build di dashboard Netlify dan pastikan versi Node.js yang digunakan sesuai dengan yang ada di `netlify.toml`
2. **Masalah dengan font** - Jalankan `npm run refresh-fonts` sebelum build
3. **Error 404 pada halaman** - Pastikan file `_redirects` ada di folder `public` dengan konten: `/* /index.html 200`

### Masalah umum pada Vercel:

1. **Error saat build** - Periksa bahwa vercel.json sudah benar
2. **Variabel lingkungan tidak terbaca** - Pastikan untuk menambahkan variabel lingkungan di dashboard Vercel

### Masalah umum pada GitHub Pages:

1. **File _next tidak ditemukan** - Pastikan file `.nojekyll` ada di root direktori `out`
2. **Halaman kosong setelah refresh** - Pastikan file 404.html sudah dibuat dengan benar 

## Deployment ke Cloudflare Pages

Cloudflare Pages menawarkan hosting gratis dengan batas penggunaan yang cukup besar serta CDN global yang cepat.

### Cara Deploy ke Cloudflare Pages:

1. **Buat akun Cloudflare** (gratis) di [cloudflare.com](https://www.cloudflare.com/)

2. **Hubungkan repository Git Anda**:
   - Login ke dashboard Cloudflare
   - Buka menu "Pages"
   - Klik "Create a project" dan pilih "Connect to Git"
   - Autentikasi dan pilih repository website portfolio Anda

3. **Konfigurasi build**:
   - Framework preset: Next.js
   - Build command: `npm run build`
   - Build output directory: `.next`
   - Node.js version: 20.x
   - Tambahkan variabel lingkungan:
     ```
     NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_5mk1t2z
     NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=template_yj3blyg
     NEXT_PUBLIC_EMAILJS_USER_ID=WrdMD5erXU1TjP0SR
     ```

4. **Klik "Save and Deploy"**

5. **Konfigurasi Functions (opsional untuk fitur server-side)**:
   - Di dashboard proyek Cloudflare Pages
   - Buka "Settings" > "Functions"
   - Pastikan "Node.js compatibility mode" diaktifkan

6. **Konfigurasi CORS untuk EmailJS**:
   - Tambahkan domain Cloudflare Pages Anda (misalnya `https://your-site.pages.dev`) ke daftar domain yang diizinkan di dashboard EmailJS

### Keuntungan Cloudflare Pages:

- CDN global yang cepat
- HTTPS otomatis
- Pengaturan custom domain mudah
- Build minutes yang banyak
- Caching otomatis untuk performa tinggi
- Kompatibilitas tinggi dengan Next.js

### Menggunakan GitHub Actions dengan Cloudflare Pages

Untuk deployment otomatis menggunakan GitHub Actions:

1. **Dapatkan kredensial Cloudflare**:
   - Login ke [dashboard Cloudflare](https://dash.cloudflare.com/)
   - Buka "My Profile" > "API Tokens"
   - Klik "Create Token" dan gunakan template "Edit Cloudflare Pages"
   - Dapatkan juga Account ID Anda dari URL dashboard: `https://dash.cloudflare.com/xxxxx` (xxxxx adalah Account ID)

2. **Tambahkan secrets ke GitHub repository**:
   - Buka repository GitHub > Settings > Secrets and variables > Actions
   - Tambahkan dua secrets:
     - `CLOUDFLARE_API_TOKEN`: token API yang dibuat di langkah sebelumnya
     - `CLOUDFLARE_ACCOUNT_ID`: ID akun Cloudflare Anda

3. **Push kode ke branch main**:
   - GitHub Actions akan menjalankan workflow yang telah dikonfigurasi
   - Deployment akan otomatis dilakukan setiap kali ada push ke branch main

> **Catatan**: Jika VSCode menampilkan peringatan seperti `Context access might be invalid: CLOUDFLARE_API_TOKEN` pada file workflow, ini hanya masalah linting di editor dan tidak akan mempengaruhi proses deployment. Lihat bagian pemecahan masalah untuk solusinya.

### Pemecahan Masalah Cloudflare Pages:

1. **Error build**: Pastikan menggunakan flag `--legacy-peer-deps` dengan menambahkan variabel lingkungan `NPM_FLAGS=--legacy-peer-deps` di pengaturan build

2. **Masalah CORS dengan EmailJS**: Pastikan domain Cloudflare Pages Anda (`https://your-site.pages.dev`) sudah ditambahkan ke daftar domain yang diizinkan di dashboard EmailJS

3. **Function timeouts**: Jika menggunakan API routes, pastikan kompatibilitas function sudah diaktifkan 
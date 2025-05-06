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

## 🚀 Deployment dengan GitHub Actions

Repositori ini sudah disetup dengan GitHub Actions untuk otomatis mendeploy ke Netlify.

### Setup GitHub Secrets

Anda perlu menambahkan secrets berikut pada repositori GitHub Anda:

1. `NETLIFY_AUTH_TOKEN`: Token autentikasi dari Netlify
   - Kunjungi [User Settings > Applications](https://app.netlify.com/user/applications)
   - Buat token baru personal access
   - Salin token tersebut

2. `NETLIFY_SITE_ID`: ID dari site Netlify Anda
   - Site ID: `f74da9ff-eb8c-4f27-8c24-03bf8191755e`

Untuk menambahkan secrets:
1. Buka repositori GitHub Anda
2. Klik pada "Settings"
3. Di sidebar, klik "Secrets and variables" > "Actions"
4. Klik "New repository secret"
5. Tambahkan kedua secrets tersebut

### Opsi Deployment Manual

Jika Anda lebih suka men-deploy secara manual:

```bash
# Build project
npm run build:netlify

# Siapkan file untuk Netlify
npm run prepare-netlify

# Deploy ke Netlify
npx netlify deploy --prod --dir=out
```

Atau, Anda juga bisa men-deploy langsung dari dashboard Netlify dengan cara drag-and-drop folder `out`. 

## Deployment ke Netlify

Proyek ini sudah dikonfigurasi untuk deployment otomatis ke Netlify. Berikut adalah langkah-langkah untuk melakukan deployment:

### Otomatis dengan GitHub Actions

1. Set GitHub Secrets:
   - `NETLIFY_AUTH_TOKEN`: Token autentikasi dari Netlify
   - `NETLIFY_SITE_ID`: ID situs Netlify Anda

2. Push ke branch `main` untuk memulai proses deployment otomatis.

### Manual Deployment

1. Install Netlify CLI:
   ```bash
   npm install netlify-cli -g
   ```

2. Build proyek:
   ```bash
   npm run build:netlify
   ```

3. Deploy ke Netlify:
   ```bash
   netlify deploy --prod
   ```

### Troubleshooting Deployment

Jika Anda mengalami masalah dengan path aset:

1. Pastikan script `fix-asset-paths.js` sudah dijalankan:
   ```bash
   node scripts/fix-asset-paths.js
   ```

2. Cek file `netlify.toml` untuk konfigurasi redirect dan header.

3. Jika ada masalah dengan browser lama, polyfill sudah disediakan di `scripts/promise-polyfill.js`. 

## Informasi GitHub Actions

Repositori ini menggunakan GitHub Actions untuk otomatisasi deployment ke berbagai platform. 

### Deployment ke Netlify

Ada dua file workflow GitHub Actions untuk deployment ke Netlify:
- `.github/workflows/deploy-netlify.yml` - Menggunakan `npm run build` dan skrip `prepare-netlify.js`
- `.github/workflows/netlify-deploy.yml` - Menggunakan `npm run build:netlify`

**PENTING**: File `netlify-deploy.yml` adalah yang direkomendasikan untuk digunakan karena:
1. Menggunakan metode build khusus untuk Netlify dengan skrip `build:netlify`
2. Mencakup validasi linting sebelum deployment
3. Merupakan file yang terbaru (terakhir dimodifikasi)

Untuk menghindari kebingungan, disarankan untuk hanya menggunakan satu file workflow. Jika Anda mengalami masalah dengan deployment, pastikan rahasia (secrets) GitHub Anda telah dikonfigurasi dengan benar:
- `NETLIFY_AUTH_TOKEN`: Token autentikasi dari Netlify
- `NETLIFY_SITE_ID`: ID situs Netlify Anda

### Penggunaan Variabel Environment di GitHub Actions

Saat menggunakan variabel environment dalam GitHub Actions, perhatikan hal-hal berikut:

1. **Penempatan Variabel Environment**:
   - Untuk variabel yang digunakan selama seluruh proses: Tentukan di level `jobs`
   - Untuk variabel khusus per langkah: Tentukan di level `steps` dalam blok `env`

2. **Format yang Benar untuk Secrets**:
   ```yaml
   # Di level jobs:
   jobs:
     my-job:
       env:
         MY_SECRET: ${{ secrets.SECRET_NAME }}
   
   # Di level steps:
   steps:
     - name: Langkah saya
       env:
         MY_SECRET: ${{ secrets.SECRET_NAME }}
   ```

3. **Mengatasi Peringatan "Context access might be invalid"**:
   - Ini adalah peringatan linting di VSCode dan tidak selalu berarti ada kesalahan
   - Peringatan ini biasanya muncul ketika mengakses variabel seperti `${{ secrets.SECRET_NAME }}`
   - Peringatan ini dapat diabaikan jika sintaks Anda benar dan rahasia ada di GitHub

4. **Praktik Terbaik**:
   - Gunakan komentar untuk mendokumentasikan secrets yang diperlukan di bagian atas file workflow
   - Verifikasi keberadaan secrets tanpa mengekspos nilainya sebelum build
   - Gabungkan variabel environment yang sering digunakan ke level `jobs` untuk mengurangi pengulangan

## Panduan Deployment Lengkap ke Netlify

Berikut adalah panduan deployment lengkap dengan workflow GitHub Actions terbaru:

### Metode Terbaik: GitHub Actions Workflow yang Super Robust

1. **Persiapan Repository GitHub**
   - Pastikan repository GitHub Anda sudah terhubung dengan Netlify
   - Siapkan secrets GitHub untuk `NETLIFY_AUTH_TOKEN` dan `NETLIFY_SITE_ID`

2. **Aktivasi Workflow Baru**
   - Workflow terbaru dan paling robust adalah `netlify-deploy-full.yml`
   - Workflow ini menyertakan:
     - Deteksi dan instalasi otomatis PDF.js worker
     - Validasi build dan asset penting
     - Perbaikan otomatis untuk masalah encoding
     - Pembuatan ulang file redirects yang optimal
     - Penanganan error dengan fallback

3. **Menjalankan Deployment**
   ```bash
   # Push ke branch main atau jalankan workflow manual dari GitHub
   git push origin main
   
   # ATAU gunakan GitHub UI untuk menjalankan workflow secara manual
   # dengan pilihan level cache yang berbeda
   ```

4. **Monitoring Progress**
   - Pantau progres di tab "Actions" repository GitHub Anda
   - Cek log untuk setiap tahap deployment
   - Jika berhasil, Anda akan melihat link ke deployment Netlify di log

5. **Troubleshooting**
   - Jika terjadi error pada tahap "Build untuk Netlify", periksa:
     - Ketersediaan PDF.js worker
     - Kompatibilitas versi Node.js (workflow menggunakan Node 20)
     - Dependency conflicts (workflow mencoba fallback ke `--legacy-peer-deps`)
   - Jika error pada tahap "Deploy ke Netlify", periksa:
     - Validitas token Netlify
     - Validitas Site ID Netlify
     - Permisi akses repository

### Verifikasi Deployment

Setelah deployment berhasil, verifikasi situs Anda dengan:

1. **Pengecekan Fungsional**
   - Buka URL Netlify yang disediakan di output deployment
   - Uji navigasi antar halaman
   - Uji fitur kontak (formulir EmailJS)
   - Uji fitur PDF viewer

2. **Pengecekan Teknis**
   - Verifikasi PDF.js worker berfungsi dengan benar
   - Pastikan redirects berfungsi (coba akses URL langsung ke sub-halaman)
   - Pastikan semua aset (gambar, PDF, dll) dimuat dengan benar

3. **Pengujian Performa**
   - Jalankan Lighthouse atau PageSpeed Insights untuk evaluasi kinerja
   - Perhatikan response time dan time-to-first-contentful-paint

### Konfigurasi Tambahan di Dashboard Netlify

Setelah deployment, Anda juga bisa menyesuaikan konfigurasi melalui dashboard Netlify:

1. **Domain Kustom**
   - Tambahkan domain kustom di `Site settings > Domain management`
   - Ikuti panduan untuk mengkonfigurasi DNS

2. **Variabel Environment**
   - Tambahkan variabel environment di `Site settings > Build & deploy > Environment`
   - Variabel yang perlu ditambahkan:
     - `NEXT_PUBLIC_EMAILJS_SERVICE_ID`
     - `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID`
     - `NEXT_PUBLIC_EMAILJS_USER_ID`

3. **Konfigurasi Build Hook**
   - Buat build hook di `Site settings > Build & deploy > Build hooks`
   - Ini berguna untuk pemicu build manual atau dari sistem lain

4. **Header & Redirects**
   - Pengaturan redirects melalui dashboard di `Site settings > Custom headers`
   - Semua redirects dari `_redirects` dan `netlify.toml` akan diterapkan otomatis

### Manual Deploy (Alternatif)

Jika Anda ingin deploy secara manual tanpa GitHub Actions:

```bash
# Persiapan build
npm ci
npm run build:netlify

# Persiapan deployment
npm run prepare-netlify
npm run fix-encoding
npm run fix-redirects

# Deploy menggunakan CLI Netlify
npx netlify deploy --prod --dir=out
```

## PDF Viewer Implementation

Proyek ini menggunakan PDF.js untuk menampilkan file PDF sertifikasi. Implementasi ini dirancang untuk mengatasi masalah yang sering terjadi dengan PDF.js di lingkungan Server-Side Rendering (SSR) seperti Next.js.

### Struktur Komponen PDF

Implementasi PDF viewer terdiri dari beberapa komponen:

1. **lib/dom-matrix-polyfill.js**: Polyfill untuk `DOMMatrix` dan API terkait yang dibutuhkan oleh PDF.js tetapi tidak tersedia di lingkungan Node.js.

2. **lib/pdf-viewer.tsx**: Komponen React yang mengimpor `react-pdf` dan mengatur worker PDF.js. Komponen ini hanya dijalankan di sisi klien.

3. **lib/pdf-client.tsx**: Wrapper yang menggunakan `dynamic import` untuk memuat komponen PDF hanya di sisi klien, menghindari masalah SSR.

4. **components/certification-pdf-viewer.tsx**: Komponen UI yang menggunakan `ClientPDFViewer` untuk menampilkan PDF dengan kontrol tambahan (zoom, rotate, dll).

### Cara Kerja

1. Semua komponen PDF ditandai dengan `"use client"` untuk memastikan mereka hanya dirender di sisi klien.

2. Polyfill `DOMMatrix` diterapkan di awal untuk mengatasi error yang terjadi saat PDF.js mencoba mengakses API browser yang tidak tersedia di Node.js.

3. PDF.js Worker dimuat secara dinamis dari CDN di sisi klien saja.

4. Komponen PDF diimpor secara dinamis menggunakan `next/dynamic` dengan `ssr: false` untuk memastikan mereka hanya dijalankan di browser.

5. Fallback viewer disediakan untuk kasus di mana PDF.js gagal dimuat atau mengalami error.

### Penggunaan

Untuk menampilkan PDF dalam aplikasi, gunakan `ClientPDFViewer` dari `@/lib/pdf-client`:

```tsx
import ClientPDFViewer from "@/lib/pdf-client"

// Dalam komponen React
<ClientPDFViewer 
  file="/path/to/document.pdf" 
  pageNumber={1}
  scale={1.0}
  width={400}
  onLoadSuccess={(numPages) => console.log(`Loaded ${numPages} pages`)}
  onLoadError={(error) => console.error("Failed to load PDF", error)}
/>
```

Untuk pengalaman yang lebih lengkap dengan kontrol navigasi, zoom, dan fitur lainnya, gunakan `CertificationPdfViewer` dari `@/components/certification-pdf-viewer`:

```tsx
import CertificationPdfViewer from "@/components/certification-pdf-viewer"

// Dalam komponen React
<CertificationPdfViewer 
  pdfUrl="/path/to/document.pdf"
  isOpen={true}
  onClose={() => console.log("PDF viewer closed")}
  title="Document Title"
  issuedBy="Issuer"
  date="1 January 2023"
/>
```

### Pemecahan Masalah PDF Viewer

Jika mengalami masalah dengan PDF viewer, periksa hal-hal berikut:

1. **Error `DOMMatrix is not defined`**:
   - Pastikan `dom-matrix-polyfill.js` dimuat dengan benar
   - File `dom-polyfills.ts` harus ada dan meng-import `dom-matrix-polyfill.js`
   - Fungsi `applyDOMPolyfills()` harus dipanggil dalam `useEffect` pada komponen klien

2. **Masalah loading PDF atau worker**:
   - PDF.js membutuhkan worker untuk berfungsi dengan baik
   - Pastikan CDN worker URL tersedia dan dapat diakses
   - URL worker yang digunakan: `https://unpkg.com/pdfjs-dist@5.2.133/build/pdf.worker.min.js`

3. **Masalah rendering PDF**:
   - Komponen PDF harus dimuat secara dinamis dengan `dynamic import` dan `ssr: false`
   - Pastikan impor `react-pdf` hanya terjadi di sisi klien
   - Gunakan fallback untuk menampilkan loading indicator saat PDF sedang dimuat

4. **File yang diperlukan untuk PDF viewer**:
   - `lib/dom-matrix-polyfill.js`: Polyfill dasar untuk DOMMatrix
   - `lib/dom-polyfills.ts`: Fungsi helper untuk menerapkan polyfills
   - `lib/pdf-viewer.tsx`: Komponen dasar PDF viewer
   - `lib/pdf-client.tsx`: Client-side wrapper dengan dynamic import
   - `components/certification-pdf-viewer.tsx`: Komponen UI lengkap

### Fitur PDF Viewer yang Diperbarui

PDF Viewer telah diperbarui dengan fitur-fitur baru yang membuat tampilan dan interaksi lebih baik:

#### Tampilan yang Lebih Modern
- **Desain UI yang lebih elegan** - Dengan efek backdrop blur, bayangan halus, dan gradien
- **Animasi dan transisi** - Menggunakan Framer Motion untuk animasi halus saat loading dan navigasi
- **Responsivitas penuh** - Bekerja dengan baik di perangkat mobile dan desktop
- **Mode gelap/terang** - Menyesuaikan dengan tema aplikasi secara otomatis

#### Fitur Interaktif
- **Zoom in/out** - Slider zoom untuk mobile dan tombol untuk desktop
- **Rotasi dokumen** - Putar dokumen dengan mudah
- **Fullscreen mode** - Lihat PDF dalam mode layar penuh
- **Panel informasi** - Tampilkan metadata dokumen seperti judul, penerbit, tanggal
- **Navigasi keyboard** - Tombol panah untuk pindah halaman dan ESC untuk keluar

#### Penanganan Error yang Lebih Baik
- **Fallback viewer** - Jika PDF.js gagal, akan otomatis beralih ke viewer bawaan browser
- **Pesan error yang informatif** - Membantu pengguna memahami masalah yang terjadi
- **Opsi alternatif** - Selalu menyediakan opsi untuk mengunduh atau membuka PDF secara langsung

#### Cara Menggunakan Fitur Baru
```tsx
<CertificationPdfViewer 
  pdfUrl="/path/to/document.pdf"
  isOpen={true}
  onClose={() => console.log("PDF viewer closed")}
  title="Document Title"
  issuedBy="Issuer"
  date="1 January 2023"
  fileSize="2.4 MB" // Opsional
/>
```

Dengan semua perbaikan ini, PDF Viewer tidak hanya menjadi lebih fungsional tetapi juga memberikan pengalaman yang lebih menyenangkan bagi pengguna saat melihat sertifikasi dan dokumen PDF lainnya.

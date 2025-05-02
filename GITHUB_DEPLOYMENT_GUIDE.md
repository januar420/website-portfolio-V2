# Panduan Deployment Website Portfolio ke GitHub

## Langkah 1: Membuat Repositori GitHub

1. Kunjungi [GitHub](https://github.com/) dan login ke akun Anda.
2. Klik tombol "+" di pojok kanan atas dan pilih "New repository".
3. Isi detail repositori:
   - Repository name: `website-portfolio` (atau nama lain yang diinginkan)
   - Description: Website Portfolio Profesional Januar Galuh Prabakti
   - Pilih "Public" jika ingin dapat diakses semua orang (disarankan untuk portfolio)
   - (Opsional) Centang "Add a README file"
   - (Opsional) Pilih "Add .gitignore" dengan template "Node"
4. Klik "Create repository"

## Langkah 2: Menghubungkan Repositori Lokal ke GitHub

Buka terminal/command prompt di direktori proyek Anda dan masukkan perintah berikut:

```bash
# Inisialisasi Git (jika belum ada)
git init

# Tambahkan remote GitHub
git remote add origin https://github.com/username/website-portfolio.git

# Ganti 'username' dengan username GitHub Anda
```

## Langkah 3: Menambahkan file ke Git dan Push ke GitHub

```bash
# Tambahkan semua file
git add .

# Buat commit pertama
git commit -m "Initial commit: Website Portfolio"

# Push ke branch main di GitHub
git push -u origin main
```

## Langkah 4: Deployment ke GitHub Pages

Ada beberapa cara untuk mendeploy website Next.js ke GitHub Pages:

### Metode 1: Menggunakan Script yang Sudah Ada

Proyek Anda sudah memiliki script untuk deploy ke GitHub Pages. Gunakan:

```bash
# Pastikan package gh-pages terinstall
npm install --save-dev gh-pages

# Deploy ke GitHub Pages
npm run deploy:gh-pages
```

### Metode 2: Setup GitHub Actions

1. Buat folder `.github/workflows` jika belum ada
2. Buat file `deploy.yml` di folder tersebut dengan isi berikut:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout 🛎️
        uses: actions/checkout@v3
        
      - name: Setup Node.js ⚙️
        uses: actions/setup-node@v3
        with:
          node-version: 20
          cache: 'npm'
          
      - name: Install dependencies 📦
        run: npm ci
        
      - name: Build 🏗️
        run: npm run export:gh-pages
        env:
          NEXT_PUBLIC_EMAILJS_SERVICE_ID: ${{ secrets.EMAILJS_SERVICE_ID }}
          NEXT_PUBLIC_EMAILJS_TEMPLATE_ID: ${{ secrets.EMAILJS_TEMPLATE_ID }}
          NEXT_PUBLIC_EMAILJS_USER_ID: ${{ secrets.EMAILJS_USER_ID }}
          
      - name: Prepare for GitHub Pages 🔧
        run: |
          touch out/.nojekyll
          node scripts/prepare-gh-pages.js
          
      - name: Deploy to GitHub Pages 🚀
        uses: JamesIves/github-pages-deploy-action@v4
        with:
          folder: out
          branch: gh-pages
```

3. Di GitHub, pergi ke repository > Settings > Secrets and variables > Actions
4. Tambahkan secrets berikut:
   - `EMAILJS_SERVICE_ID`: service_5mk1t2z
   - `EMAILJS_TEMPLATE_ID`: template_yj3blyg
   - `EMAILJS_USER_ID`: WrdMD5erXU1TjP0SR

5. Pergi ke repository > Settings > Pages
6. Pilih source "GitHub Actions"

## Langkah 5: Deployment ke Netlify (Alternatif)

Website portfolio Anda juga dikonfigurasi untuk Netlify. Untuk men-deploy:

1. Push kode ke GitHub seperti langkah-langkah di atas
2. Buat akun di [Netlify](https://www.netlify.com/) (gratis)
3. Klik "New site from Git" dan pilih repository GitHub Anda
4. Konfigurasi build:
   - Build command: `npm run build`
   - Publish directory: `.next`
5. Tambahkan variabel lingkungan berikut di Settings > Build & deploy > Environment:
   - `NEXT_PUBLIC_EMAILJS_SERVICE_ID`: service_5mk1t2z
   - `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID`: template_yj3blyg
   - `NEXT_PUBLIC_EMAILJS_USER_ID`: WrdMD5erXU1TjP0SR
6. Klik "Deploy site"

## Langkah 6: Deployment ke Vercel (Alternatif)

Vercel adalah platform yang dibuat oleh tim Next.js dan sangat cocok untuk proyek Next.js:

1. Push kode ke GitHub seperti langkah-langkah di atas
2. Buat akun di [Vercel](https://vercel.com/) (gratis)
3. Klik "Add New" > "Project" dan pilih repository GitHub Anda
4. Tambahkan variabel lingkungan yang sama seperti di Netlify
5. Klik "Deploy"

## Langkah 7: Setup Custom Domain (Opsional)

1. Beli domain dari penyedia seperti Namecheap, GoDaddy, atau Niagahoster
2. Konfigurasi DNS sesuai dengan platform yang Anda pilih:
   - GitHub Pages: Tambahkan CNAME di repository dan konfigurasikan A record di provider DNS
   - Netlify: Tambahkan domain di dashboard Netlify dan konfigurasikan DNS
   - Vercel: Tambahkan domain di dashboard Vercel dan konfigurasikan DNS

## Troubleshooting

### Masalah dengan Deployment GitHub Pages:

1. Pastikan nama repository dan username GitHub sudah benar di konfigurasi
2. Pastikan branch deployment (gh-pages) sudah diatur di GitHub > Settings > Pages
3. Pastikan file .nojekyll ada di folder out untuk menghindari masalah dengan Jekyll
4. Periksa bahwa base path sudah dikonfigurasi dengan benar di next.config.mjs

### Masalah dengan EmailJS:

1. Tambahkan domain GitHub Pages/Netlify/Vercel ke daftar domain yang diizinkan di dashboard EmailJS
2. Periksa variabel lingkungan sudah diatur dengan benar
3. Jika mengalami masalah CORS, pastikan format domain sudah benar (termasuk http:// atau https://)

## Tautan Penting

- [Dokumentasi Next.js](https://nextjs.org/docs)
- [GitHub Pages](https://docs.github.com/en/pages)
- [Netlify](https://docs.netlify.com/)
- [Vercel](https://vercel.com/docs)
- [EmailJS](https://www.emailjs.com/docs/) 
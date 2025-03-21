# Panduan Pemecahan Masalah Deployment

Dokumen ini berisi panduan lengkap untuk mengatasi masalah umum yang mungkin timbul selama proses deployment website portfolio ini.

## Masalah EmailJS

### 1. Error CORS pada EmailJS

**Masalah**: Form kontak menampilkan error atau tidak berfungsi setelah deployment.

**Solusi**:
1. Pastikan domain Anda telah ditambahkan ke dashboard EmailJS:
   - Login ke [dashboard EmailJS](https://dashboard.emailjs.com/)
   - Buka "Integration" > "Website Integration"
   - Tambahkan domain produksi Anda (contoh: `https://my-portfolio.netlify.app`)
   - Pastikan format domain benar (termasuk protokol `http://` atau `https://`)
   - Tunggu 5-10 menit agar perubahan diterapkan

2. Verifikasi kredensial di file `.env`:
   ```
   NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_YOUR_ID
   NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=template_YOUR_ID
   NEXT_PUBLIC_EMAILJS_USER_ID=YOUR_PUBLIC_KEY
   ```

### 2. Email Tidak Terkirim

**Masalah**: Formulir berhasil disubmit tetapi email tidak sampai.

**Solusi**:
1. Periksa kuota EmailJS Anda (akun gratis memiliki batasan)
2. Periksa folder spam di email penerima
3. Verifikasi bahwa Service ID dikonfigurasi dengan benar di dashboard EmailJS

## Masalah Deployment Netlify

### 1. Build Error pada Netlify

**Masalah**: Build gagal dengan error "Failed during stage 'building site': Build script returned non-zero exit code"

**Solusi**:
1. Periksa versi Node.js:
   - Pastikan versi Node.js di `netlify.toml` sesuai dengan yang digunakan di lokal
   - Gunakan Node.js v20.x yang stabil (seperti yang sudah dikonfigurasi)

2. Cache dependency:
   - Di dashboard Netlify, buka site settings > Build & deploy > Continuous deployment
   - Aktifkan "Cache dependencies"

3. Jika masalah pada fonts:
   - Tambahkan command ini ke Build command: `npm run refresh-fonts && npm run build`

### 2. Halaman 404 Setelah Refresh

**Masalah**: Halaman menampilkan 404 ketika direfresh atau mengakses URL langsung.

**Solusi**:
1. Pastikan file `public/_redirects` ada dengan konten:
   ```
   /* /index.html 200
   ```

2. Alternatif, tambahkan konfigurasi berikut di `netlify.toml`:
   ```toml
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

## Masalah Deployment Vercel

### 1. Build Error pada Vercel

**Masalah**: Build gagal dengan error terkait dependensi.

**Solusi**:
1. Override install command di dashboard Vercel:
   - Project Settings > General > Build & Development Settings
   - Override install command: `npm install --legacy-peer-deps`

2. Verifikasi Node.js Version:
   - Project Settings > General > Node.js Version
   - Gunakan Node.js 20.x (LTS)

### 2. Variabel Lingkungan

**Masalah**: Fitur yang memerlukan variabel lingkungan tidak berfungsi.

**Solusi**:
1. Tambahkan variabel lingkungan di dashboard Vercel:
   - Project Settings > Environment Variables
   - Tambahkan semua variabel dari file `.env`
   - Pastikan variabel yang perlu diakses client memiliki prefix `NEXT_PUBLIC_`

## Masalah Deployment GitHub Pages

### 1. Aset Tidak Ditemukan

**Masalah**: CSS/JS/gambar tidak dimuat, console menampilkan 404.

**Solusi**:
1. Pastikan file `.nojekyll` ada di root direktori `out`:
   - Jalankan `npm run prepare-gh-pages` setelah export
   - File ini mencegah GitHub Pages mengabaikan file/folder yang dimulai dengan underscore (`_next`)

2. Verifikasi base path di `next.config.mjs`:
   ```js
   const nextConfig = {
     basePath: '/nama-repository',
     // ...konfigurasi lainnya
   }
   ```

### 2. Routing Issue

**Masalah**: Refresh halaman menghasilkan 404.

**Solusi**:
1. Pastikan file 404.html dibuat dengan konten yang sama dengan index.html
2. Gunakan script yang disediakan: `npm run prepare-gh-pages`

## Masalah Umum

### 1. Website Lambat setelah Deployment

**Solusi**:
1. Aktifkan caching untuk aset statis
2. Periksa ukuran gambar dan kompres jika perlu
3. Aktifkan lazy loading untuk gambar dan komponen yang berat

### 2. Font Tidak Muncul atau Berubah

**Solusi**:
1. Jalankan `npm run refresh-fonts` sebelum deployment
2. Pastikan font sudah di-host secara lokal, tidak hanya dari Google Fonts

### 3. Masalah Three.js (Jika Menggunakan)

**Solusi**:
1. Pastikan shader dan model 3D dimasukkan dengan benar ke dalam build
2. Tambahkan fallback untuk perangkat yang tidak mendukung WebGL 

## Masalah Deployment Cloudflare Pages

### 1. Build Error pada Cloudflare Pages

**Masalah**: Build gagal dengan error dependency atau module not found.

**Solusi**:
1. Tambahkan variabel environment di dashboard Cloudflare Pages:
   - Buka proyek > Settings > Environment variables
   - Tambahkan `NPM_FLAGS = --legacy-peer-deps`
   - Variabel ini akan membantu mengatasi masalah kompatibilitas package

2. Variabel build tambahan yang berguna:
   - `NODE_VERSION = 20.x` (menggunakan versi Node.js yang stabil)
   - `NEXT_TELEMETRY_DISABLED = 1` (mematikan telemetri Next.js)

3. Jika masalah terkait Three.js:
   - Pastikan file `wrangler.toml` sudah memiliki flag `compatibility_flags = ["nodejs_compat"]`
   - Aktifkan flag eksperimental di dashboard Cloudflare: Settings > Functions > Compatibility flags > nodejs_compat

### 2. Masalah Routing SPA

**Masalah**: Halaman menampilkan 404 ketika di-refresh atau mengakses URL langsung.

**Solusi**:
1. Pastikan file `public/_routes.json` ada dengan konfigurasi yang benar
2. Periksa bahwa handler di `.cloudflare/workers-site/index.js` sudah dikonfigurasi dengan benar
3. Di dashboard Cloudflare Pages, aktifkan "SPA routing" di Settings > Build & Deploy

### 3. Masalah dengan WebGL/Three.js

**Masalah**: Model 3D atau animasi Three.js tidak muncul.

**Solusi**:
1. Pastikan kompatibilitas Node.js diaktifkan:
   - Di dashboard: Settings > Functions > Compatibility flags > nodejs_compat
   - Di wrangler.toml: `compatibility_flags = ["nodejs_compat"]`

2. Tambahkan mode fallback untuk browser yang tidak mendukung WebGL:
   ```js
   // Dalam komponen Three.js Anda
   useEffect(() => {
     if (!window.WebGLRenderingContext) {
       // Tampilkan fallback untuk browser tanpa WebGL
       setFallbackMode(true);
     }
   }, []);
   ```

### 4. Error CORS dengan EmailJS

**Masalah**: EmailJS gagal mengirim karena error CORS.

**Solusi**:
1. Tambahkan domain Cloudflare Pages Anda di dashboard EmailJS:
   - Format: `https://your-project.pages.dev`
   - Jika menggunakan custom domain: `https://your-domain.com`

2. Tambahkan header CORS di `_headers` file:
   - Buat file `public/_headers` dengan konten:
   ```
   /*
     Access-Control-Allow-Origin: *
     Access-Control-Allow-Methods: GET, POST, OPTIONS
     Access-Control-Allow-Headers: Content-Type
   ```

3. Verifikasi deployment URL yang benar:
   - Pastikan form action di kode frontend menggunakan URL yang benar untuk EmailJS 

### 5. Masalah dengan GitHub Actions untuk Cloudflare

**Masalah**: GitHub Actions workflow gagal saat deployment ke Cloudflare Pages.

**Solusi**:
1. **Missing secrets error**:
   - Periksa bahwa `CLOUDFLARE_API_TOKEN` dan `CLOUDFLARE_ACCOUNT_ID` sudah ditambahkan ke repository secrets
   - Pastikan token memiliki izin yang benar (gunakan template "Edit Cloudflare Pages")
   - Jika menggunakan akun Cloudflare free, pastikan Anda menggunakan Account ID yang benar, bukan Zone ID

2. **Build errors dalam workflow**:
   - Jika ada error saat build di GitHub Actions, pastikan versi Node.js yang digunakan sama dengan yang ada di lokal
   - Periksa log build untuk melihat error spesifik
   - Pertimbangkan untuk menggunakan flag `--legacy-peer-deps` pada langkah instalasi

3. **Deployment gagal**:
   - Verifikasi bahwa nama project di workflow (`projectName: januar-portfolio`) sesuai dengan nama proyek di Cloudflare Pages
   - Pastikan output directory yang digunakan adalah `.next`
   - Periksa apakah token API memiliki cakupan izin yang cukup

4. **Masalah linting di file workflow**:
   - Beberapa editor VSCode mungkin menunjukkan warning pada sintaks GitHub Actions seperti `Context access might be invalid: CLOUDFLARE_API_TOKEN`
   - Warning ini bisa diabaikan karena hanya merupakan masalah linting di editor, bukan masalah fungsionalitas
   - Jika ingin menghilangkan warning, gunakan variabel environment untuk menengahi akses ke secrets:
   ```yaml
   env:
     CF_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
   
   # Kemudian gunakan
   apiToken: ${{ env.CF_API_TOKEN }}
   ```
   - Alternatif lain adalah menginstal ekstensi VSCode khusus untuk GitHub Actions

5. **Deployment gagal**:
   - Verifikasi bahwa nama project di workflow (`projectName: januar-portfolio`) sesuai dengan nama proyek di Cloudflare Pages
   - Pastikan output directory yang digunakan adalah `.next`
   - Periksa apakah token API memiliki cakupan izin yang cukup

### 6. Error saat Pertama Kali Deploy ke Cloudflare

**Masalah**: Error "Project Not Found" saat pertama kali deploy menggunakan GitHub Actions.

**Solusi**:
1. Buat project secara manual terlebih dahulu di Cloudflare Pages:
   - Login ke dashboard Cloudflare > Pages
   - Buat project baru dengan nama yang sama seperti di workflow (misal: `januar-portfolio`)
   - Set konfigurasi dasar lalu deploy versi pertama
   - Setelah itu, deployment via GitHub Actions akan berjalan dengan baik 

## Troubleshooting Masalah Loading

Jika Anda mengalami masalah loading yang lambat, coba langkah-langkah berikut:

### 1. Periksa Network Requests

- Buka DevTools (F12) di browser
- Pilih tab Network
- Refresh halaman 
- Cari request yang memakan waktu lama (warna merah/oranye)
- Perhatikan waktu loading dan ukuran file yang besar

### 2. Perbaiki Patch Application

Jika loading text "Inisialisasi..." muncul terlalu lama:

```bash
# Pastikan menggunakan versi Node.js yang tepat
node -v  # Harus 18.x atau lebih tinggi

# Rebuild aplikasi dengan flag optimize
npm run build -- --optimize

# Pastikan script postbuild dijalankan
```

### 3. Periksa Component LoadingOptimized

Pastikan komponen `LoadingOptimized` digunakan dengan benar:

```jsx
// Penggunaan yang benar
<LoadingOptimized 
  message="Inisialisasi..." 
  timeout={800} 
  showProgress={true}
/>
```

### 4. Periksa File Log

Periksa log aplikasi untuk error patching:

```bash
# Di development
npm run dev -- --debug

# Di production build
npm run build -- --debug
```

### 5. Atur Timeout Lebih Optimal

Jika loading masih lambat, coba kurangi timeout di file:
- `components/r3f-initializer.tsx`
- `app/components/client-hero-section.tsx` 
- `lib/patch-manager.js`

Perhatikan bahwa timeout yang terlalu pendek mungkin menyebabkan komponen render sebelum patches selesai diaplikasikan. 
# Panduan Deployment ke Netlify

Dokumen ini berisi petunjuk lengkap untuk men-deploy website portfolio ke Netlify dengan benar.

## Persyaratan

- Node.js versi 18.0.0 atau lebih tinggi (direkomendasikan versi 20.x)
- npm versi 8.0.0 atau lebih tinggi
- Akun Netlify (gratis)

## Persiapan Awal

1. **Instal dependensi**

   ```bash
   npm install
   ```

2. **Siapkan Netlify CLI**

   Jalankan perintah inisialisasi Netlify untuk mempersiapkan CLI dan menghubungkan ke akun Anda:

   ```bash
   npm run init-netlify
   ```

   Ikuti petunjuk di layar untuk login ke akun Netlify Anda dan membuat/menghubungkan situs.

## Deployment

### Metode 1: Deployment Otomatis (Direkomendasikan)

Gunakan perintah tunggal berikut untuk build, persiapan, dan deploy:

```bash
npm run netlify
```

Perintah ini akan:
1. Menjalankan inisialisasi Netlify
2. Membersihkan build sebelumnya
3. Membangun proyek dengan optimasi untuk Netlify
4. Menyiapkan file-file khusus Netlify
5. Memvalidasi konfigurasi
6. Men-deploy ke Netlify

### Metode 2: Deployment Manual

Jika Anda mengalami masalah dengan CLI Netlify, gunakan metode manual:

```bash
npm run deploy:netlify-manual
```

Perintah ini akan:
1. Menyiapkan semua file yang diperlukan
2. Memberikan panduan langkah demi langkah untuk upload manual melalui Netlify dashboard

## Pemecahan Masalah

### Masalah Routing (Halaman 404)

Jika halaman selain halaman utama menampilkan error 404, kemungkinan ada masalah dengan konfigurasi routing. Coba langkah berikut:

1. **Periksa file `_redirects`**

   ```bash
   npm run fix-encoding
   ```

   Perintah ini akan memperbaiki file `_redirects` dan memastikan encoding yang benar.

2. **Periksa konfigurasi Netlify**

   Di dashboard Netlify, buka situs Anda > Site settings > Build & deploy > Post processing > Asset optimization.
   Pastikan "Asset optimization" diaktifkan.

### Masalah dengan PDF Viewer

Jika PDF viewer tidak berfungsi:

1. **Periksa apakah worker PDF.js dimuat**

   Buka DevTools di browser (F12) dan periksa tab Console untuk error terkait PDF.js.

2. **Jalankan perbaikan lengkap**

   ```bash
   npm run fix-netlify
   npm run deploy:netlify
   ```

### Masalah dengan Promise.withResolvers

Jika Anda melihat error seperti "Promise.withResolvers is not a function":

```bash
npm run fix-encoding
npm run deploy:netlify
```

## Konfigurasi Tambahan di Netlify Dashboard

Untuk performa optimal, atur konfigurasi berikut di dashboard Netlify:

1. **Atur variabel lingkungan**
   - Site settings > Build & deploy > Environment > Environment variables
   - Tambahkan: `NODE_VERSION=20` dan `NPM_VERSION=10`

2. **Aktifkan HTTP/2**
   - Site settings > Domain management > (Custom domain) > HTTPS > HTTP/2
   - Aktifkan HTTP/2 untuk performa loading yang lebih baik

3. **Atur custom domain (opsional)**
   - Site settings > Domain management > Add custom domain
   - Ikuti petunjuk untuk menyiapkan DNS

## Fitur Khusus Netlify yang Diterapkan

Proyek ini memanfaatkan beberapa fitur Netlify:

1. **Asset optimization** - Kompresi dan minifikasi otomatis
2. **SPA routing** - Pengaturan melalui `_redirects` untuk navigasi halaman
3. **Custom headers** - Konfigurasi caching dan keamanan melalui `netlify.toml`
4. **Prerendering** - Halaman statis di-prerender untuk performa loading cepat

## Struktur File Penting

- `netlify.toml` - Konfigurasi utama untuk Netlify
- `out/_redirects` - Aturan routing untuk Netlify
- `scripts/` - Berisi script utility untuk deployment

## FAQ

### Q: Mengapa tidak menggunakan Netlify Functions?
A: Proyek ini fokus pada fungsionalitas client-side dan tidak memerlukan backend yang kompleks.

### Q: Bisakah saya menggunakan Netlify CMS?
A: Ya, namun perlu konfigurasi tambahan yang tidak termasuk dalam proyek ini.

### Q: Bagaimana cara melihat log deployment?
A: Di dashboard Netlify, buka tab "Deploys" dan klik pada deployment tertentu untuk melihat log lengkap.

---

Untuk pertanyaan lain, silakan hubungi tim pengembangan. 
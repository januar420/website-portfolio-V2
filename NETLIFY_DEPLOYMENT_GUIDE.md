# Panduan Deployment ke Netlify

## Langkah 1: Persiapan Repositori GitHub

Pastikan Anda sudah memiliki repositori GitHub dengan kode website portfolio Anda. Jika belum:

1. Ikuti panduan di [GITHUB_DEPLOYMENT_GUIDE.md](GITHUB_DEPLOYMENT_GUIDE.md) untuk membuat dan push repositori ke GitHub.
2. Pastikan kode terbaru sudah di-push ke GitHub.

## Langkah 2: Membuat Akun Netlify

1. Kunjungi [Netlify](https://www.netlify.com/) dan buat akun jika belum memilikinya.
2. Anda dapat mendaftar dengan akun GitHub Anda untuk memudahkan proses integrasi.

## Langkah 3: Menghubungkan Netlify dengan Repositori GitHub

1. Login ke dashboard Netlify.
2. Klik tombol "Add new site" dan pilih "Import an existing project".
3. Pilih "GitHub" sebagai penyedia Git Anda.
4. Berikan akses Netlify ke akun GitHub Anda.
5. Pilih repositori website portfolio yang ingin Anda deploy.

## Langkah 4: Konfigurasi Build

Masukkan pengaturan build sebagai berikut:

- **Build command**: `npm run build`
- **Publish directory**: `.next`

Pastikan kedua nilai ini sudah benar karena sangat penting untuk proses deployment.

## Langkah 5: Konfigurasi Environment Variables

1. Setelah site dibuat, buka pengaturan site Anda.
2. Pilih "Build & deploy" > "Environment".
3. Klik "Edit variables" dan tambahkan variabel berikut:

```
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_5mk1t2z
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=template_yj3blyg
NEXT_PUBLIC_EMAILJS_USER_ID=WrdMD5erXU1TjP0SR
```

## Langkah 6: Deploy Site

1. Klik "Deploy site" untuk memulai proses deployment.
2. Netlify akan otomatis memulai proses build dan deployment.
3. Tunggu hingga proses selesai (biasanya memakan waktu 2-5 menit).

## Langkah 7: Kustomisasi Domain (Opsional)

Netlify memberi Anda domain acak seperti `random-name-123456.netlify.app`. Untuk kustomisasi:

1. Di dashboard site, pilih "Domain settings".
2. Anda dapat:
   - Mengubah subdomain Netlify: Klik "Options" > "Edit site name"
   - Menambahkan domain kustom: Klik "Add custom domain"

### Menggunakan Domain Kustom

1. Masukkan domain yang sudah Anda miliki.
2. Netlify akan memberikan instruksi untuk mengkonfigurasi DNS.
3. Konfigurasi DNS di provider domain Anda sesuai instruksi.
4. Netlify otomatis menyediakan SSL/TLS untuk domain kustom Anda.

## Langkah 8: Konfigurasi CORS untuk EmailJS

Agar formulir kontak berfungsi dengan baik:

1. Login ke [dashboard EmailJS](https://dashboard.emailjs.com/)
2. Buka menu "Integration" > "Website Integration"
3. Tambahkan domain Netlify Anda (misalnya: `https://your-site.netlify.app`)
4. Jika menggunakan domain kustom, tambahkan juga domain tersebut.

## Continuous Deployment

Netlify mendukung Continuous Deployment (CD), artinya:

1. Setiap kali Anda push perubahan ke branch utama (main) di GitHub
2. Netlify otomatis mendeteksi perubahan tersebut
3. Site akan di-build dan di-deploy ulang secara otomatis

Untuk menonaktifkan fitur ini, buka site settings > Build & deploy > Continuous Deployment dan pilih "Stop auto publishing".

## Pemecahan Masalah

### Build Gagal

1. Periksa log build di dashboard Netlify untuk melihat error.
2. Pastikan build berhasil secara lokal dengan `npm run build`.
3. Periksa versi Node.js yang digunakan:
   - Di Netlify: Site settings > Build & deploy > Environment > Environment variables
   - Tambahkan variabel `NODE_VERSION` dengan nilai `20` atau sesuai kebutuhan proyek.

### Masalah dengan Font

1. Jalankan `npm run refresh-fonts` secara lokal sebelum push ke GitHub.
2. Tambahkan font ke folder public/fonts dan pastikan diimport dengan benar di CSS.

### Error Terkait API atau EmailJS

1. Periksa bahwa semua variabel lingkungan sudah dikonfigurasi dengan benar.
2. Pastikan domain sudah terdaftar di EmailJS untuk menghindari masalah CORS.

### Menonaktifkan Website 

1. Di dashboard Netlify, buka site Anda
2. Klik "Site settings" > "General" > "Site details"
3. Scroll ke bawah dan klik "Delete this site"

## Menjalankan Deployment Manual

Jika Anda ingin men-deploy secara manual tanpa melalui GitHub:

```bash
# Build website
npm run build

# Deploy ke Netlify
npm run deploy:netlify
```

## Sumber Daya Tambahan

- [Dokumentasi Netlify untuk Next.js](https://docs.netlify.com/integrations/frameworks/next-js/overview/)
- [Netlify CLI](https://docs.netlify.com/cli/get-started/)
- [Troubleshooting Netlify Builds](https://docs.netlify.com/configure-builds/troubleshooting-tips/) 
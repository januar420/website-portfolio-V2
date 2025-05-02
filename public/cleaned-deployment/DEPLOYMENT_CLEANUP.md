# Panduan Pembersihan Aplikasi Sebelum Deployment

Panduan ini berisi langkah-langkah untuk membersihkan aplikasi sebelum deployment ke production. Langkah ini penting untuk mengurangi ukuran build dan meningkatkan keamanan aplikasi.

## Daftar File dan Folder yang Dapat Dibersihkan

### 1. File DevTools (Tidak Diperlukan untuk Produksi)

File-file ini hanya untuk pengembangan dan debugging, tidak diperlukan di lingkungan produksi:

- `scripts/inject-to-browser.js`: Script untuk bypass DevTools restriction
- `scripts/enable-devtools.js`: Script untuk mengaktifkan kembali DevTools

### 2. File Deployment Platform Spesifik

File-file ini hanya diperlukan jika menggunakan platform tertentu:

- **GitHub Pages Specific Files** (tidak diperlukan jika deploy ke Netlify/Vercel):
  - `scripts/prepare-gh-pages.js`: Persiapan deployment GitHub Pages
  - `.github/workflows/deploy.yml`: GitHub Actions workflow untuk GitHub Pages

- **Netlify/Vercel Specific Files** (tidak diperlukan jika deploy ke GitHub Pages):
  - `netlify.toml` atau `vercel.json`: Konfigurasi khusus platform

### 3. File Duplikat dan Tidak Terpakai

- `januar-galuh-prabakti-next.config.mjs`: File konfigurasi duplikat, gunakan `next.config.mjs`
- Folder `.next_temp` (jika ada): Folder temporary dari build sebelumnya
- Folder `.turbo` (jika ada): Cache dari Turbo yang tidak diperlukan untuk deployment

## Cara Pembersihan yang Aman

Untuk membersihkan file dengan aman, ikuti langkah-langkah berikut:

### Cadangkan File Penting (Sudah Dilakukan)

File-file penting sudah dicadangkan di folder `public/cleaned-deployment/`.

### Pembersihan File Tidak Penting

Jalankan perintah berikut sesuai platform deployment yang digunakan:

#### Untuk Semua Platform

```bash
# Jangan menghapus file asli, hanya tambahkan tanda
# File sudah ditandai dengan NOT_FOR_PRODUCTION

# Jika benar-benar ingin menghapus, gunakan:
# rm scripts/inject-to-browser.js
# rm scripts/enable-devtools.js
```

#### Untuk Deployment Netlify/Vercel (bukan GitHub Pages)

```bash
# Opsi 1: Tandai saja file GitHub Pages (sudah dilakukan)
# Opsi 2: Jika benar-benar ingin menghapus:
# rm scripts/prepare-gh-pages.js
# rm -rf .github/workflows
```

#### Untuk Deployment GitHub Pages (bukan Netlify/Vercel)

```bash
# Opsi 1: Pastikan netlify.toml dan vercel.json tidak mengganggu
# Opsi 2: Jika benar-benar ingin menghapus:
# rm netlify.toml
# rm vercel.json
```

### Pembersihan package.json

Edit file `package.json` dan hapus script yang tidak diperlukan sesuai platform deployment yang digunakan.

Untuk Netlify/Vercel (bukan GitHub Pages):
- Hapus script `deploy:gh-pages`, `prepare-gh-pages`, dan `export:gh-pages`

Untuk GitHub Pages (bukan Netlify/Vercel):
- Hapus script `deploy:netlify`, `deploy:vercel`, dan `deploy:vercel-prod`

## Cara Mengembalikan File yang Dihapus

Jika perlu mengembalikan file yang telah dihapus, gunakan cadangan di folder `public/cleaned-deployment/`:

```bash
# Contoh mengembalikan file
cp public/cleaned-deployment/inject-to-browser.js.backup scripts/inject-to-browser.js
cp public/cleaned-deployment/enable-devtools.js.backup scripts/enable-devtools.js
cp public/cleaned-deployment/prepare-gh-pages.js.backup scripts/prepare-gh-pages.js
cp public/cleaned-deployment/package.json.backup package.json
```

## Catatan Penting

1. **Jangan menghapus file yang tidak dipahami fungsinya**. Lebih baik hanya menandai file daripada menghapusnya jika tidak yakin.

2. **Backup selalu lebih baik daripada menghapus**. Itulah mengapa file-file penting sudah dicadangkan di `public/cleaned-deployment/`.

3. **File produksi vs development** - Beberapa file memang khusus untuk development dan pengujian, dan aman untuk dihapus di lingkungan produksi.

4. **Selalu tes setelah pembersihan**. Lakukan build dan tes aplikasi setelah pembersihan untuk memastikan semua tetap berfungsi dengan baik. 
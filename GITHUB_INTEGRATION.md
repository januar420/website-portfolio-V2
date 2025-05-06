# Integrasi GitHub untuk Website Portfolio

Dokumen ini menjelaskan bagaimana website portfolio diintegrasikan dengan GitHub untuk continuous integration dan deployment.

## Fitur Utama

1. **Continuous Integration**: Otomatisasi build dan testing melalui GitHub Actions
2. **Multi-platform Deployment**: Deployment otomatis ke Netlify dan GitHub Pages
3. **Pull Request Preview**: Preview otomatis untuk pull request baru
4. **Versioning**: Pelacakan perubahan dan versioning melalui git

## Persiapan

### 1. Inisialisasi GitHub Repository

Jalankan script berikut untuk mempersiapkan repository GitHub:

```bash
npm run init-github
```

Script ini akan membuat:
- File konfigurasi GitHub Actions di `.github/workflows/`
- Memastikan `.gitignore` sudah benar
- Mempersiapkan repository lokal

### 2. Menghubungkan dengan GitHub

Buat repository baru di GitHub, kemudian:

```bash
git remote add origin https://github.com/username/website-portfolio-V2.git
git push -u origin main
```

### 3. Menambahkan Secret di GitHub

Tambahkan secret berikut di GitHub repository (`Settings > Secrets and variables > Actions`):

- `NETLIFY_AUTH_TOKEN`: Token API dari Netlify (dapatkan di User Settings > Applications > Personal access tokens)
- `NETLIFY_SITE_ID`: ID dari site Netlify Anda (musical-souffle-ad6848)

## Workflow GitHub Actions

Website ini menggunakan GitHub Actions workflow untuk otomatisasi deployment:

### Build Job

- Checkout repository
- Setup Node.js
- Install dependencies
- Lint dan build
- Cache build artifacts

### Netlify Deployment

- Menggunakan cached build artifacts
- Mempersiapkan untuk Netlify
- Deploy ke Netlify menggunakan GitHub Actions

### GitHub Pages Deployment

- Membangun untuk GitHub Pages
- Mempersiapkan output
- Deploy ke branch `gh-pages`

## Trigger Deployment

Deployment dapat dipicu dengan:

1. **Push ke main**: Deployment otomatis saat push ke branch main
2. **Manual Trigger**: Melalui GitHub Actions, pilih "Run workflow" 
3. **Pull Request**: Build preview dibuat untuk pull request

## Troubleshooting

### Jika Netlify Deployment Gagal

1. Pastikan secret `NETLIFY_AUTH_TOKEN` dan `NETLIFY_SITE_ID` sudah benar
2. Pastikan build berhasil di mesin lokal dengan `npm run fix-netlify`
3. Periksa log di GitHub Actions untuk error message

### Jika GitHub Pages Deployment Gagal

1. Pastikan branch `gh-pages` tidak terkunci
2. Pastikan GitHub Pages diaktifkan di repository settings
3. Periksa deployment di tab "Actions" di GitHub repository

## Perintah Deployment Manual

Untuk deployment manual, gunakan perintah berikut:

```bash
# Deploy ke semua platform
npm run deploy:all

# Deploy hanya ke Netlify
npm run deploy:netlify-manual

# Deploy hanya ke GitHub Pages
npm run deploy:gh-pages
```

## Referensi

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Netlify CLI Documentation](https://docs.netlify.com/cli/get-started)
- [GitHub Pages Documentation](https://docs.github.com/en/pages) 
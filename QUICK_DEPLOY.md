# Panduan Cepat Deployment

Dokumen ini berisi langkah-langkah cepat untuk deploy website portfolio ke berbagai platform. Panduan ini dirancang untuk eksekusi cepat bagi Anda yang sudah familiar dengan proses deployment.

## GitHub Pages (Paling Cepat)

```bash
# Pastikan gh-pages terinstall
npm install --save-dev gh-pages

# Build dan deploy ke GitHub Pages
npm run deploy:gh-pages
```

## Netlify (Script Otomatis)

Script otomatis yang kami sediakan akan menangani semua langkah dengan mudah:

```bash
# Di Windows/PowerShell
./scripts/deploy.sh

# Di Linux/macOS
bash ./scripts/deploy.sh
```

## Netlify (Manual CLI)

```bash
# Bersihkan build sebelumnya
npm run clean

# Jalankan build untuk Netlify
$env:DEPLOY_TARGET="netlify"  # Di PowerShell
# ATAU
export DEPLOY_TARGET=netlify  # Di Bash/Linux/macOS

# Build dan persiapkan
npm run build:netlify
npm run prepare-netlify

# Install Netlify CLI jika belum
npm install -g netlify-cli

# Login ke Netlify
netlify login

# Deploy ke Netlify (draft/preview)
netlify deploy --dir=out

# Deploy ke Netlify (production)
netlify deploy --prod --dir=out
```

## Vercel

```bash
# Pastikan Vercel CLI terinstall
npm install -g vercel

# Login ke Vercel
vercel login

# Deploy ke Vercel (production)
npm run deploy:vercel-prod
```

## Cloudflare Pages

```bash
# Pastikan Wrangler terinstall
npm install -g wrangler

# Login ke Cloudflare
wrangler login

# Build website
npm run build

# Deploy ke Cloudflare Pages
npm run deploy:cloudflare
```

## Variabel Lingkungan (EmailJS)

Tambahkan variabel lingkungan berikut ke platform hosting Anda:

```
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_5mk1t2z
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=template_yj3blyg
NEXT_PUBLIC_EMAILJS_USER_ID=WrdMD5erXU1TjP0SR
```

## Checklist Deployment Netlify

✅ File yang diperlukan:
- `next.config.mjs` - Berisi konfigurasi khusus Netlify
- `netlify.toml` - Konfigurasi untuk headers, redirects, dll
- `public/pdf.worker.min.js` - Worker untuk PDF Viewer
- `scripts/prepare-netlify.js` - Script persiapan deployment
- `scripts/deploy.sh` - Script otomatis deployment

✅ Pastikan hal berikut telah dikonfigurasi:
- Output PDF.js sudah diatur dengan benar
- SPA routing sudah diaktifkan dengan file `_redirects`
- CORS untuk worker file sudah diatur di `netlify.toml`
- Custom 404 page sudah tersedia

## Troubleshooting Cepat

**Masalah Build:**
```bash
# Bersihkan cache
npm run clean:full

# Refresh font
npm run refresh-fonts

# Build ulang dengan env vars
$env:DEPLOY_TARGET="netlify" && npm run build:netlify
```

**Masalah PDF Viewer:**
1. Pastikan `pdf.worker.min.js` ada di root folder setelah build
2. Jalankan `npm run prepare-netlify` untuk menyalin file yang diperlukan

**Masalah EmailJS:**
1. Tambahkan domain Anda di [dashboard EmailJS](https://dashboard.emailjs.com/) > Integration > Website Integration

## CI/CD dengan GitHub Actions

Untuk menggunakan GitHub Actions, pastikan file `.github/workflows/deploy-netlify.yml` sudah ada dengan secret berikut:
- `NETLIFY_AUTH_TOKEN`
- `NETLIFY_SITE_ID`

## Panduan Lengkap

Untuk panduan detail, lihat:
- [GITHUB_DEPLOYMENT_GUIDE.md](GITHUB_DEPLOYMENT_GUIDE.md) - GitHub dan GitHub Pages
- [NETLIFY_DEPLOYMENT_GUIDE.md](NETLIFY_DEPLOYMENT_GUIDE.md) - Netlify
- [README.md](README.md) - Informasi umum
- [DEPLOYMENT_TROUBLESHOOTING.md](DEPLOYMENT_TROUBLESHOOTING.md) - Pemecahan masalah detail 
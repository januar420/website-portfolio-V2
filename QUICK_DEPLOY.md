# Panduan Cepat Deployment

Dokumen ini berisi langkah-langkah cepat untuk deploy website portfolio ke berbagai platform. Panduan ini dirancang untuk eksekusi cepat bagi Anda yang sudah familiar dengan proses deployment.

## GitHub Pages (Paling Cepat)

```bash
# Pastikan gh-pages terinstall
npm install --save-dev gh-pages

# Build dan deploy ke GitHub Pages
npm run deploy:gh-pages
```

## Netlify (CLI)

```bash
# Pastikan Netlify CLI terinstall
npm install -g netlify-cli

# Login ke Netlify
netlify login

# Build website
npm run build

# Deploy ke Netlify
netlify deploy --prod
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

## Script Bantuan

Website portfolio ini menyediakan script bantuan untuk mempermudah deployment:

```bash
# Windows
initialize-github-repo.cmd

# Linux/macOS
bash initialize-github-repo.sh
```

## Troubleshooting Cepat

**Masalah Build:**
```bash
# Bersihkan cache
npm run clean:full

# Refresh font
npm run refresh-fonts

# Build ulang
npm run prepare-deploy
```

**Masalah EmailJS:**
1. Tambahkan domain Anda di [dashboard EmailJS](https://dashboard.emailjs.com/) > Integration > Website Integration

## Panduan Lengkap

Untuk panduan detail, lihat:
- [GITHUB_DEPLOYMENT_GUIDE.md](GITHUB_DEPLOYMENT_GUIDE.md) - GitHub dan GitHub Pages
- [NETLIFY_DEPLOYMENT_GUIDE.md](NETLIFY_DEPLOYMENT_GUIDE.md) - Netlify
- [README.md](README.md) - Informasi umum
- [DEPLOYMENT_TROUBLESHOOTING.md](DEPLOYMENT_TROUBLESHOOTING.md) - Pemecahan masalah detail 
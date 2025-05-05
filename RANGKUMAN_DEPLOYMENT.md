# Rangkuman Deployment

Dokumen ini merangkum opsi deployment yang tersedia untuk website portfolio ini dan memberikan perbandingan untuk membantu Anda memilih platform yang sesuai.

## Platform yang Didukung

| Platform | Kelebihan | Kekurangan | Cocok untuk |
|----------|-----------|------------|-------------|
| **GitHub Pages** | Gratis, Terintegrasi dengan GitHub | Terbatas pada static content | Portfolio sederhana |
| **Netlify** | Setup mudah, Auto-build, HTTPS | Free tier terbatas (build menit) | Portfolio dengan PDF Viewer |
| **Vercel** | Performansi tinggi, Next.js native | Free tier terbatas | Aplikasi Next.js |
| **Cloudflare Pages** | CDN global, Caching canggih | Konfigurasi lebih kompleks | Website dengan traffic tinggi |

## Konfigurasi PDF Viewer

Untuk memastikan PDF Viewer berfungsi di semua platform:

### 1. GitHub Pages
- Pastikan worker file URL diatur dengan tepat:
  ```js
  pdfjs.GlobalWorkerOptions.workerSrc = `/${REPO_NAME}/pdf.worker.min.js`;
  ```

### 2. Netlify
- File worker harus berada di root folder `/out`:
  ```
  /out/pdf.worker.min.js
  ```
- Header CORS harus dikonfigurasi di `netlify.toml`:
  ```toml
  [[headers]]
    for = "/pdf.worker.min.js"
    [headers.values]
      Access-Control-Allow-Origin = "*"
  ```

### 3. Vercel
- Vercel mendukung file worker dari folder `public`:
  ```
  /public/pdf.worker.min.js
  ```

### 4. Cloudflare Pages
- Gunakan Cloudflare worker untuk menangani CORS:
  ```js
  addEventListener('fetch', event => {
    // CORS handling untuk PDF worker
  });
  ```

## EmailJS Setup

```javascript
// Konfigurasi EmailJS di .env.local
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_5mk1t2z
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=template_yj3blyg
NEXT_PUBLIC_EMAILJS_USER_ID=WrdMD5erXU1TjP0SR
```

## Script Deployment

| Platform | Script Command | Konfigurasi |
|----------|---------------|-------------|
| GitHub Pages | `npm run deploy:gh-pages` | Otomatis setup |
| Netlify | `npm run deploy:netlify` | Dengan Netlify CLI |
| Vercel | `npm run deploy:vercel-prod` | Dengan Vercel CLI |
| Cloudflare | `npm run deploy:cloudflare` | Dengan Wrangler |

## CI/CD Setup

### GitHub Actions
- GitHub Pages: `.github/workflows/deploy.yml`
- Netlify: `.github/workflows/deploy-netlify.yml`

### Auto Deployment
- GitHub Pages: Otomatis saat push ke `main`
- Netlify: Otomatis saat push, atau dengan manual trigger
- Vercel: Otomatis saat push
- Cloudflare: Perlu setup Cloudflare workflow

## Debugging Deployment

1. Pastikan semua dependensi terpasang:
   ```bash
   npm install
   ```

2. Bersihkan cache dan build:
   ```bash
   npm run clean:full
   ```

3. Periksa log build:
   ```bash
   # Netlify
   netlify sites:list
   netlify build --debug
   
   # Vercel
   vercel logs
   ```

4. Periksa konfigurasi:
   ```bash
   # Netlify
   cat netlify.toml
   
   # Vercel
   cat vercel.json
   ```

## Bandwidth dan Limitasi

| Platform | Bandwidth Bulanan | Build Minutes | Fitur Pro |
|----------|-------------------|--------------|-----------|
| GitHub Pages | Unlimited | - | Custom Domain |
| Netlify | 100GB (Free) | 300 menit | Form Handling |
| Vercel | 100GB (Free) | Unlimited | Preview Deployments |
| Cloudflare | Unlimited | - | Web Analytics |

## Catatan Lingkungan

- **Development**: `npm run dev`
- **Production**: `npm run build && npm run start`
- **Static Export**: `npm run export`

## Referensi Lebih Lanjut

- [Dokumentasi GitHub Pages](https://docs.github.com/en/pages)
- [Panduan Netlify](https://docs.netlify.com/)
- [Vercel Documentation](https://vercel.com/docs)
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/) 
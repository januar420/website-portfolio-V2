# Panduan Deployment

## Konfigurasi GitHub Actions

Website ini dikonfigurasi untuk otomatis deploy ke Netlify menggunakan GitHub Actions.

### Secrets yang Diperlukan

Tambahkan secrets berikut di GitHub repository Anda:

1. `NETLIFY_AUTH_TOKEN`: Token autentikasi Netlify (sudah dikonfigurasi)
2. `NETLIFY_SITE_ID`: ID situs Netlify Anda (05986322-27d2-402a-a2cc-ec8c52d44aeb)

### Cara Menambahkan Secrets

1. Buka repositori GitHub Anda di browser
2. Buka "Settings" -> "Secrets and variables" -> "Actions"
3. Klik "New repository secret"
4. Tambahkan secrets dengan detail di atas

## Netlify Site

URL: https://`[netlify-subdomain]`.netlify.app
Site ID: 05986322-27d2-402a-a2cc-ec8c52d44aeb

## Cara Deploy Manual

Jalankan perintah berikut untuk deploy manual:

```bash
npm run deploy:netlify
```

## Troubleshooting

Jika mengalami masalah dengan deployment:

1. Pastikan secrets sudah dikonfigurasi dengan benar
2. Periksa log actions di GitHub repository
3. Jalankan `npm run setup-netlify` untuk memverifikasi konfigurasi Netlify


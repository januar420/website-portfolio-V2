# Panduan Pengujian Fitur Email Sebelum Deployment

Fitur pengiriman email melalui form kontak adalah salah satu fitur penting dalam website portfolio. Berikut adalah langkah-langkah untuk memastikan fitur ini berfungsi dengan baik sebelum deployment.

## 1. Persiapan Konfigurasi EmailJS

### Pastikan Kredensial EmailJS Sudah Benar

File `.env.local` harus berisi kredensial yang valid:

```
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_5mk1t2z
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=template_yj3blyg
NEXT_PUBLIC_EMAILJS_USER_ID=WrdMD5erXU1TjP0SR
```

### Tambahkan Domain ke Whitelist EmailJS

1. Login ke [dashboard EmailJS](https://dashboard.emailjs.com/)
2. Buka "Integration" > "Website Integration"
3. Tambahkan domain yang akan digunakan:
   - Untuk development: `http://localhost:3000`
   - Untuk production: domain produksi Anda (contoh: `https://yourportfolio.netlify.app`)

## 2. Pengujian Lokal

### Jalankan Aplikasi di Lokal

```bash
npm run dev
```

### Tes Form Kontak

1. Buka http://localhost:3000 di browser
2. Navigasi ke bagian Contact
3. Isi form dengan data yang valid:
   - Nama: Test User
   - Email: email_valid@example.com
   - Subject: Test Email Functionality
   - Pesan: This is a test message to verify email functionality.
4. Klik tombol "Send Direct" atau "Send via Email Client"
5. Verifikasi bahwa email diterima di alamat tujuan

### Debugging Pengiriman Email

Jika email tidak terkirim:

1. Buka DevTools browser (F12)
2. Lihat console untuk error
3. Perhatikan log debug yang ditampilkan:
   ```
   ===== FORM SUBMISSION STARTED =====
   Environment check:
   - Service ID: service_5mk1t2z
   - Template ID: template_yj3blyg
   - User ID: Available
   ```
4. Pastikan tidak ada error CORS atau authentication error

## 3. Pengujian Produksi

### Build dan Jalankan Versi Produksi

```bash
npm run build
npm run start
```

### Tes Form Kontak di Versi Produksi

Ulangi langkah pengujian form kontak seperti pada pengujian lokal.

## 4. Alternatif Jika EmailJS Bermasalah

Jika terjadi masalah dengan EmailJS, website sudah menyediakan alternatif:

1. **Via Email Client**: Menggunakan protokol `mailto:` untuk membuka email client
2. **Via WhatsApp**: Menggunakan link WhatsApp untuk mengirim pesan

## 5. Troubleshooting Umum

### Error CORS

Jika terjadi error CORS:
- Pastikan domain sudah didaftarkan di whitelist EmailJS
- Periksa apakah URL yang diakses sesuai dengan yang terdaftar

### Email tidak terkirim

Jika status pengiriman sukses tapi email tidak diterima:
- Periksa folder spam/junk di email penerima
- Verifikasi kredensial EmailJS aktif dan valid
- Pastikan quota EmailJS belum habis (free tier memiliki batasan)

### Error "Missing Template ID"

Jika terjadi error template tidak ditemukan:
- Verifikasi Template ID di dashboard EmailJS
- Pastikan template aktif dan benar

## 6. Checklist Final EmailJS

- [ ] File `.env.local` berisi kredensial yang benar
- [ ] Domain development (localhost) didaftarkan di whitelist EmailJS
- [ ] Domain produksi didaftarkan di whitelist EmailJS
- [ ] Form kontak berhasil mengirim email di lingkungan development
- [ ] Log debug tidak menunjukkan error
- [ ] Email diterima dengan format yang benar
- [ ] Alternatif pengiriman (Email Client, WhatsApp) berfungsi dengan baik 
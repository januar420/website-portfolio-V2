# Perbaikan Error Hydration pada Partikel di PremiumAchievements

Dokumen ini menjelaskan proses perbaikan error hydration pada komponen `PremiumAchievements`, khususnya pada efek partikel animasi.

## Masalah yang Ditemukan

Error React hydration terjadi dengan pesan berikut:

```
Error: A tree hydrated but some attributes of the server rendered HTML didn't match the client properties.
```

Masalah ini muncul pada posisi CSS partikel yang dinamis di komponen `PremiumAchievements`:

```jsx
<div
  className="absolute w-1.5 h-1.5 bg-primary/50 rounded-full"
  style={{
    top: "66.44668953884356%" // Di client
    top: "41.7933%" // Di server
    left: "36.607142945598284%" // Di client
    left: "28.0238%" // Di server
  }}
>
```

Penyebab utama masalah ini adalah penggunaan `Math.random()` langsung dalam style JSX:

```jsx
style={{
  top: `${Math.random() * 100}%`,
  left: `${Math.random() * 100}%`,
}}
```

Saat server rendering, `Math.random()` menghasilkan nilai yang berbeda dari nilai yang dihasilkan saat client rendering, menyebabkan ketidakcocokan hydration.

## Solusi yang Diterapkan

Perbaikan yang dilakukan meliputi:

1. **Pemisahan Generasi Konten Acak ke Sisi Client**
   - Menambahkan state untuk menandai rendering client
   - Menambahkan state untuk menyimpan posisi partikel

```jsx
const [particles, setParticles] = useState<{ top: string, left: string }[]>([])
const [isClient, setIsClient] = useState(false)
```

2. **Inisialisasi Posisi Partikel setelah Hydration**
   - Menggunakan `useEffect` untuk menjalankan kode hanya di sisi client
   - Membuat posisi acak sekali saja setelah hydration selesai

```jsx
useEffect(() => {
  // Tandai bahwa kita sekarang di client
  setIsClient(true)
  
  // Buat array dengan posisi partikel acak
  const newParticles = Array(5).fill(null).map(() => ({
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
  }))
  
  setParticles(newParticles)
}, []) // Effect ini hanya dijalankan sekali setelah mount
```

3. **Rendering Partikel Hanya di Sisi Client**
   - Memastikan partikel hanya di-render setelah hydration selesai
   - Menggunakan state `isClient` untuk mengontrol rendering

```jsx
{isClient && particles.map((particle, i) => (
  <motion.div
    key={i}
    className="absolute w-1.5 h-1.5 bg-primary/50 rounded-full"
    style={{
      top: particle.top,
      left: particle.left,
    }}
    // ...
  />
))}
```

## Prinsip yang Diterapkan

Perbaikan ini mengikuti prinsip React untuk menangani error hydration:

1. **Delayed Rendering**
   - Menggunakan `isClient && ...` untuk memastikan konten yang tergantung nilai acak hanya di-render di client

2. **Konsistensi Server-Client**
   - Memisahkan logika rendering sisi server dari logika client
   - Menunda pembuatan konten random sampai sisi client

3. **Deterministic First Render**
   - Menghindari penggunaan nilai non-deterministik seperti `Math.random()` pada rendering awal

## Praktik Terbaik untuk Menghindari Error Hydration

1. **Hindari Nilai Non-Deterministik dalam Render Awal**
   - Jangan menggunakan `Math.random()`, `Date.now()`, langsung dalam JSX/style
   - Jangan menggunakan `window` atau API browser lainnya dalam render awal

2. **Strategi Rendering**
   - Menggunakan dynamic import dengan `{ ssr: false }` untuk komponen yang hanya perlu di-render di client
   - Menggunakan pola conditional rendering dengan state `isClient`

3. **Pertimbangkan Penggunaan `useId`**
   - Untuk nilai unik yang dibutuhkan di server dan client, gunakan React `useId()` daripada solusi acak

## Hasil

Setelah perbaikan, komponen `PremiumAchievements` berhasil di-render tanpa error hydration. Animasi partikel tetap berfungsi sebagaimana mestinya, tapi kini hanya muncul di sisi client setelah hydration selesai. 
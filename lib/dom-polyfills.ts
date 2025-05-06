/**
 * DOM API Polyfills untuk Next.js
 * 
 * File ini mengekspor fungsi helper untuk menerapkan polyfill DOM API
 * yang diperlukan untuk aplikasi React dengan Server-Side Rendering.
 */

// Import dom-matrix-polyfill secara langsung untuk memastikan polyfill terdaftar
import '@/lib/dom-matrix-polyfill';

/**
 * Fungsi untuk menerapkan semua DOM polyfills yang diperlukan
 * Saat ini, ini hanya memastikan DOMMatrix polyfill dimuat
 */
export default function applyDOMPolyfills(): void {
  // DOMMatrix polyfill sudah diterapkan pada waktu impor dari dom-matrix-polyfill
  console.log('DOM polyfills applied successfully');
  
  // Pastikan DOMMatrix tersedia di global object
  if (typeof window !== 'undefined' && !window.DOMMatrix) {
    console.warn('DOMMatrix polyfill tidak terdaftar dengan benar - mencoba mendaftarkan ulang');
    // Mencoba mendaftarkan polyfill secara manual sebagai fallback
    try {
      require('@/lib/dom-matrix-polyfill');
    } catch (e) {
      console.error('Gagal mendaftarkan polyfill DOMMatrix:', e);
    }
  }
}

// Ekspor ulang untuk kompatibilitas mundur
export { default as setupPdfPolyfills } from '@/lib/dom-matrix-polyfill'; 
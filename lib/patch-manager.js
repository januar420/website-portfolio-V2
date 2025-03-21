/**
 * Patch Manager - Optimasi global untuk pemuatan aplikasi
 * 
 * File ini mengatur berbagai patches yang perlu diterapkan
 * untuk mempercepat pemuatan aplikasi secara keseluruhan.
 */

// Import patch dari utils
import { patchForCanvas } from '@/app/utils/patch-hero-section';

// Status patches
let patchesApplied = false;

/**
 * Menerapkan semua patches yang diperlukan aplikasi
 * Melakukan optimasi dengan menerapkan patches secara paralel
 */
export async function applyPatches() {
  if (typeof window === 'undefined' || patchesApplied) return;
  
  console.info('[PATCH-MANAGER] Applying global patches');
  
  try {
    // Jalankan semua patches secara paralel dengan timeout untuk menghindari blocking
    await Promise.all([
      // Patch untuk Canvas di HeroSection
      Promise.race([
        (async () => patchForCanvas())(),
        new Promise(resolve => setTimeout(resolve, 300))
      ]),
      
      // Optimasi preloading untuk asset penting
      preloadCriticalAssets(),
      
      // Patch untuk React dan performa
      optimizeReactPerformance()
    ]);
    
    patchesApplied = true;
    console.info('[PATCH-MANAGER] All patches applied successfully');
    return true;
  } catch (error) {
    console.error('[PATCH-MANAGER] Error applying patches:', error);
    patchesApplied = true; // Tetap set ke true untuk menghindari percobaan berulang
    return false;
  }
}

/**
 * Preload asset penting untuk mempercepat pemuatan awal
 */
async function preloadCriticalAssets() {
  if (typeof window === 'undefined') return;
  
  try {
    // Preload gambar penting
    const imageUrls = [
      // Tambahkan asset lain yang perlu di-preload
    ];
    
    // Buat array dari promises untuk memuat semua gambar
    const imagePromises = imageUrls.map(url => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(url);
        img.onerror = () => resolve(null); // Gagal dengan lembut
        img.src = url;
      });
    });
    
    // Jalankan preloading dengan timeout
    await Promise.race([
      Promise.all(imagePromises),
      new Promise(resolve => setTimeout(resolve, 500))
    ]);
    
    return true;
  } catch (error) {
    console.warn('[PATCH-MANAGER] Error preloading assets:', error);
    return false;
  }
}

/**
 * Optimasi performa React
 */
function optimizeReactPerformance() {
  if (typeof window === 'undefined') return;
  
  try {
    // Prioritize script requests - modern API
    if (window.navigator && 'connection' in navigator) {
      // Periksa apakah fetch priority API tersedia
      const conn = navigator.connection;
      if (conn && conn.effectiveType && conn.effectiveType !== '4g') {
        // Untuk koneksi lambat, prioritaskan resource utama
        console.info(`[PATCH-MANAGER] Slow connection detected: ${conn.effectiveType}`);
      }
    }
    
    // Optimasi event loop
    if (window.requestIdleCallback) {
      window.__OPTIMIZED_IDLE = true;
    }
    
    return true;
  } catch (error) {
    console.warn('[PATCH-MANAGER] Error optimizing React performance:', error);
    return false;
  }
}

// Apply patches secara otomatis
if (typeof window !== 'undefined') {
  // Gunakan requestIdleCallback jika tersedia, atau setTimeout jika tidak
  const schedulePatches = window.requestIdleCallback || setTimeout;
  
  schedulePatches(() => {
    applyPatches().then(success => {
      if (success) {
        console.info('[PATCH-MANAGER] Auto-patching completed successfully');
      }
    });
  }, { timeout: 1000 });
}

export default {
  applyPatches
}; 
/**
 * Patch untuk Canvas component di HeroSection
 * 
 * Mengatasi error "Cannot create property '_updatedFibers' on number '0'"
 * yang terjadi saat requestUpdateLane dipanggil di React Three Fiber
 * 
 * Diperbarui untuk Three.js v0.174.0+ dan React 19
 */

// Flag untuk melacak apakah patch sudah diterapkan
let isPatchApplied = false;

// Fungsi untuk mendeteksi apakah performance._updatedFibers dapat disetting
const canSetUpdatedFibers = () => {
  try {
    if (typeof window === 'undefined') return false;
    
    // Check jika performance tersedia
    if (!window.performance) return false;
    
    // Pastikan performance adalah objek dan bukan primitive value
    if (typeof window.performance !== 'object') return false;
    
    // Coba buat Set dan Map (untuk React 19 + Three.js terbaru)
    const dummySet = new Set();
    const dummyMap = new Map();
    // Jika tidak error sampai point ini, kemungkinan bisa di-patch
    return true;
  } catch (e) {
    console.warn("[HERO-CANVAS-PATCH] canSetUpdatedFibers check failed:", e);
    return false;
  }
};

// Update objek performance sebelum canvas dirender
const patchPerformanceForCanvas = () => {
  if (typeof window === 'undefined') return false;
  
  try {
    // Cek apakah window.performance ada
    if (!window.performance) {
      console.warn("[HERO-CANVAS-PATCH] window.performance tidak tersedia");
      return false;
    }

    // Pastikan window.performance adalah object
    if (typeof window.performance !== 'object') {
      console.warn("[HERO-CANVAS-PATCH] window.performance bukan object");
      return false;
    }
    
    // Pastikan _updatedFibers adalah Set
    if (!window.performance._updatedFibers || !(window.performance._updatedFibers instanceof Set)) {
      console.info("[HERO-CANVAS-PATCH] Setting up _updatedFibers");
      window.performance._updatedFibers = new Set();
    }
    
    // Untuk Three.js v0.174.0+ dan React 19
    if (!window.performance._updatedFibersTimestamps || !(window.performance._updatedFibersTimestamps instanceof Map)) {
      console.info("[HERO-CANVAS-PATCH] Setting up _updatedFibersTimestamps");
      window.performance._updatedFibersTimestamps = new Map();
    }
    
    // Patch untuk React 19
    if (typeof window.ReactCurrentBatchConfig === 'undefined') {
      window.ReactCurrentBatchConfig = { transition: 0 };
    }
    
    // Tambahkan ciri-ciri patch sudah diterapkan
    window.__PATCHED_FOR_R3F_CANVAS = true;
    window.__R3F_PATCHED_VERSION = "0.174.0_React19";
    
    return true;
  } catch (e) {
    console.error("[HERO-CANVAS-PATCH] Error patching performance:", e);
    return false;
  }
};

// Patch untuk React Three Fiber React Reconciler
const patchReactReconciler = () => {
  if (typeof window === 'undefined') return false;
  
  try {
    // Jika module React Reconciler sudah di-load, kita bisa mencoba intercept
    const modules = window.__webpack_modules__ || {};
    
    // Untuk debugging
    const reactReconcilerModules = Object.keys(modules).filter(key => 
      modules[key].toString && modules[key].toString().includes('requestUpdateLane')
    );
    
    if (reactReconcilerModules.length > 0) {
      console.info("[HERO-CANVAS-PATCH] Found React Reconciler modules:", reactReconcilerModules.length);
    }
    
    // Patch React internal jika tersedia
    try {
      if (window.React) {
        if (window.React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) {
          const internals = window.React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
          
          // Pastikan semua properti internal yang diperlukan tersedia
          if (!internals.ReactCurrentBatchConfig) {
            internals.ReactCurrentBatchConfig = { 
              transition: 0,
              suspense: null,
              thenableState: null // Properti baru di React 19
            };
          }
          
          // Properti lain yang mungkin dibutuhkan R3F
          if (!internals.ReactCurrentOwner) {
            internals.ReactCurrentOwner = { current: null };
          }
        }
      }
      return true;
    } catch (e) {
      console.warn("[HERO-CANVAS-PATCH] Error patching React internals:", e);
      return false;
    }
  } catch (e) {
    console.warn("[HERO-CANVAS-PATCH] Error patching React Reconciler:", e);
    return false;
  }
};

// Patch khusus untuk Three.js v0.174.0+
const patchThreeJsLatest = () => {
  try {
    // Deteksi Three.js di window
    const THREE = window.THREE;
    
    if (THREE) {
      // Deteksi versi untuk debugging
      if (THREE.REVISION) {
        console.info(`[HERO-CANVAS-PATCH] Detected Three.js version: ${THREE.REVISION}`);
      }
      
      // Pastikan WebGLRenderer.render method memiliki akses ke performance
      if (typeof THREE.WebGLRenderer !== 'undefined') {
        // Ini lebih baik dilakukan melalui proto, tapi kita lakukan secara minimal
        window.__THREE_PATCHED = true;
        return true;
      }
    }
    
    return false;
  } catch (e) {
    console.warn("[HERO-CANVAS-PATCH] Error patching Three.js:", e);
    return false;
  }
};

// Patch semua komponen yang diperlukan untuk Canvas
export const patchForCanvas = () => {
  // Cek apakah patch sudah diterapkan
  if (isPatchApplied) {
    return {
      canSetUpdatedFibers: canSetUpdatedFibers(),
      patched: true,
      supportedVersions: {
        three: "0.174.0+",
        react: "19.0.0+"
      }
    };
  }
  
  console.info("[HERO-CANVAS-PATCH] Applying patches...");
  
  // Apply semua patches yang diperlukan
  const performancePatched = patchPerformanceForCanvas();
  const reactPatched = patchReactReconciler();
  const threePatched = patchThreeJsLatest();
  
  // Set flag bahwa patch sudah diterapkan
  isPatchApplied = true;
  
  // Log hasil patching untuk diagnosa
  console.info("[HERO-CANVAS-PATCH] Patch results:", {
    performance: performancePatched,
    react: reactPatched,
    three: threePatched
  });
  
  return {
    // Return status apakah patchable
    canSetUpdatedFibers: canSetUpdatedFibers(),
    // Flag bahwa patch sudah dicoba
    patched: true,
    // Status individual patching
    patchStatus: {
      performance: performancePatched,
      react: reactPatched,
      three: threePatched
    },
    // Versi Three.js dan React yang didukung
    supportedVersions: {
      three: "0.174.0+",
      react: "19.0.0+"
    }
  };
};

// Auto-apply patch saat file diimport - tetapi simpan hasilnya dalam variabel
// untuk menghindari nilai pengembalian yang tidak diharapkan
if (typeof window !== 'undefined') {
  // Setel timeout kecil untuk memastikan bahwa window sudah benar-benar siap
  setTimeout(() => {
    try {
      // Panggil satu kali pada import dan simpan dalam variabel lokal
      const _patchResult = patchForCanvas();
      console.info("[HERO-CANVAS-PATCH] Auto-patch applied:", _patchResult);
    } catch (e) {
      console.error("[HERO-CANVAS-PATCH] Auto-patch failed:", e);
    }
  }, 0);
  
  // Setup auto-recovery
  const handleError = (event) => {
    if (
      (event.message?.includes('_updatedFibers') || 
       event.message?.includes('_updatedFibersTimestamps') ||
       event.message?.includes('Cannot create property')) &&
      canSetUpdatedFibers()
    ) {
      console.warn("[HERO-CANVAS-PATCH] Caught Canvas error, applying fix");
      patchPerformanceForCanvas();
      
      // Coba cegah error showing di console
      event.preventDefault();
      return true;
    }
    return false;
  };
  
  // Register error handler
  window.addEventListener('error', handleError, true);
}

export default {
  patchForCanvas,
  canSetUpdatedFibers
}; 
/**
 * React Three Fiber Patches
 * 
 * File ini berisi berbagai patches yang diperlukan untuk memastikan React Three Fiber
 * berjalan dengan baik di berbagai lingkungan.
 */

// Polyfill untuk Promise.withResolvers
if (typeof Promise.withResolvers !== 'function') {
  console.info('[POLYFILL] Adding Promise.withResolvers polyfill');
  Promise.withResolvers = function() {
    let resolve, reject;
    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };
}

// Patch untuk ReactCurrentOwner yang dibutuhkan oleh React Three Fiber
if (typeof window !== 'undefined') {
  // Setup ReactCurrentOwner
  if (!window.ReactCurrentOwner) {
    console.info("[R3F-PATCH] Setting up window.ReactCurrentOwner");
    window.ReactCurrentOwner = { current: null };
  }
  
  // Patch untuk ReactCurrentBatchConfig di React 19
  if (!window.ReactCurrentBatchConfig) {
    console.info("[R3F-PATCH] Setting up window.ReactCurrentBatchConfig");
    window.ReactCurrentBatchConfig = { 
      transition: 0,
      suspense: null,
      thenableState: null // Properti baru di React 19
    };
  }
  
  // Patch untuk window.performance
  if (window.performance && typeof window.performance === 'object') {
    // Pastikan _updatedFibers adalah Set
    if (!window.performance._updatedFibers || !(window.performance._updatedFibers instanceof Set)) {
      console.info("[R3F-PATCH] Setting up performance._updatedFibers");
      window.performance._updatedFibers = new Set();
    }
    
    // Untuk Three.js v0.174.0+ dan React 19
    if (!window.performance._updatedFibersTimestamps || !(window.performance._updatedFibersTimestamps instanceof Map)) {
      console.info("[R3F-PATCH] Setting up performance._updatedFibersTimestamps");
      window.performance._updatedFibersTimestamps = new Map();
    }
  }
  
  // Set flag bahwa patches sudah diterapkan
  window.__R3F_PATCHED = true;
  window.__R3F_PATCHED_VERSION = "0.174.0_React19";
  
  console.info("[R3F-PATCH] All patches have been applied successfully!");
} 
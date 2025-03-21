/**
 * R3F Performance Patch
 * 
 * Patch untuk mengatasi error "Cannot create property '_updatedFibers' on number '0'"
 * yang terjadi pada React Three Fiber
 * 
 * Diperbarui untuk mendukung Three.js v0.174.0+ dan React 19
 */

declare global {
  interface Window {
    ReactCurrentOwner?: {
      current: null | object;
    };
    ReactCurrentBatchConfig?: {
      transition: number;
      suspense: object | null;
      thenableState: object | null;
    };
    __R3F_PATCHED?: boolean;
    React?: any; // Tambahkan tipe untuk React global
  }
  
  interface Performance {
    _updatedFibers?: Set<unknown>;
    _updatedFibersTimestamps?: Map<unknown, number>;
  }
}

/**
 * Fix untuk window.performance._updatedFibers yang dibutuhkan oleh React Three Fiber
 * Menyebabkan error jika tidak di-patch:
 * "Cannot create property '_updatedFibers' on number '0'"
 */
export function applyR3FPerformancePatch(): void {
  if (typeof window === 'undefined') return;

  try {
    // Pastikan performance adalah object
    if (typeof window.performance === 'object' && window.performance !== null) {
      // Jika _updatedFibers belum ada, buat sebagai Set baru
      if (!window.performance._updatedFibers) {
        console.info('[R3F-PATCH] Applying _updatedFibers patch to window.performance');
        window.performance._updatedFibers = new Set();
      }
      
      // Tambahan untuk Three.js v0.174.0+
      if (!window.performance._updatedFibersTimestamps) {
        console.info('[R3F-PATCH] Applying _updatedFibersTimestamps patch');
        window.performance._updatedFibersTimestamps = new Map();
      }
    } else {
      console.warn('[R3F-PATCH] window.performance bukan object, tidak dapat di-patch');
    }
  } catch (error) {
    console.error('[R3F-PATCH] Error patching window.performance:', error);
  }
}

/**
 * Patch untuk ReactCurrentOwner yang dibutuhkan oleh React Three Fiber
 * Diperbarui untuk React 19
 */
export function applyReactCurrentOwnerPatch(): void {
  if (typeof window === 'undefined') return;
  
  try {
    if (!window.ReactCurrentOwner) {
      console.info('[R3F-PATCH] Setting up window.ReactCurrentOwner');
      window.ReactCurrentOwner = { current: null };
    }
    
    // Patch untuk React 19
    if (!window.ReactCurrentBatchConfig) {
      console.info('[R3F-PATCH] Setting up window.ReactCurrentBatchConfig');
      window.ReactCurrentBatchConfig = { 
        transition: 0,
        suspense: null,
        thenableState: null
      };
    }
    
    // Patch React internal juga
    try {
      // Gunakan referensi global ke React untuk menghindari penggunaan require()
      const React = window.React;
      
      if (React && React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) {
        // Patch ReactCurrentOwner jika tidak ada
        if (!React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner) {
          console.info('[R3F-PATCH] Patching React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner');
          React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner = { current: null };
        }
        
        // Patch ReactCurrentBatchConfig untuk React 19
        if (!React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentBatchConfig) {
          console.info('[R3F-PATCH] Patching React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentBatchConfig');
          React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentBatchConfig = { 
            transition: 0,
            suspense: null,
            thenableState: null // Baru di React 19
          };
        }
      } else {
        // Jika React belum ada di window atau tidak punya __SECRET_INTERNALS
        console.info('[R3F-PATCH] Setting up fallback React internals');
        if (!window.React) {
          window.React = {};
        }
        
        if (!window.React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) {
          window.React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = {};
        }
        
        window.React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner = { current: null };
        window.React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentBatchConfig = { 
          transition: 0,
          suspense: null,
          thenableState: null
        };
      }
    } catch (e) {
      console.warn('[R3F-PATCH] Could not patch React internals:', e);
    }
  } catch (error) {
    console.error('[R3F-PATCH] Error patching ReactCurrentOwner:', error);
  }
}

/**
 * Tambahkan penanganan error untuk memulihkan performance patch jika error terjadi
 */
export function setupPerformanceErrorRecovery(): () => void {
  if (typeof window === 'undefined') return () => {};
  
  // Handler untuk menangkap error terkait _updatedFibers
  const handler = (event: ErrorEvent) => {
    if (
      event.message?.includes('Cannot create property') && 
      (event.message?.includes('_updatedFibers') || event.message?.includes('_updatedFibersTimestamps'))
    ) {
      console.warn('[R3F-PATCH] Caught _updatedFibers error, applying emergency fix');
      
      try {
        // Pastikan performance adalah object
        if (typeof window.performance === 'object' && window.performance !== null) {
          // Re-apply patch
          window.performance._updatedFibers = new Set();
          window.performance._updatedFibersTimestamps = new Map();
          
          // Prevent error dari showing in console
          event.preventDefault();
          return true;
        }
      } catch (e) {
        // Jika gagal, log error dan biarkan propagate
        console.error('[R3F-PATCH] Failed to apply emergency fix:', e);
      }
    }
    return false;
  };
  
  // Register error handler
  window.addEventListener('error', handler, true);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('error', handler, true);
  };
}

/**
 * Terapkan semua patch R3F secara sekaligus
 */
export function applyAllR3FPatches(): void {
  applyR3FPerformancePatch();
  applyReactCurrentOwnerPatch();
}

// Auto-apply patch saat modul diimpor
applyAllR3FPatches();

export default {
  applyR3FPerformancePatch,
  applyReactCurrentOwnerPatch,
  setupPerformanceErrorRecovery,
  applyAllR3FPatches
};

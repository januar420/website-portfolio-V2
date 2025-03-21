/**
 * Utility untuk memperbaiki masalah kompatibilitas React Three Fiber dengan React 18
 */

// Definisikan konstanta untuk memastikan konsistensi pesan
const LOG_PREFIX = '[R3F-PATCH]';

/**
 * Patch React dan globalThis untuk mengatasi masalah webpack bundling
 */
export function patchGlobalScope() {
  if (typeof globalThis === 'undefined') return false;

  try {
    // 1. Patch global ReactCurrentOwner untuk webpack
    if (!(globalThis as any).ReactCurrentOwner) {
      console.info(`${LOG_PREFIX} Setting up global ReactCurrentOwner for webpack`);
      (globalThis as any).ReactCurrentOwner = { current: null };
    }

    // 2. Pastikan global React tersedia jika belum ada
    if (!(globalThis as any).React) {
      console.info(`${LOG_PREFIX} Setting up global React object`);
      (globalThis as any).React = {
        __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: {
          ReactCurrentOwner: { current: null },
          ReactCurrentBatchConfig: { transition: 0 }
        }
      };
    }
    
    return true;
  } catch (error) {
    console.error(`${LOG_PREFIX} Error patching global scope:`, error);
    return false;
  }
}

/**
 * Patch untuk mengatasi masalah ReactCurrentOwner yang terjadi dengan React Three Fiber dan React 18
 */
export function patchReactInternals() {
  if (typeof window === 'undefined') return false;

  try {
    // Patch window.ReactCurrentOwner
    if (!(window as any).ReactCurrentOwner) {
      console.info(`${LOG_PREFIX} Setting up global ReactCurrentOwner`);
      (window as any).ReactCurrentOwner = { current: null };
    }
    
    // Patch React internal APIs - dengan pendekatan yang lebih robust
    try {
      // Gunakan modul React yang sudah tersedia di global, bukan require
      const React = (window as any).React || (globalThis as any).React;
      
      if (React && React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) {
        const internals = React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
        
        if (!internals.ReactCurrentOwner) {
          console.info(`${LOG_PREFIX} Patching React internal ReactCurrentOwner`);
          internals.ReactCurrentOwner = { current: null };
        }
        
        // React 18 Concurrent Rendering fields
        if (!internals.ReactCurrentBatchConfig) {
          internals.ReactCurrentBatchConfig = { transition: 0 };
        }
      } else {
        // Tidak perlu require, cukup gunakan referensi global
        console.info(`${LOG_PREFIX} Setting up React internals fallback`);
        if (!(window as any).React) {
          (window as any).React = {
            __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: {
              ReactCurrentOwner: { current: null },
              ReactCurrentBatchConfig: { transition: 0 }
            }
          };
        }
      }
    } catch (e) {
      console.warn(`${LOG_PREFIX} Could not patch React internals directly:`, e);
      
      // Sebagai fallback, coba inject ke window.React
      if (!(window as any).React) {
        console.info(`${LOG_PREFIX} Setting up window.React as fallback`);
        (window as any).React = {
          __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: {
            ReactCurrentOwner: { current: null },
            ReactCurrentBatchConfig: { transition: 0 }
          }
        };
      }
    }
    
    // Pastikan window.__THREE__ tersedia
    if (!(window as any).__THREE__) {
      console.info(`${LOG_PREFIX} Initializing THREE global`);
      (window as any).__THREE__ = {};
    }
    
    return true;
  } catch (error) {
    console.error(`${LOG_PREFIX} Error patching React internals:`, error);
    return false;
  }
}

/**
 * Patch React Three Fiber
 */
export function patchReactThreeFiber() {
  if (typeof window === 'undefined') return false;
  
  try {
    // Di sini kita tidak lagi me-monkey patch require(),
    // sebagai gantinya, kita memastikan ReactCurrentOwner tersedia secara global
    if (!(window as any).ReactCurrentOwner) {
      console.info(`${LOG_PREFIX} Pre-patching ReactCurrentOwner before reconciler load`);
      (window as any).ReactCurrentOwner = { current: null };
    }
    
    return true;
  } catch (error) {
    console.warn(`${LOG_PREFIX} Error patching React Three Fiber:`, error);
    return false;
  }
}

/**
 * Patch Three.js untuk bekerja lebih baik dengan React 18
 */
export function patchThreeJs() {
  if (typeof window === 'undefined') return false;

  try {
    // Gunakan referensi THREE dari global scope jika tersedia
    const THREE = (window as any).THREE;
    
    if (!THREE) {
      console.warn(`${LOG_PREFIX} THREE not found in global scope, cannot patch`);
      return false;
    }
    
    // Pastikan WebGLRenderer memiliki fallback context restoration
    const originalWebGLRenderer = THREE.WebGLRenderer;
    if (originalWebGLRenderer && !THREE._patchedRenderer) {
      THREE._patchedRenderer = true;
      
      // Override WebGLRenderer untuk menambahkan penanganan context loss
      THREE.WebGLRenderer = function(...args: any[]) {
        const renderer = new originalWebGLRenderer(...args);
        
        // Tambahkan event listener untuk context loss/restoration
        if (renderer.domElement) {
          renderer.domElement.addEventListener('webglcontextlost', (event: Event) => {
            event.preventDefault();
            console.warn(`${LOG_PREFIX} WebGL context lost, will attempt to restore`);
            
            // Trigger restoration after short delay
            setTimeout(() => {
              if (renderer.setAnimationLoop) {
                renderer.setAnimationLoop(null);
                console.info(`${LOG_PREFIX} Animation loop paused for context restoration`);
              }
            }, 0);
          });
          
          renderer.domElement.addEventListener('webglcontextrestored', () => {
            console.info(`${LOG_PREFIX} WebGL context restored`);
            
            // Force renderer reset
            if (renderer.info && renderer.info.reset) {
              renderer.info.reset();
            }
          });
        }
        
        return renderer;
      };
      
      // Copy all properties from the original constructor
      for (const prop in originalWebGLRenderer) {
        if (Object.prototype.hasOwnProperty.call(originalWebGLRenderer, prop)) {
          THREE.WebGLRenderer[prop] = originalWebGLRenderer[prop];
        }
      }
      
      // Ensure prototype chain is maintained
      THREE.WebGLRenderer.prototype = originalWebGLRenderer.prototype;
    }
    
    return true;
  } catch (error) {
    console.error(`${LOG_PREFIX} Error patching Three.js:`, error);
    return false;
  }
}

/**
 * Memastikan THREE tersedia di global scope
 */
export function ensureThreeGlobal() {
  if (typeof window === 'undefined') return false;
  
  // Gunakan dynamic import untuk Three.js jika diperlukan
  // Ini lebih aman daripada require() langsung
  if (!(window as any).THREE) {
    console.info(`${LOG_PREFIX} THREE not found in global scope, will be loaded dynamically when needed`);
    // Catatan: kita tidak melakukan import di sini, tapi mengandalkan three.js yang sudah
    // di-import secara reguler di tempat lain dalam aplikasi
  }
  
  return true;
}

/**
 * Apply all patches in one function call
 */
export function applyAllR3FPatches() {
  // Pertama patch global scope untuk webpack
  const globalPatched = patchGlobalScope();
  
  // Patch internal React dan React Three Fiber
  const reactPatched = patchReactInternals();
  const r3fPatched = patchReactThreeFiber();
  
  // Pastikan THREE tersedia secara global
  const threeGlobal = ensureThreeGlobal();
  
  // Patch THREE hanya jika tersedia
  const threePatched = threeGlobal ? patchThreeJs() : false;
  
  return {
    globalPatched,
    reactPatched,
    r3fPatched,
    threePatched,
    success: globalPatched && reactPatched
  };
} 
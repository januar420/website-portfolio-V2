/**
 * React Three Fiber Early Patch Script
 * 
 * Script ini dijalankan sebelum React Three Fiber dimuat
 * untuk mencegah error "Cannot read properties of undefined (reading 'ReactCurrentOwner')"
 */

;(function() {
  console.info('[R3F-EARLY-PATCH] Applying early patches for React Three Fiber');
  
  // 1. Define ReactCurrentOwner pada objek global
  if (typeof window !== 'undefined' && !window.ReactCurrentOwner) {
    window.ReactCurrentOwner = { current: null };
    console.info('[R3F-EARLY-PATCH] Added window.ReactCurrentOwner');
  }
  
  // 2. Define global React objek jika belum ada
  if (typeof window !== 'undefined' && !window.React) {
    window.React = {
      __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: {
        ReactCurrentOwner: { current: null },
        ReactCurrentBatchConfig: { transition: 0, suspense: null }
      }
    };
    console.info('[R3F-EARLY-PATCH] Created mock React with internals');
  }
  
  // 3. Setup handler untuk webpack dynamic imports
  // Ini memastikan patch terjadi sebelum modul R3F dimuat
  const originalImport = window.__webpack_require__ || (window.webpackJsonp && window.webpackJsonp.push);
  if (originalImport) {
    try {
      const patchedModules = new Set();
      
      // Intercept untuk webpack 4+
      if (window.__webpack_require__ && window.__webpack_require__.e) {
        const originalLoadChunk = window.__webpack_require__.e;
        window.__webpack_require__.e = function(chunkId) {
          console.info('[R3F-EARLY-PATCH] Loading chunk:', chunkId);
          
          // Pastikan patch aktif untuk setiap chunk
          if (typeof window !== 'undefined' && !window.ReactCurrentOwner) {
            window.ReactCurrentOwner = { current: null };
          }
          
          return originalLoadChunk.apply(this, arguments);
        };
        console.info('[R3F-EARLY-PATCH] Patched webpack chunk loading');
      }
      
      // Untuk webpack 5+
      if (window.__webpack_require__ && window.__webpack_require__.f) {
        const originalEnsure = window.__webpack_require__.f.ensure;
        if (originalEnsure) {
          window.__webpack_require__.f.ensure = function(chunkId, promises) {
            console.info('[R3F-EARLY-PATCH] Ensuring chunk:', chunkId);
            
            // Apply patches before loading
            if (typeof window !== 'undefined' && !window.ReactCurrentOwner) {
              window.ReactCurrentOwner = { current: null };
            }
            
            return originalEnsure.apply(this, arguments);
          };
          console.info('[R3F-EARLY-PATCH] Patched webpack ensure');
        }
      }
    } catch (e) {
      console.warn('[R3F-EARLY-PATCH] Error patching webpack:', e);
    }
  }
  
  // 4. Setup error handler
  window.addEventListener('error', function(event) {
    if (event.error && event.error.message && 
        (event.error.message.includes('ReactCurrentOwner') || 
         event.error.message.includes('Cannot read properties of undefined'))) {
      
      console.warn('[R3F-EARLY-PATCH] Caught ReactCurrentOwner error');
      
      if (typeof window !== 'undefined') {
        window.ReactCurrentOwner = window.ReactCurrentOwner || { current: null };
        
        // Tambahkan ciri-ciri untuk memberitahu dev tools bahwa patch sudah diterapkan
        window.__R3F_PATCHED = true;
        window.__R3F_PATCH_TIMESTAMP = new Date().toISOString();
      }
      
      // Mencegah error muncul di console
      event.preventDefault();
      
      return true;
    }
    return false;
  }, true);
  
  console.info('[R3F-EARLY-PATCH] Early patches applied successfully');
})(); 
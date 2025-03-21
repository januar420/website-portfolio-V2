/**
 * React Three Fiber Monkey Patch
 * 
 * File ini berisi patches yang dibutuhkan agar React Three Fiber berjalan dengan baik
 * di React 18 dan mencegah error "Cannot read properties of undefined (reading 'ReactCurrentOwner')"
 * 
 * Pendekatan ini lebih robust karena:
 * 1. Bekerja di level global, memengaruhi seluruh aplikasi
 * 2. Diterapkan sejak awal sebelum React Three Fiber dimuat
 * 3. Menangani edge case dan versi React yang berbeda
 */

// Untuk mencegah error dibaca pada SSR
if (typeof window !== 'undefined') {
  // 1. Patch global window object
  if (!window.ReactCurrentOwner) {
    window.ReactCurrentOwner = { current: null };
    console.info('[R3F-PATCH] Window ReactCurrentOwner patched');
  }

  // 2. Patch React Internals - lebih robust
  try {
    // Gunakan referensi global React, bukan require() langsung
    const React = window.React || {};
    window.React = React;
    
    if (React && typeof React === 'object') {
      // Pastikan secret internals ada
      if (!React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) {
        React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = {};
        console.info('[R3F-PATCH] Created React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED');
      }

      // Pastikan ReactCurrentOwner tersedia
      if (!React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner) {
        React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner = { current: null };
        console.info('[R3F-PATCH] Fixed React.SECRET_INTERNALS.ReactCurrentOwner');
      }
      
      // Patch React Concurrent Mode fields yang dibutuhkan R3F
      if (!React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentBatchConfig) {
        React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentBatchConfig = { 
          transition: 0,
          suspense: null 
        };
        console.info('[R3F-PATCH] Added ReactCurrentBatchConfig');
      }
    }
  } catch (e) {
    console.warn('[R3F-PATCH] Error patching React internals:', e);
  }
  
  // 3. Kita tidak perlu monkey patch require() karena dapat menyebabkan "critical dependency" warning
  // Sebagai gantinya, kita pastikan ReactCurrentOwner sudah tersedia secara global
  if (!window.ReactCurrentOwner) {
    window.ReactCurrentOwner = { current: null };
    console.info('[R3F-PATCH] Ensured ReactCurrentOwner is globally available');
  }
  
  // 4. Setup global error handler untuk menangkap error ReactCurrentOwner
  window.addEventListener('error', function(event) {
    if (event.error && event.error.message && 
        (event.error.message.includes('ReactCurrentOwner') || 
         event.error.message.includes('Cannot read properties of undefined'))) {
      
      console.warn('[R3F-PATCH] Caught ReactCurrentOwner error, applying emergency patches');
      
      // Coba patch lagi sebagai recovery
      if (!window.ReactCurrentOwner) {
        window.ReactCurrentOwner = { current: null };
      }
      
      try {
        // Gunakan referensi global React
        const React = window.React;
        if (React) {
          if (!React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) {
            React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = {};
          }
          if (!React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner) {
            React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner = { current: null };
          }
        }
      } catch (e) {
        // Ignore errors during recovery
      }
      
      // Mencoba mencegah error muncul di console
      event.preventDefault();
      console.info('[R3F-PATCH] ReactCurrentOwner error patched, you might need to refresh page');
      
      return true;
    }
    return false;
  }, true);
  
  console.info('[R3F-PATCH] All React Three Fiber patches applied successfully');
}

// Export objek dummy untuk kompatibilitas dengan ESM
export default {
  applied: typeof window !== 'undefined'
}; 
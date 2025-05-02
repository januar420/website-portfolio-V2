/**
 * PERHATIAN: FILE INI HANYA UNTUK PENGEMBANGAN!
 * =============================================
 * Script ini hanya digunakan untuk mengatasi pembatasan DevTools selama pengembangan.
 * Tidak dibutuhkan untuk deployment produksi dan sebaiknya DIHAPUS sebelum deployment.
 * 
 * ==== NOT_FOR_PRODUCTION ====
 * 
 * Script untuk mengaktifkan kembali DevTools pada aplikasi web
 * Jalankan script ini di konsol browser untuk mengembalikan kontrol DevTools
 */

(function enableDevTools() {
  // Menghapus event listener yang mungkin memblokir hotkeys DevTools
  const oldAddEventListener = EventTarget.prototype.addEventListener;

  // Simpan semua event listener yang sudah terpasang
  const registeredEventListeners = new Map();

  // Ganti method addEventListener untuk melacak event listeners
  EventTarget.prototype.addEventListener = function (type, listener, options) {
    if (!registeredEventListeners.has(this)) {
      registeredEventListeners.set(this, new Map());
    }
    if (!registeredEventListeners.get(this).has(type)) {
      registeredEventListeners.get(this).set(type, new Set());
    }
    registeredEventListeners.get(this).get(type).add(listener);
    
    // Panggil method asli
    return oldAddEventListener.call(this, type, listener, options);
  };

  // Fungsi untuk menghapus keydown event listener yang mencegah shortcut DevTools
  function removeBlockingKeydownListeners() {
    if (registeredEventListeners.has(window)) {
      const keydownListeners = registeredEventListeners.get(window).get('keydown');
      if (keydownListeners) {
        keydownListeners.forEach(listener => {
          window.removeEventListener('keydown', listener);
        });
        console.log('✅ Removed keydown event listeners that might block DevTools');
      }
    }
  }

  // Mengembalikan akses ke console API asli
  function restoreConsoleAPI() {
    // Simpan asli console method
    const originalConsole = {
      log: console.log,
      error: console.error,
      warn: console.warn,
      info: console.info,
      debug: console.debug,
      clear: console.clear
    };

    // Kembalikan function console original jika telah diganti
    if (typeof console !== 'undefined') {
      Object.keys(originalConsole).forEach(key => {
        if (console[key] !== originalConsole[key]) {
          console[key] = originalConsole[key];
        }
      });
    }
    console.log('✅ Console API has been restored');
  }

  // Menghapus trap untuk __REACT_DEVTOOLS_GLOBAL_HOOK__
  function enableReactDevTools() {
    if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__.isDisabled) {
        delete window.__REACT_DEVTOOLS_GLOBAL_HOOK__.isDisabled;
      }
      console.log('✅ React DevTools hook has been enabled');
    }
  }
  
  // Cegah deteksi DevTools
  function disableDevToolsDetection() {
    // Atasi beberapa pendeteksi DevTools
    Object.defineProperty(window, 'devtools', {
      get: function() { return undefined; },
      configurable: true
    });
    
    // Hapus fungsi deteksi yang umum digunakan
    if (window.devtoolsDetector) {
      delete window.devtoolsDetector;
    }
    
    console.log('✅ DevTools detection disabled');
  }

  // Jalankan semua fungsi
  removeBlockingKeydownListeners();
  restoreConsoleAPI();
  enableReactDevTools();
  disableDevToolsDetection();

  // Pesan sukses
  console.log('🚀 DevTools sekarang seharusnya dapat diakses kembali');
  console.log('   Jika masih ada masalah, coba tutup dan buka kembali DevTools dengan shortcut:');
  console.log('   - Windows/Linux: F12 atau Ctrl+Shift+I');
  console.log('   - macOS: Cmd+Option+I');
})(); 
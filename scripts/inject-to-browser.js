/**
 * PERHATIAN: FILE INI HANYA UNTUK PENGEMBANGAN!
 * =============================================
 * Script ini hanya digunakan untuk mengatasi pembatasan DevTools selama pengembangan.
 * Tidak dibutuhkan untuk deployment produksi dan sebaiknya DIHAPUS sebelum deployment.
 * 
 * ==== NOT_FOR_PRODUCTION ====
 * 
 * Script untuk mengatasi pembatasan DevTools
 * Salin seluruh isi file ini dan paste ke konsol browser
 */

// IIFE (Immediately Invoked Function Expression) untuk membatasi scope
(function() {
  console.log('🔍 Mulai deteksi pembatasan DevTools...');
  
  // === BAGIAN 1: MENGEMBALIKAN AKSES KE KONSOL API ===
  const originalConsole = {
    log: console.log.bind(console),
    error: console.error.bind(console),
    warn: console.warn.bind(console),
    info: console.info.bind(console),
    debug: console.debug.bind(console),
    clear: console.clear.bind(console)
  };
  
  // Kembalikan function console original jika telah diganti
  Object.keys(originalConsole).forEach(key => {
    console[key] = originalConsole[key];
  });
  
  console.log('✅ Console API telah dikembalikan');
  
  // === BAGIAN 2: BATALKAN EVENT LISTENER YANG MEMBLOKIR ===
  
  // Salin fungsi addEventListener asli
  const originalAddEventListener = window.EventTarget.prototype.addEventListener;
  const originalRemoveEventListener = window.EventTarget.prototype.removeEventListener;
  
  // Ganti dengan fungsi kita sendiri untuk mencegat event pendeteksi DevTools
  window.EventTarget.prototype.addEventListener = function(type, listener, options) {
    // Hindari listener yang memblokir keyboard
    if (type === 'keydown' || type === 'keyup' || type === 'keypress') {
      // Simpan fungsi listener asli
      const originalListener = listener;
      
      // Ganti dengan fungsi yang memastikan kunci DevTools tidak diblokir
      const newListener = function(event) {
        // Jika event adalah shortcut untuk DevTools, izinkan event default
        if ((event.key === 'F12') || 
            ((event.key === 'I' || event.key === 'i' || event.key === 'J' || event.key === 'j' || event.key === 'C' || event.key === 'c') && 
             (event.ctrlKey || event.metaKey) && event.shiftKey)) {
          console.log('🔑 Shortcut DevTools terdeteksi dan diizinkan');
          return;
        }
        // Untuk event lain, panggil listener asli
        return originalListener.apply(this, arguments);
      };
      
      // Panggil addEventListener asli dengan listener baru
      return originalAddEventListener.call(this, type, newListener, options);
    }
    
    // Untuk jenis event lain, lanjutkan seperti biasa
    return originalAddEventListener.call(this, type, listener, options);
  };
  
  console.log('✅ Pemblokiran shortcut keyboard dihapus');
  
  // === BAGIAN 3: BATALKAN DETEKSI DEVTOOLS ===
  
  // Beberapa situs menggunakan properti window.devtools 
  // untuk mendeteksi apakah DevTools terbuka
  Object.defineProperty(window, 'devtools', {
    get: function() { return undefined; },
    set: function() { },
    configurable: true
  });
  
  // Beberapa situs menggunakan ukuran jendela untuk deteksi
  const originalGetComputedStyle = window.getComputedStyle;
  window.getComputedStyle = function(element, pseudoElt) {
    const result = originalGetComputedStyle(element, pseudoElt);
    // Kembalikan nilai asli
    return result;
  };
  
  // Hapus beberapa pendeteksi DevTools
  const detectList = ['__REACT_DEVTOOLS_GLOBAL_HOOK__', 'devtoolsDetector', 'devToolsExtension'];
  detectList.forEach(prop => {
    if (window[prop]) {
      if (window[prop].isDisabled) {
        delete window[prop].isDisabled;
      }
      // Jika perlu, hilangkan property lain
    }
  });
  
  console.log('✅ Mekanisme deteksi DevTools dihapus');
  
  // === BAGIAN 4: BERSIHKAN DEBUGGING TRAP ===
  
  // Kembalikan fungsi debug
  const debugFunctions = ['debug', 'debugger', 'inspect'];
  debugFunctions.forEach(funcName => {
    if (window[funcName] && typeof window[funcName] !== 'function') {
      delete window[funcName];
    }
  });
  
  console.log('✅ Debug traps dihapus');
  
  // === BAGIAN 5: PERBAIKI DEFINISI DEBUGGING PREVENTION ===
  
  // Perbaiki definisi obyek debugger
  try {
    // Beberapa situs memodifikasi obyek debugger melalui Object.defineProperty
    const debugging = Object.getOwnPropertyDescriptor(window, 'debugging');
    if (debugging && (!debugging.configurable || !debugging.writable)) {
      Object.defineProperty(window, 'debugging', {
        value: true,
        writable: true,
        configurable: true
      });
    }
  } catch (e) {
    console.log('⚠️ Gagal memperbaiki definisi debugging:', e.message);
  }
  
  // Hapus semua interval yang mungkin melakukan pengecekan DevTools
  for (let i = 1; i < 10000; i++) {
    window.clearInterval(i);
  }
  
  // Pesan sukses
  console.log('🎉 Semua mekanisme pembatas DevTools telah dinonaktifkan!');
  console.log('🔄 Coba buka DevTools dengan shortcut:');
  console.log('   - Windows/Linux: F12 atau Ctrl+Shift+I');
  console.log('   - macOS: Cmd+Option+I');
  console.log('🚀 Jika masih tidak berfungsi, coba refresh halaman dan jalankan script ini lagi');
  
  // Menambahkan tombol untuk mengaktifkan DevTools ke halaman
  const btn = document.createElement('button');
  btn.innerText = 'Buka DevTools';
  btn.style.position = 'fixed';
  btn.style.bottom = '20px';
  btn.style.right = '20px';
  btn.style.zIndex = '9999';
  btn.style.padding = '10px 15px';
  btn.style.backgroundColor = '#4CAF50';
  btn.style.color = 'white';
  btn.style.border = 'none';
  btn.style.borderRadius = '4px';
  btn.style.cursor = 'pointer';
  btn.onclick = function() {
    // Coba berbagai cara untuk membuka DevTools
    try {
      // Metode 1: debugger statement
      debugger;
    } catch (e) {
      // Metode 2: coba buka melalui command
      try {
        if (navigator.userAgent.indexOf('Chrome') !== -1) {
          console.log('Coba Command+Option+I (Mac) or Control+Shift+I (Windows/Linux)');
        } else if (navigator.userAgent.indexOf('Firefox') !== -1) {
          console.log('Coba Command+Option+K (Mac) or Control+Shift+K (Windows/Linux)');
        } else {
          console.log('Coba F12 key');
        }
      } catch (e2) {
        console.error('Gagal membuka DevTools:', e2);
      }
    }
  };
  document.body.appendChild(btn);
})(); 
/**
 * Polyfill untuk Promise.withResolvers
 * 
 * Diperlukan untuk kompatibilitas PDF.js di browser yang lebih lama
 * Implementasi sederhana dari Promise.withResolvers()
 */
(function() {
  if (typeof Promise === 'undefined') {
    console.warn('Promise tidak tersedia di browser ini!');
    return;
  }

  if (Promise.withResolvers) {
    console.log('Promise.withResolvers sudah tersedia!');
    return;
  }

  // Implementasi Promise.withResolvers jika tidak tersedia
  Promise.withResolvers = function() {
    var resolve, reject;
    var promise = new Promise(function(_resolve, _reject) {
      resolve = _resolve;
      reject = _reject;
    });
    return {
      promise: promise,
      resolve: resolve,
      reject: reject
    };
  };
  
  console.log('Promise.withResolvers polyfill telah diterapkan!');
})(); 
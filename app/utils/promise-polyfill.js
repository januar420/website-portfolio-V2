/**
 * Polyfill untuk Promise.withResolvers
 * 
 * Fitur ini tersedia di browser modern dan Node.js 20+, tetapi tidak di Node.js 18
 * yang digunakan pada build environment Netlify
 */

// Tambahkan metode withResolvers pada Promise jika belum ada
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

export default Promise.withResolvers; 
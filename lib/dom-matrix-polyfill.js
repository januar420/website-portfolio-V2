/**
 * DOMMatrix polyfill untuk react-pdf
 * 
 * Polyfill yang dioptimasi untuk memastikan kompatibilitas PDF.js dengan semua lingkungan
 * termasuk SSR, browser lama, dan perangkat mobile.
 */

// Deteksi lingkungan secara lebih akurat dan aman
const isServer = typeof window === 'undefined';
const isClient = !isServer;
const globalObj = isServer ? global : window;
let isMobile = false;
let isWebkit = false;
let isFirefox = false;

// Deteksi browser dan perangkat secara lebih spesifik
if (isClient) {
  try {
    const userAgent = navigator.userAgent || navigator.vendor || (window.opera && window.opera.toString());
    const ua = userAgent.toLowerCase();
    
    isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua);
    isWebkit = ua.includes('webkit') || ua.includes('chrome') || ua.includes('safari');
    isFirefox = ua.includes('firefox');
    
    // Catat detail lingkungan untuk debugging
    console.debug(`PDF.js environment: Mobile: ${isMobile}, Webkit: ${isWebkit}, Firefox: ${isFirefox}`);
  } catch (e) {
    console.warn('Browser detection failed:', e);
  }
}

// Cache untuk mempercepat operasi matrix repeated
const matrixCache = new Map();

// Implementasi DOMMatrix yang dioptimasi
class DOMMatrixPolyfill {
  constructor(init) {
    // Default values
    this.a = 1;
    this.b = 0;
    this.c = 0;
    this.d = 1;
    this.e = 0;
    this.f = 0;
    this.m11 = 1;
    this.m12 = 0;
    this.m13 = 0;
    this.m14 = 0;
    this.m21 = 0;
    this.m22 = 1;
    this.m23 = 0;
    this.m24 = 0;
    this.m31 = 0;
    this.m32 = 0;
    this.m33 = 1;
    this.m34 = 0;
    this.m41 = 0;
    this.m42 = 0;
    this.m43 = 0;
    this.m44 = 1;
    this.is2D = true;
    this.isIdentity = true;
    
    // Apabila ada nilai init, parse dengan try-catch untuk lebih safety
    try {
      if (init) {
        if (typeof init === 'string') {
          // Parse CSS transform string
          const matrixMatch = init.match(/matrix\(([^)]+)\)/);
          if (matrixMatch && matrixMatch[1]) {
            const values = matrixMatch[1].split(',').map(v => parseFloat(v.trim()));
            if (values.length >= 6) {
              this.a = isNaN(values[0]) ? 1 : values[0];
              this.b = isNaN(values[1]) ? 0 : values[1];
              this.c = isNaN(values[2]) ? 0 : values[2];
              this.d = isNaN(values[3]) ? 1 : values[3];
              this.e = isNaN(values[4]) ? 0 : values[4];
              this.f = isNaN(values[5]) ? 0 : values[5];
              
              this.m11 = this.a;
              this.m12 = this.b;
              this.m21 = this.c;
              this.m22 = this.d;
              this.m41 = this.e;
              this.m42 = this.f;
              
              this.isIdentity = (
                this.a === 1 && this.b === 0 && this.c === 0 && 
                this.d === 1 && this.e === 0 && this.f === 0
              );
            }
          }
        } else if (Array.isArray(init) || init instanceof Float32Array || init instanceof Float64Array) {
          // Handle array input with validation
          if (init.length >= 6) {
            this.a = isNaN(init[0]) ? 1 : init[0];
            this.b = isNaN(init[1]) ? 0 : init[1];
            this.c = isNaN(init[2]) ? 0 : init[2];
            this.d = isNaN(init[3]) ? 1 : init[3];
            this.e = isNaN(init[4]) ? 0 : init[4];
            this.f = isNaN(init[5]) ? 0 : init[5];
            
            this.m11 = this.a;
            this.m12 = this.b;
            this.m21 = this.c;
            this.m22 = this.d;
            this.m41 = this.e;
            this.m42 = this.f;
            
            this.isIdentity = (
              this.a === 1 && this.b === 0 && this.c === 0 && 
              this.d === 1 && this.e === 0 && this.f === 0
            );
          }
        }
      }
    } catch (e) {
      console.warn('Error parsing DOMMatrix init value:', e);
      // Reset to identity matrix in case of errors
      this.a = this.m11 = this.d = this.m22 = 1;
      this.b = this.m12 = this.c = this.m21 = this.e = this.m41 = this.f = this.m42 = 0;
      this.isIdentity = true;
    }
  }

  // Implementasi operasi transformasi dasar
  translate(tx = 0, ty = 0, tz = 0) {
    // Validasi input dengan default values
    tx = isNaN(tx) ? 0 : tx;
    ty = isNaN(ty) ? 0 : ty;
    tz = isNaN(tz) ? 0 : tz;
    
    // Gunakan cache untuk operasi yang sering diulang
    const cacheKey = `translate_${tx}_${ty}_${tz}`;
    if (matrixCache.has(cacheKey)) {
      return matrixCache.get(cacheKey);
    }
    
    const result = new DOMMatrixPolyfill();
    
    // Menerapkan translasi 2D
    if (this.is2D && tz === 0) {
      result.a = this.a;
      result.b = this.b;
      result.c = this.c;
      result.d = this.d;
      result.e = this.e + this.a * tx + this.c * ty;
      result.f = this.f + this.b * tx + this.d * ty;
      
      result.m11 = result.a;
      result.m12 = result.b;
      result.m21 = result.c;
      result.m22 = result.d;
      result.m41 = result.e;
      result.m42 = result.f;
    }
    
    result.isIdentity = (
      result.a === 1 && result.b === 0 && result.c === 0 && 
      result.d === 1 && result.e === 0 && result.f === 0
    );
    
    // Cache result untuk penggunaan berikutnya
    if (matrixCache.size < 200) { // Batasi ukuran cache
      matrixCache.set(cacheKey, result);
    }
    
    return result;
  }

  scale(scaleX = 1, scaleY = 1, scaleZ = 1) {
    const result = new DOMMatrixPolyfill();
    
    if (this.is2D && scaleZ === 1) {
      result.a = this.a * scaleX;
      result.b = this.b * scaleX;
      result.c = this.c * scaleY;
      result.d = this.d * scaleY;
      result.e = this.e;
      result.f = this.f;
      
      result.m11 = result.a;
      result.m12 = result.b;
      result.m21 = result.c;
      result.m22 = result.d;
      result.m41 = result.e;
      result.m42 = result.f;
    }
    
    result.isIdentity = (
      result.a === 1 && result.b === 0 && result.c === 0 && 
      result.d === 1 && result.e === 0 && result.f === 0
    );
    
    return result;
  }

  multiply(other) {
    const result = new DOMMatrixPolyfill();
    
    if (!(other instanceof DOMMatrixPolyfill)) {
      return result;
    }
    
    if (this.is2D && other.is2D) {
      result.a = this.a * other.a + this.c * other.b;
      result.b = this.b * other.a + this.d * other.b;
      result.c = this.a * other.c + this.c * other.d;
      result.d = this.b * other.c + this.d * other.d;
      result.e = this.a * other.e + this.c * other.f + this.e;
      result.f = this.b * other.e + this.d * other.f + this.f;
      
      result.m11 = result.a;
      result.m12 = result.b;
      result.m21 = result.c;
      result.m22 = result.d;
      result.m41 = result.e;
      result.m42 = result.f;
    }
    
    result.isIdentity = (
      result.a === 1 && result.b === 0 && result.c === 0 && 
      result.d === 1 && result.e === 0 && result.f === 0
    );
    
    return result;
  }

  inverse() {
    const result = new DOMMatrixPolyfill();
    
    if (this.is2D) {
      const det = this.a * this.d - this.b * this.c;
      
      // Cek apakah matrix bisa diinverse
      if (Math.abs(det) < 1e-8) {
        return result; // Return identity matrix
      }
      
      const invDet = 1.0 / det;
      
      result.a = this.d * invDet;
      result.b = -this.b * invDet;
      result.c = -this.c * invDet;
      result.d = this.a * invDet;
      result.e = (this.c * this.f - this.d * this.e) * invDet;
      result.f = (this.b * this.e - this.a * this.f) * invDet;
      
      result.m11 = result.a;
      result.m12 = result.b;
      result.m21 = result.c;
      result.m22 = result.d;
      result.m41 = result.e;
      result.m42 = result.f;
    }
    
    result.isIdentity = (
      result.a === 1 && result.b === 0 && result.c === 0 && 
      result.d === 1 && result.e === 0 && result.f === 0
    );
    
    return result;
  }

  transformPoint(point) {
    if (!point || typeof point !== 'object') {
      return { x: 0, y: 0, z: 0, w: 1 };
    }
    
    const x = point.x || 0;
    const y = point.y || 0;
    const z = point.z || 0;
    const w = point.w !== undefined ? point.w : 1;
    
    if (this.is2D) {
      return {
        x: this.a * x + this.c * y + this.e,
        y: this.b * x + this.d * y + this.f,
        z: z,
        w: w
      };
    }
    
    return { x: 0, y: 0, z: 0, w: 1 };
  }
  
  toString() {
    if (this.is2D) {
      return `matrix(${this.a}, ${this.b}, ${this.c}, ${this.d}, ${this.e}, ${this.f})`;
    }
    return `matrix3d(${this.m11}, ${this.m12}, ${this.m13}, ${this.m14}, ${this.m21}, ${this.m22}, ${this.m23}, ${this.m24}, ${this.m31}, ${this.m32}, ${this.m33}, ${this.m34}, ${this.m41}, ${this.m42}, ${this.m43}, ${this.m44})`;
  }
}

// Metode statis untuk pembuatan matrix
DOMMatrixPolyfill.fromMatrix = function(init) { 
  return new DOMMatrixPolyfill(init); 
};

DOMMatrixPolyfill.fromFloat32Array = function(array32) { 
  return new DOMMatrixPolyfill(array32); 
};

DOMMatrixPolyfill.fromFloat64Array = function(array64) { 
  return new DOMMatrixPolyfill(array64); 
};

// Aplikasikan polyfill secara aman
try {
  // Terapkan DOMMatrix polyfill jika belum ada
  if (!globalObj.DOMMatrix) {
    globalObj.DOMMatrix = DOMMatrixPolyfill;
  }

  // Polyfill untuk Promise.withResolvers (dibutuhkan oleh PDF.js)
  if (typeof Promise !== 'undefined' && !Promise.withResolvers) {
    Promise.withResolvers = function() {
      let resolve, reject;
      const promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
      });
      return { promise, resolve, reject };
    };
  }

  // Polyfill untuk ResizeObserver jika tidak ada
  if (isClient && typeof window.ResizeObserver === 'undefined') {
    // Minimal implementation
    window.ResizeObserver = class ResizeObserver {
      constructor(callback) {
        this.callback = callback;
        this.observables = [];
        this.activeTimeout = null;
      }
      
      observe(target) {
        if (!this.observables.includes(target)) {
          this.observables.push(target);
        }
        
        // Perbarui dengan interval jika ada perubahan ukuran
        if (!this.activeTimeout) {
          const checkSizes = () => {
            const entries = this.observables.map(el => ({
              target: el,
              contentRect: {
                width: el.clientWidth,
                height: el.clientHeight,
                top: el.offsetTop,
                left: el.offsetLeft,
                bottom: el.offsetTop + el.clientHeight,
                right: el.offsetLeft + el.clientWidth
              }
            }));
            
            if (entries.length > 0) {
              this.callback(entries, this);
            }
            
            this.activeTimeout = setTimeout(checkSizes, 500);
          };
          
          checkSizes();
        }
      }
      
      unobserve(target) {
        this.observables = this.observables.filter(el => el !== target);
        
        if (this.observables.length === 0 && this.activeTimeout) {
          clearTimeout(this.activeTimeout);
          this.activeTimeout = null;
        }
      }
      
      disconnect() {
        this.observables = [];
        if (this.activeTimeout) {
          clearTimeout(this.activeTimeout);
          this.activeTimeout = null;
        }
      }
    };
  }

  // Di server, polyfill TextDecoder jika perlu
  if (isServer && typeof globalObj.TextDecoder === 'undefined') {
    try {
      const util = require('util');
      if (util && util.TextDecoder) {
        globalObj.TextDecoder = util.TextDecoder;
      } else {
        // Implementasi minimal fallback
        globalObj.TextDecoder = class {
          constructor(encoding = 'utf-8', options = {}) {
            this.encoding = encoding;
            this.fatal = options.fatal || false;
            this.ignoreBOM = options.ignoreBOM || false;
          }
          
          decode(buffer) {
            if (typeof Buffer !== 'undefined') {
              if (buffer instanceof Buffer) {
                return buffer.toString('utf-8');
              } else if (buffer instanceof ArrayBuffer || ArrayBuffer.isView(buffer)) {
                return Buffer.from(buffer).toString('utf-8');
              }
            }
            return "";
          }
        };
      }
    } catch (e) {
      // Fallback jika gagal
      globalObj.TextDecoder = class {
        decode() { return ""; }
      };
    }
  }
  
  // Performance optimization: Preload PDF worker di client
  if (isClient && typeof Worker !== 'undefined') {
    try {
      // Preload worker PDF.js untuk performa lebih baik
      const PDFJS_VERSION = '5.2.133';
      const LOCAL_WORKER_URL = `/pdf.worker.min.js`; // Local worker lebih diutamakan
      const CDN_WORKER_URL = `https://unpkg.com/pdfjs-dist@${PDFJS_VERSION}/build/pdf.worker.min.js`;
      
      // Gunakan session storage untuk tracking
      const hasPreloaded = sessionStorage.getItem('pdf_worker_preloaded');
      
      if (!hasPreloaded && !isMobile) { // Skip preload pada mobile untuk hemat bandwidth
        // Preload worker lokal terlebih dahulu
        const workerPreload = document.createElement('link');
        workerPreload.rel = 'preload';
        workerPreload.href = LOCAL_WORKER_URL;
        workerPreload.as = 'script';
        document.head.appendChild(workerPreload);
        
        // Tambahkan preconnect ke CDN sebagai backup
        const preconnect = document.createElement('link');
        preconnect.rel = 'preconnect';
        preconnect.href = 'https://unpkg.com';
        preconnect.crossOrigin = 'anonymous';
        document.head.appendChild(preconnect);
        
        // Tandai bahwa worker telah di-preload
        sessionStorage.setItem('pdf_worker_preloaded', 'true');
      }
    } catch (e) {
      console.warn('Failed to preload PDF.js worker:', e);
    }
  }
} catch (e) {
  console.warn('PDF.js polyfill failed to initialize:', e);
} 
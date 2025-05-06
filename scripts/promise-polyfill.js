/**
 * Promise Polyfill untuk browser lama
 * Ini adalah versi minimal dari polyfill untuk Promise
 * 
 * Sumber: https://github.com/taylorhakes/promise-polyfill
 * Diadaptasi untuk kebutuhan website portfolio
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (factory());
}(this, (function () { 'use strict';

// Status Promise
var PENDING = 'pending';
var FULFILLED = 'fulfilled';
var REJECTED = 'rejected';

// Fungsi utama untuk Promise polyfill
function Promise(executor) {
  this.state = PENDING;
  this.value = undefined;
  this.reason = undefined;
  this.onFulfilledCallbacks = [];
  this.onRejectedCallbacks = [];

  var promise = this;

  try {
    executor(
      function(value) {
        resolve(promise, value);
      }, 
      function(reason) {
        reject(promise, reason);
      }
    );
  } catch (error) {
    reject(promise, error);
  }
}

// Resolve Promise
function resolve(promise, value) {
  if (promise.state === PENDING) {
    promise.state = FULFILLED;
    promise.value = value;
    
    for (var i = 0; i < promise.onFulfilledCallbacks.length; i++) {
      promise.onFulfilledCallbacks[i](value);
    }
  }
}

// Reject Promise
function reject(promise, reason) {
  if (promise.state === PENDING) {
    promise.state = REJECTED;
    promise.reason = reason;
    
    for (var i = 0; i < promise.onRejectedCallbacks.length; i++) {
      promise.onRejectedCallbacks[i](reason);
    }
  }
}

// Method then untuk Promise
Promise.prototype.then = function(onFulfilled, onRejected) {
  onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : function(value) { return value; };
  onRejected = typeof onRejected === 'function' ? onRejected : function(reason) { throw reason; };
  
  var promise = this;
  var newPromise = new Promise(function(resolve, reject) {
    function handleFulfilled(value) {
      try {
        var x = onFulfilled(value);
        resolvePromise(newPromise, x, resolve, reject);
      } catch (error) {
        reject(error);
      }
    }
    
    function handleRejected(reason) {
      try {
        var x = onRejected(reason);
        resolvePromise(newPromise, x, resolve, reject);
      } catch (error) {
        reject(error);
      }
    }
    
    if (promise.state === FULFILLED) {
      setTimeout(function() {
        handleFulfilled(promise.value);
      }, 0);
    } else if (promise.state === REJECTED) {
      setTimeout(function() {
        handleRejected(promise.reason);
      }, 0);
    } else if (promise.state === PENDING) {
      promise.onFulfilledCallbacks.push(function(value) {
        setTimeout(function() {
          handleFulfilled(value);
        }, 0);
      });
      
      promise.onRejectedCallbacks.push(function(reason) {
        setTimeout(function() {
          handleRejected(reason);
        }, 0);
      });
    }
  });
  
  return newPromise;
};

// Method catch untuk Promise
Promise.prototype.catch = function(onRejected) {
  return this.then(null, onRejected);
};

// Method untuk Promise.resolve statis
Promise.resolve = function(value) {
  return new Promise(function(resolve) {
    resolve(value);
  });
};

// Method untuk Promise.reject statis
Promise.reject = function(reason) {
  return new Promise(function(resolve, reject) {
    reject(reason);
  });
};

// Method all untuk Promise statis
Promise.all = function(promises) {
  return new Promise(function(resolve, reject) {
    if (!Array.isArray(promises)) {
      return reject(new TypeError('Promise.all harus menerima array.'));
    }
    
    var results = [];
    var remaining = promises.length;
    
    if (remaining === 0) {
      resolve(results);
      return;
    }
    
    function resolvePromise(i, value) {
      try {
        results[i] = value;
        remaining--;
        
        if (remaining === 0) {
          resolve(results);
        }
      } catch (error) {
        reject(error);
      }
    }
    
    for (var i = 0; i < promises.length; i++) {
      (function(i) {
        var promise = promises[i];
        
        if (promise && typeof promise.then === 'function') {
          promise.then(
            function(value) {
              resolvePromise(i, value);
            },
            function(reason) {
              reject(reason);
            }
          );
        } else {
          resolvePromise(i, promise);
        }
      })(i);
    }
  });
};

// Helper untuk resolvePromise
function resolvePromise(promise, x, resolve, reject) {
  if (promise === x) {
    reject(new TypeError('Promise tidak bisa resolve ke dirinya sendiri.'));
    return;
  }
  
  if (x && (typeof x === 'object' || typeof x === 'function')) {
    var called = false;
    
    try {
      var then = x.then;
      
      if (typeof then === 'function') {
        then.call(
          x,
          function(value) {
            if (!called) {
              called = true;
              resolvePromise(promise, value, resolve, reject);
            }
          },
          function(reason) {
            if (!called) {
              called = true;
              reject(reason);
            }
          }
        );
      } else {
        resolve(x);
      }
    } catch (error) {
      if (!called) {
        called = true;
        reject(error);
      }
    }
  } else {
    resolve(x);
  }
}

// Tetapkan Promise ke global
if (!window.Promise) {
  window.Promise = Promise;
  console.log('Promise polyfill diterapkan.');
}

// Polyfill untuk Promise.withResolvers
// Digunakan untuk kompatibilitas dengan Node.js di GitHub Actions
if (typeof Promise.withResolvers !== 'function') {
  Promise.withResolvers = function() {
    let resolve, reject;
    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };
  console.log('Promise.withResolvers polyfill telah diaktifkan');
}

// Export fungsi untuk memastikan modul dapat di-import
module.exports = {
  installPromisePolyfill: function() {
    // Verifikasi polyfill telah terpasang
    if (typeof Promise.withResolvers === 'function') {
      return true;
    }
    return false;
  }
};

}))); 
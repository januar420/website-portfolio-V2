/**
 * File ini berisi deklarasi tipe global untuk aplikasi.
 * Tipe-tipe ini mengextend tipe standar seperti Window, Performance, dll.
 */

// Memperluas interface Window dengan properti kustom yang dibutuhkan oleh React Three Fiber
declare global {
  interface Window {
    ReactCurrentOwner?: {
      current: null | object;
    };
    ReactCurrentBatchConfig?: {
      transition: number;
      suspense: null | object;
      thenableState: null | object;
    };
    __R3F_PATCHED?: boolean;
    __THREE__?: Record<string, unknown>;
    React?: any;
  }

  // Memperluas Performance untuk ReactThreeFiber
  interface Performance {
    _updatedFibers?: Set<unknown>;
    _updatedFibersTimestamps?: Map<unknown, number>;
  }
}

// Deklarasi untuk React internals yang tidak didefinisikan dalam @types/react
declare namespace React {
  namespace __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED {
    const ReactCurrentOwner: {
      current: null | object;
    };
    const ReactCurrentBatchConfig: {
      transition: number;
      suspense: null | object;
      thenableState: null | object;
    };
  }
}

export {}; 
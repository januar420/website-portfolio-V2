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
    emailjs: any;
    reactCurrentOwner: any;
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

// Deklarasi untuk json-schema
declare module 'json-schema' {
  interface JSONSchema4 {
    id?: string;
    $schema?: string;
    title?: string;
    description?: string;
    type?: string | string[];
    required?: string[];
    properties?: { [key: string]: JSONSchema4 };
    additionalProperties?: boolean | JSONSchema4;
    items?: JSONSchema4 | JSONSchema4[];
  }
  
  interface JSONSchema7 {
    $schema?: string;
    $id?: string;
    title?: string;
    description?: string;
    type?: string | string[];
    required?: string[];
    properties?: { [key: string]: JSONSchema7 };
    additionalProperties?: boolean | JSONSchema7;
    items?: JSONSchema7 | JSONSchema7[];
  }
}

// Memperluas tipe RenderingContext untuk WebGL
interface WebGLRenderingContext {
  getExtension(name: string): any;
}

// Memperluas tipe CanvasRenderingContext2D 
interface CanvasRenderingContext2D {
  getExtension?(name: string): any;
}

// Memperluas tipe window dengan React current owner
interface WindowWithReactCurrentOwner extends Window {
  __REACT_DEVTOOLS_GLOBAL_HOOK__?: any;
}

// Definisi tipe untuk EmailData
interface EmailData {
  name: string;
  email: string;
  message: string;
  subject: string;
}

export {}; 
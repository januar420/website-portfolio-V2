/**
 * Deklarasi tipe global untuk library yang tidak memiliki deklarasi tipe
 * File ini menangani masalah "Cannot find type definition file" untuk library yang digunakan
 */

// D3 libraries
declare module 'd3';
declare module 'd3-array';
declare module 'd3-color';
declare module 'd3-ease';
declare module 'd3-interpolate';
declare module 'd3-path';
declare module 'd3-scale';
declare module 'd3-shape';
declare module 'd3-time';
declare module 'd3-timer';

// Three.js dan libraries terkait
declare module 'three';
declare module 'draco3d';
declare module 'stats.js';
declare module 'offscreencanvas';
declare module 'raf';
declare module 'react-reconciler';

// Lainnya
declare module 'istanbul-lib-coverage';
declare module 'istanbul-lib-report';
declare module 'istanbul-reports';
declare module 'node-forge';
declare module 'stack-utils';

// Module declaration untuk file non-JavaScript
declare module '*.glsl' {
  const content: string;
  export default content;
}

declare module '*.vs' {
  const content: string;
  export default content;
}

declare module '*.fs' {
  const content: string;
  export default content;
}

declare module '*.glb' {
  const content: string;
  export default content;
}

declare module '*.gltf' {
  const content: string;
  export default content;
}

declare namespace NodeJS {
  interface Process {
    browser: boolean;
  }
  
  interface ProcessEnv {
    NEXT_PUBLIC_EMAILJS_SERVICE_ID: string;
    NEXT_PUBLIC_EMAILJS_TEMPLATE_ID: string;
    NEXT_PUBLIC_EMAILJS_USER_ID: string;
    NODE_ENV: 'development' | 'production';
    GITHUB_PAGES: string;
  }
} 
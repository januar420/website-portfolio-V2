/**
 * Definisi tipe untuk D3 Library
 * 
 * Dibuat untuk menangani error TypeScript:
 * "Cannot find type definition file for 'd3'.
 * The file is in the program because: Entry point for implicit type library 'd3'"
 */

// Re-export dari semua submodul D3
declare module 'd3' {
  export * from 'd3-array';
  export * from 'd3-axis';
  export * from 'd3-brush';
  export * from 'd3-chord';
  export * from 'd3-color';
  export * from 'd3-contour';
  export * from 'd3-delaunay';
  export * from 'd3-dispatch';
  export * from 'd3-drag';
  export * from 'd3-dsv';
  export * from 'd3-ease';
  export * from 'd3-fetch';
  export * from 'd3-force';
  export * from 'd3-format';
  export * from 'd3-geo';
  export * from 'd3-hierarchy';
  export * from 'd3-interpolate';
  export * from 'd3-path';
  export * from 'd3-polygon';
  export * from 'd3-quadtree';
  export * from 'd3-random';
  export * from 'd3-scale';
  export * from 'd3-scale-chromatic';
  export * from 'd3-selection';
  export * from 'd3-shape';
  export * from 'd3-time';
  export * from 'd3-time-format';
  export * from 'd3-timer';
  export * from 'd3-transition';
  export * from 'd3-zoom';

  // Tipe dasar untuk objek D3
  export interface D3Base {
    version: string;
  }

  // Definisi untuk namespace D3
  export namespace d3 {
    export const version: string;
  }

  // Untuk mendukung impor default
  export default d3;
} 
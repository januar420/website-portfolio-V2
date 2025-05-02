import 'next';
import * as React from 'react';

declare module 'next' {
  // Untuk mendukung future compatibility dengan React 19
  type ClientComponent<P = {}> = React.ComponentType<P>;

  export interface NextPage<P = {}, IP = P> extends React.FC<P> {
    getInitialProps?: (context: any) => IP | Promise<IP>;
  }
}

// Memperluas interface JSX default dari Next.js
declare global {
  namespace JSX {
    // Interface tambahan yang mungkin diperlukan 
    interface IntrinsicAttributes {
      key?: React.Key;
    }
  }
} 
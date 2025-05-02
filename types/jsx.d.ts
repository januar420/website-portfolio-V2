import * as React from 'react';

/**
 * Deklarasi global untuk JSX
 * Mendukung React 18 dengan Next.js 15
 */
declare global {
  namespace JSX {
    interface Element extends React.ReactElement<any, any> {}
    
    interface ElementClass {
      render(): React.ReactNode;
    }
    
    interface ElementAttributesProperty {
      props: {};
    }
    
    interface ElementChildrenAttribute {
      children: {};
    }
    
    interface IntrinsicElements {
      [elemName: string]: any;
    }
    
    interface IntrinsicAttributes extends React.Attributes {
      key?: React.Key;
      ref?: any;
    }
    
    interface IntrinsicClassAttributes<T> extends React.ClassAttributes<T> {}
  }
} 
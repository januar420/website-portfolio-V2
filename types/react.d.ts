import * as React from 'react';

declare module 'react' {
  interface ReactElement extends React.ReactElement {}
  type ReactNode = React.ReactNode;
  
  type FC<P = {}> = React.FunctionComponent<P>;
  
  interface FunctionComponent<P = {}> {
    (props: P, context?: any): ReactElement | null;
    displayName?: string;
  }
  
  const Fragment: React.ReactFragment;
}

declare global {
  namespace JSX {
    interface Element extends React.ReactElement<any, any> {}
    interface ElementClass extends React.Component<any> {
      render(): React.ReactNode;
    }
    interface ElementAttributesProperty {
      props: {};
    }
    interface ElementChildrenAttribute {
      children: {};
    }
    
    // Ini adalah bagian penting untuk memperbaiki "JSX element implicitly has type 'any'"
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
} 
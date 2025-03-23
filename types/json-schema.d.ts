// Declaration file for json-schema
declare module 'json-schema' {
  export interface JSONSchema4 {
    id?: string;
    $schema?: string;
    title?: string;
    description?: string;
    type?: string | string[];
    required?: string[];
    properties?: { [key: string]: JSONSchema4 };
    additionalProperties?: boolean | JSONSchema4;
    items?: JSONSchema4 | JSONSchema4[];
    // dan properti lainnya
  }
  
  export interface JSONSchema7 {
    $schema?: string;
    $id?: string;
    title?: string;
    description?: string;
    type?: string | string[];
    required?: string[];
    properties?: { [key: string]: JSONSchema7 };
    additionalProperties?: boolean | JSONSchema7;
    items?: JSONSchema7 | JSONSchema7[];
    // dan properti lainnya
  }
} 
/// <reference types="react" />

// Definições para React.JSX
declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

// Definições para Buffer global
interface Buffer extends Uint8Array {
  write(string: string, offset?: number, length?: number, encoding?: string): number;
  toString(encoding?: string, start?: number, end?: number): string;
  toJSON(): { type: 'Buffer'; data: number[] };
  equals(otherBuffer: Uint8Array): boolean;
  compare(otherBuffer: Uint8Array): number;
  copy(targetBuffer: Uint8Array, targetStart?: number, sourceStart?: number, sourceEnd?: number): number;
  slice(start?: number, end?: number): Buffer;
  writeUInt8(value: number, offset: number): number;
  writeUInt16LE(value: number, offset: number): number;
  writeUInt32LE(value: number, offset: number): number;
  writeInt8(value: number, offset: number): number;
  writeInt16LE(value: number, offset: number): number;
  writeInt32LE(value: number, offset: number): number;
  readUInt8(offset: number): number;
  readUInt16LE(offset: number): number;
  readUInt32LE(offset: number): number;
  readInt8(offset: number): number;
  readInt16LE(offset: number): number;
  readInt32LE(offset: number): number;
}

declare const Buffer: {
  new (str: string, encoding?: string): Buffer;
  new (size: number): Buffer;
  new (array: Uint8Array): Buffer;
  new (arrayBuffer: ArrayBuffer | SharedArrayBuffer): Buffer;
  new (array: any[]): Buffer;
  new (buffer: Buffer): Buffer;
  from(str: string, encoding?: string): Buffer;
  from(arrayBuffer: ArrayBuffer | SharedArrayBuffer, byteOffset?: number, length?: number): Buffer;
  from(array: any[]): Buffer;
  from(buffer: Buffer): Buffer;
  alloc(size: number, fill?: string | Buffer | number, encoding?: string): Buffer;
  allocUnsafe(size: number): Buffer;
  allocUnsafeSlow(size: number): Buffer;
  isBuffer(obj: any): obj is Buffer;
  byteLength(string: string | Buffer | ArrayBuffer | SharedArrayBuffer | Uint8Array, encoding?: string): number;
  concat(list: Uint8Array[], totalLength?: number): Buffer;
  compare(buf1: Uint8Array, buf2: Uint8Array): number;
}; 
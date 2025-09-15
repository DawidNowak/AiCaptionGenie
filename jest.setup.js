// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Used for __tests__/testing-library.js
// Learn more: https://github.com/testing-library/jest-dom
// import '@testing-library/jest-dom/extend-expect'

// Polyfill for Next.js web APIs in test environment
import { TextEncoder, TextDecoder } from "util";

// Polyfill fetch for Node.js environment
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Install a better polyfill for fetch and Request/Response
import "whatwg-fetch";

// Enhanced FormData polyfill for Jest
// Fixes FormData parsing issues in test environment
global.FormData = class FormData {
  constructor() {
    this.data = new Map();
  }

  append(name, value, filename) {
    this.data.set(name, value);
  }

  get(name) {
    return this.data.get(name);
  }

  getAll(name) {
    return this.data.has(name) ? [this.data.get(name)] : [];
  }

  has(name) {
    return this.data.has(name);
  }

  set(name, value, filename) {
    this.data.set(name, value);
  }

  delete(name) {
    this.data.delete(name);
  }

  *entries() {
    for (const [key, value] of this.data.entries()) {
      yield [key, value];
    }
  }

  *keys() {
    for (const key of this.data.keys()) {
      yield key;
    }
  }

  *values() {
    for (const value of this.data.values()) {
      yield value;
    }
  }

  [Symbol.iterator]() {
    return this.entries();
  }
};

// Enhanced File polyfill for Jest
// Fixes File.arrayBuffer() and other methods in test environment
global.File = class File {
  constructor(fileBits, fileName, options = {}) {
    this.name = fileName;
    this.type = options.type || "";
    this.lastModified = options.lastModified || Date.now();
    this.size = fileBits.reduce((size, bit) => size + (bit.length || 0), 0);
    this._bits = fileBits;
  }

  async arrayBuffer() {
    // Convert file bits to ArrayBuffer for test environment
    const content = this._bits.join("");
    const buffer = new ArrayBuffer(content.length);
    const view = new Uint8Array(buffer);
    for (let i = 0; i < content.length; i++) {
      view[i] = content.charCodeAt(i);
    }
    return buffer;
  }

  async text() {
    return this._bits.join("");
  }

  stream() {
    throw new Error("File.stream() not implemented in test environment");
  }

  slice(start, end, contentType) {
    const content = this._bits.join("");
    const sliced = content.slice(start, end);
    return new File([sliced], this.name, { type: contentType || this.type });
  }
};

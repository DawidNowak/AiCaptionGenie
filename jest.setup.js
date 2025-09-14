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

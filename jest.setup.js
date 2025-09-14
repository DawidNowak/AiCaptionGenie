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

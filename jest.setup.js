import '@testing-library/jest-dom'

// Polyfills para o ambiente de teste
if (typeof globalThis.TextEncoder === 'undefined') {
  const util = require('util');
  globalThis.TextEncoder = util.TextEncoder;
  globalThis.TextDecoder = util.TextDecoder;
}

// Mock do crypto para ambiente de teste Node.js
if (typeof globalThis.crypto === 'undefined') {
  const { webcrypto } = require('crypto');
  globalThis.crypto = webcrypto;
}

// deno:https://deno.land/std@0.150.0/hash/sha1.ts
var HEX_CHARS = "0123456789abcdef".split("");
var EXTRA = [-2147483648, 8388608, 32768, 128];
var SHIFT = [24, 16, 8, 0];
var blocks = [];
var Sha1 = class {
  #blocks;
  #block;
  #start;
  #bytes;
  #hBytes;
  #finalized;
  #hashed;
  #h0 = 1732584193;
  #h1 = 4023233417;
  #h2 = 2562383102;
  #h3 = 271733878;
  #h4 = 3285377520;
  #lastByteIndex = 0;
  constructor(sharedMemory = false) {
    this.init(sharedMemory);
  }
  init(sharedMemory) {
    if (sharedMemory) {
      blocks[0] = blocks[16] = blocks[1] = blocks[2] = blocks[3] = blocks[4] = blocks[5] = blocks[6] = blocks[7] = blocks[8] = blocks[9] = blocks[10] = blocks[11] = blocks[12] = blocks[13] = blocks[14] = blocks[15] = 0;
      this.#blocks = blocks;
    } else {
      this.#blocks = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    }
    this.#h0 = 1732584193;
    this.#h1 = 4023233417;
    this.#h2 = 2562383102;
    this.#h3 = 271733878;
    this.#h4 = 3285377520;
    this.#block = this.#start = this.#bytes = this.#hBytes = 0;
    this.#finalized = this.#hashed = false;
  }
  update(message) {
    if (this.#finalized) {
      return this;
    }
    let msg;
    if (message instanceof ArrayBuffer) {
      msg = new Uint8Array(message);
    } else {
      msg = message;
    }
    let index = 0;
    const length = msg.length;
    const blocks2 = this.#blocks;
    while (index < length) {
      let i;
      if (this.#hashed) {
        this.#hashed = false;
        blocks2[0] = this.#block;
        blocks2[16] = blocks2[1] = blocks2[2] = blocks2[3] = blocks2[4] = blocks2[5] = blocks2[6] = blocks2[7] = blocks2[8] = blocks2[9] = blocks2[10] = blocks2[11] = blocks2[12] = blocks2[13] = blocks2[14] = blocks2[15] = 0;
      }
      if (typeof msg !== "string") {
        for (i = this.#start; index < length && i < 64; ++index) {
          blocks2[i >> 2] |= msg[index] << SHIFT[i++ & 3];
        }
      } else {
        for (i = this.#start; index < length && i < 64; ++index) {
          let code = msg.charCodeAt(index);
          if (code < 128) {
            blocks2[i >> 2] |= code << SHIFT[i++ & 3];
          } else if (code < 2048) {
            blocks2[i >> 2] |= (192 | code >> 6) << SHIFT[i++ & 3];
            blocks2[i >> 2] |= (128 | code & 63) << SHIFT[i++ & 3];
          } else if (code < 55296 || code >= 57344) {
            blocks2[i >> 2] |= (224 | code >> 12) << SHIFT[i++ & 3];
            blocks2[i >> 2] |= (128 | code >> 6 & 63) << SHIFT[i++ & 3];
            blocks2[i >> 2] |= (128 | code & 63) << SHIFT[i++ & 3];
          } else {
            code = 65536 + ((code & 1023) << 10 | msg.charCodeAt(++index) & 1023);
            blocks2[i >> 2] |= (240 | code >> 18) << SHIFT[i++ & 3];
            blocks2[i >> 2] |= (128 | code >> 12 & 63) << SHIFT[i++ & 3];
            blocks2[i >> 2] |= (128 | code >> 6 & 63) << SHIFT[i++ & 3];
            blocks2[i >> 2] |= (128 | code & 63) << SHIFT[i++ & 3];
          }
        }
      }
      this.#lastByteIndex = i;
      this.#bytes += i - this.#start;
      if (i >= 64) {
        this.#block = blocks2[16];
        this.#start = i - 64;
        this.#hash();
        this.#hashed = true;
      } else {
        this.#start = i;
      }
    }
    if (this.#bytes > 4294967295) {
      this.#hBytes += this.#bytes / 4294967296 >>> 0;
      this.#bytes = this.#bytes >>> 0;
    }
    return this;
  }
  finalize() {
    if (this.#finalized) {
      return;
    }
    this.#finalized = true;
    const blocks2 = this.#blocks;
    const i = this.#lastByteIndex;
    blocks2[16] = this.#block;
    blocks2[i >> 2] |= EXTRA[i & 3];
    this.#block = blocks2[16];
    if (i >= 56) {
      if (!this.#hashed) {
        this.#hash();
      }
      blocks2[0] = this.#block;
      blocks2[16] = blocks2[1] = blocks2[2] = blocks2[3] = blocks2[4] = blocks2[5] = blocks2[6] = blocks2[7] = blocks2[8] = blocks2[9] = blocks2[10] = blocks2[11] = blocks2[12] = blocks2[13] = blocks2[14] = blocks2[15] = 0;
    }
    blocks2[14] = this.#hBytes << 3 | this.#bytes >>> 29;
    blocks2[15] = this.#bytes << 3;
    this.#hash();
  }
  #hash() {
    let a = this.#h0;
    let b = this.#h1;
    let c = this.#h2;
    let d = this.#h3;
    let e = this.#h4;
    let f;
    let j;
    let t;
    const blocks2 = this.#blocks;
    for (j = 16; j < 80; ++j) {
      t = blocks2[j - 3] ^ blocks2[j - 8] ^ blocks2[j - 14] ^ blocks2[j - 16];
      blocks2[j] = t << 1 | t >>> 31;
    }
    for (j = 0; j < 20; j += 5) {
      f = b & c | ~b & d;
      t = a << 5 | a >>> 27;
      e = t + f + e + 1518500249 + blocks2[j] >>> 0;
      b = b << 30 | b >>> 2;
      f = a & b | ~a & c;
      t = e << 5 | e >>> 27;
      d = t + f + d + 1518500249 + blocks2[j + 1] >>> 0;
      a = a << 30 | a >>> 2;
      f = e & a | ~e & b;
      t = d << 5 | d >>> 27;
      c = t + f + c + 1518500249 + blocks2[j + 2] >>> 0;
      e = e << 30 | e >>> 2;
      f = d & e | ~d & a;
      t = c << 5 | c >>> 27;
      b = t + f + b + 1518500249 + blocks2[j + 3] >>> 0;
      d = d << 30 | d >>> 2;
      f = c & d | ~c & e;
      t = b << 5 | b >>> 27;
      a = t + f + a + 1518500249 + blocks2[j + 4] >>> 0;
      c = c << 30 | c >>> 2;
    }
    for (; j < 40; j += 5) {
      f = b ^ c ^ d;
      t = a << 5 | a >>> 27;
      e = t + f + e + 1859775393 + blocks2[j] >>> 0;
      b = b << 30 | b >>> 2;
      f = a ^ b ^ c;
      t = e << 5 | e >>> 27;
      d = t + f + d + 1859775393 + blocks2[j + 1] >>> 0;
      a = a << 30 | a >>> 2;
      f = e ^ a ^ b;
      t = d << 5 | d >>> 27;
      c = t + f + c + 1859775393 + blocks2[j + 2] >>> 0;
      e = e << 30 | e >>> 2;
      f = d ^ e ^ a;
      t = c << 5 | c >>> 27;
      b = t + f + b + 1859775393 + blocks2[j + 3] >>> 0;
      d = d << 30 | d >>> 2;
      f = c ^ d ^ e;
      t = b << 5 | b >>> 27;
      a = t + f + a + 1859775393 + blocks2[j + 4] >>> 0;
      c = c << 30 | c >>> 2;
    }
    for (; j < 60; j += 5) {
      f = b & c | b & d | c & d;
      t = a << 5 | a >>> 27;
      e = t + f + e - 1894007588 + blocks2[j] >>> 0;
      b = b << 30 | b >>> 2;
      f = a & b | a & c | b & c;
      t = e << 5 | e >>> 27;
      d = t + f + d - 1894007588 + blocks2[j + 1] >>> 0;
      a = a << 30 | a >>> 2;
      f = e & a | e & b | a & b;
      t = d << 5 | d >>> 27;
      c = t + f + c - 1894007588 + blocks2[j + 2] >>> 0;
      e = e << 30 | e >>> 2;
      f = d & e | d & a | e & a;
      t = c << 5 | c >>> 27;
      b = t + f + b - 1894007588 + blocks2[j + 3] >>> 0;
      d = d << 30 | d >>> 2;
      f = c & d | c & e | d & e;
      t = b << 5 | b >>> 27;
      a = t + f + a - 1894007588 + blocks2[j + 4] >>> 0;
      c = c << 30 | c >>> 2;
    }
    for (; j < 80; j += 5) {
      f = b ^ c ^ d;
      t = a << 5 | a >>> 27;
      e = t + f + e - 899497514 + blocks2[j] >>> 0;
      b = b << 30 | b >>> 2;
      f = a ^ b ^ c;
      t = e << 5 | e >>> 27;
      d = t + f + d - 899497514 + blocks2[j + 1] >>> 0;
      a = a << 30 | a >>> 2;
      f = e ^ a ^ b;
      t = d << 5 | d >>> 27;
      c = t + f + c - 899497514 + blocks2[j + 2] >>> 0;
      e = e << 30 | e >>> 2;
      f = d ^ e ^ a;
      t = c << 5 | c >>> 27;
      b = t + f + b - 899497514 + blocks2[j + 3] >>> 0;
      d = d << 30 | d >>> 2;
      f = c ^ d ^ e;
      t = b << 5 | b >>> 27;
      a = t + f + a - 899497514 + blocks2[j + 4] >>> 0;
      c = c << 30 | c >>> 2;
    }
    this.#h0 = this.#h0 + a >>> 0;
    this.#h1 = this.#h1 + b >>> 0;
    this.#h2 = this.#h2 + c >>> 0;
    this.#h3 = this.#h3 + d >>> 0;
    this.#h4 = this.#h4 + e >>> 0;
  }
  hex() {
    this.finalize();
    const h0 = this.#h0;
    const h1 = this.#h1;
    const h2 = this.#h2;
    const h3 = this.#h3;
    const h4 = this.#h4;
    return HEX_CHARS[h0 >> 28 & 15] + HEX_CHARS[h0 >> 24 & 15] + HEX_CHARS[h0 >> 20 & 15] + HEX_CHARS[h0 >> 16 & 15] + HEX_CHARS[h0 >> 12 & 15] + HEX_CHARS[h0 >> 8 & 15] + HEX_CHARS[h0 >> 4 & 15] + HEX_CHARS[h0 & 15] + HEX_CHARS[h1 >> 28 & 15] + HEX_CHARS[h1 >> 24 & 15] + HEX_CHARS[h1 >> 20 & 15] + HEX_CHARS[h1 >> 16 & 15] + HEX_CHARS[h1 >> 12 & 15] + HEX_CHARS[h1 >> 8 & 15] + HEX_CHARS[h1 >> 4 & 15] + HEX_CHARS[h1 & 15] + HEX_CHARS[h2 >> 28 & 15] + HEX_CHARS[h2 >> 24 & 15] + HEX_CHARS[h2 >> 20 & 15] + HEX_CHARS[h2 >> 16 & 15] + HEX_CHARS[h2 >> 12 & 15] + HEX_CHARS[h2 >> 8 & 15] + HEX_CHARS[h2 >> 4 & 15] + HEX_CHARS[h2 & 15] + HEX_CHARS[h3 >> 28 & 15] + HEX_CHARS[h3 >> 24 & 15] + HEX_CHARS[h3 >> 20 & 15] + HEX_CHARS[h3 >> 16 & 15] + HEX_CHARS[h3 >> 12 & 15] + HEX_CHARS[h3 >> 8 & 15] + HEX_CHARS[h3 >> 4 & 15] + HEX_CHARS[h3 & 15] + HEX_CHARS[h4 >> 28 & 15] + HEX_CHARS[h4 >> 24 & 15] + HEX_CHARS[h4 >> 20 & 15] + HEX_CHARS[h4 >> 16 & 15] + HEX_CHARS[h4 >> 12 & 15] + HEX_CHARS[h4 >> 8 & 15] + HEX_CHARS[h4 >> 4 & 15] + HEX_CHARS[h4 & 15];
  }
  toString() {
    return this.hex();
  }
  digest() {
    this.finalize();
    const h0 = this.#h0;
    const h1 = this.#h1;
    const h2 = this.#h2;
    const h3 = this.#h3;
    const h4 = this.#h4;
    return [
      h0 >> 24 & 255,
      h0 >> 16 & 255,
      h0 >> 8 & 255,
      h0 & 255,
      h1 >> 24 & 255,
      h1 >> 16 & 255,
      h1 >> 8 & 255,
      h1 & 255,
      h2 >> 24 & 255,
      h2 >> 16 & 255,
      h2 >> 8 & 255,
      h2 & 255,
      h3 >> 24 & 255,
      h3 >> 16 & 255,
      h3 >> 8 & 255,
      h3 & 255,
      h4 >> 24 & 255,
      h4 >> 16 & 255,
      h4 >> 8 & 255,
      h4 & 255
    ];
  }
  array() {
    return this.digest();
  }
  arrayBuffer() {
    this.finalize();
    const buffer = new ArrayBuffer(20);
    const dataView = new DataView(buffer);
    dataView.setUint32(0, this.#h0);
    dataView.setUint32(4, this.#h1);
    dataView.setUint32(8, this.#h2);
    dataView.setUint32(12, this.#h3);
    dataView.setUint32(16, this.#h4);
    return buffer;
  }
};
var HmacSha1 = class extends Sha1 {
  #sharedMemory;
  #inner;
  #oKeyPad;
  constructor(secretKey, sharedMemory = false) {
    super(sharedMemory);
    let key;
    if (typeof secretKey === "string") {
      const bytes = [];
      const length = secretKey.length;
      let index = 0;
      for (let i = 0; i < length; i++) {
        let code = secretKey.charCodeAt(i);
        if (code < 128) {
          bytes[index++] = code;
        } else if (code < 2048) {
          bytes[index++] = 192 | code >> 6;
          bytes[index++] = 128 | code & 63;
        } else if (code < 55296 || code >= 57344) {
          bytes[index++] = 224 | code >> 12;
          bytes[index++] = 128 | code >> 6 & 63;
          bytes[index++] = 128 | code & 63;
        } else {
          code = 65536 + ((code & 1023) << 10 | secretKey.charCodeAt(++i) & 1023);
          bytes[index++] = 240 | code >> 18;
          bytes[index++] = 128 | code >> 12 & 63;
          bytes[index++] = 128 | code >> 6 & 63;
          bytes[index++] = 128 | code & 63;
        }
      }
      key = bytes;
    } else {
      if (secretKey instanceof ArrayBuffer) {
        key = new Uint8Array(secretKey);
      } else {
        key = secretKey;
      }
    }
    if (key.length > 64) {
      key = new Sha1(true).update(key).array();
    }
    const oKeyPad = [];
    const iKeyPad = [];
    for (let i = 0; i < 64; i++) {
      const b = key[i] || 0;
      oKeyPad[i] = 92 ^ b;
      iKeyPad[i] = 54 ^ b;
    }
    this.update(iKeyPad);
    this.#oKeyPad = oKeyPad;
    this.#inner = true;
    this.#sharedMemory = sharedMemory;
  }
  finalize() {
    super.finalize();
    if (this.#inner) {
      this.#inner = false;
      const innerHash = this.array();
      super.init(this.#sharedMemory);
      this.update(this.#oKeyPad);
      this.update(innerHash);
      super.finalize();
    }
  }
};
export {
  HmacSha1,
  Sha1
};
/*
 * [js-sha1]{@link https://github.com/emn178/js-sha1}
 *
 * @version 0.6.0
 * @author Chen, Yi-Cyuan [emn178@gmail.com]
 * @copyright Chen, Yi-Cyuan 2014-2017
 * @license MIT
 */

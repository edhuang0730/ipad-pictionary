/**
 * Pure TypeScript HTTP + RFC 6455 WebSocket Protocol Engine.
 * Zero Node-only dependencies so it runs identically inside React Native (Hermes/iOS)
 * over `react-native-tcp-socket` AND inside Node.js over `net`.
 */

const WS_GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';

const BASE64_CHARS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

export function bytesToBase64(bytes: Uint8Array): string {
  let result = '';
  const len = bytes.length;
  for (let i = 0; i < len; i += 3) {
    const b0 = bytes[i];
    const b1 = i + 1 < len ? bytes[i + 1] : 0;
    const b2 = i + 2 < len ? bytes[i + 2] : 0;

    const triplet = (b0 << 16) | (b1 << 8) | b2;
    result += BASE64_CHARS[(triplet >> 18) & 0x3f];
    result += BASE64_CHARS[(triplet >> 12) & 0x3f];
    result += i + 1 < len ? BASE64_CHARS[(triplet >> 6) & 0x3f] : '=';
    result += i + 2 < len ? BASE64_CHARS[triplet & 0x3f] : '=';
  }
  return result;
}

export function utf8Encode(str: string): Uint8Array {
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(str);
  }
  const out: number[] = [];
  for (let i = 0; i < str.length; i++) {
    let c = str.charCodeAt(i);
    if (c < 0x80) {
      out.push(c);
    } else if (c < 0x800) {
      out.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f));
    } else if (c >= 0xd800 && c <= 0xdbff && i + 1 < str.length) {
      const c2 = str.charCodeAt(++i);
      const codePoint = 0x10000 + (((c & 0x3ff) << 10) | (c2 & 0x3ff));
      out.push(
        0xf0 | (codePoint >> 18),
        0x80 | ((codePoint >> 12) & 0x3f),
        0x80 | ((codePoint >> 6) & 0x3f),
        0x80 | (codePoint & 0x3f)
      );
    } else {
      out.push(
        0xe0 | (c >> 12),
        0x80 | ((c >> 6) & 0x3f),
        0x80 | (c & 0x3f)
      );
    }
  }
  return new Uint8Array(out);
}

export function utf8Decode(bytes: Uint8Array): string {
  if (typeof TextDecoder !== 'undefined') {
    return new TextDecoder('utf-8').decode(bytes);
  }
  let out = '';
  let i = 0;
  while (i < bytes.length) {
    const c = bytes[i++];
    if (c < 0x80) {
      out += String.fromCharCode(c);
    } else if ((c & 0xe0) === 0xc0) {
      const c2 = bytes[i++] & 0x3f;
      out += String.fromCharCode(((c & 0x1f) << 6) | c2);
    } else if ((c & 0xf0) === 0xe0) {
      const c2 = bytes[i++] & 0x3f;
      const c3 = bytes[i++] & 0x3f;
      out += String.fromCharCode(((c & 0x0f) << 12) | (c2 << 6) | c3);
    } else if ((c & 0xf8) === 0xf0) {
      const c2 = bytes[i++] & 0x3f;
      const c3 = bytes[i++] & 0x3f;
      const c4 = bytes[i++] & 0x3f;
      const codePoint =
        (((c & 0x07) << 18) | (c2 << 12) | (c3 << 6) | c4) - 0x10000;
      out += String.fromCharCode(
        0xd800 + (codePoint >> 10),
        0xdc00 + (codePoint & 0x3ff)
      );
    }
  }
  return out;
}

/**
 * Computes SHA-1 digest of an ASCII/UTF-8 string and returns a 20-byte Uint8Array.
 */
export function sha1Bytes(input: string): Uint8Array {
  const msg = utf8Encode(input);
  const ml = msg.length * 8;

  // Pad to 512-bit (64-byte) blocks: message + 0x80 + zeros + 64-bit length
  const totalBytes = Math.ceil((msg.length + 9) / 64) * 64;
  const padded = new Uint8Array(totalBytes);
  padded.set(msg);
  padded[msg.length] = 0x80;

  const view = new DataView(padded.buffer);
  view.setUint32(totalBytes - 8, Math.floor(ml / 0x100000000), false);
  view.setUint32(totalBytes - 4, ml >>> 0, false);

  let h0 = 0x67452301;
  let h1 = 0xefcdab89;
  let h2 = 0x98badcfe;
  let h3 = 0x10325476;
  let h4 = 0xc3d2e1f0;

  const w = new Uint32Array(80);

  const rotl = (n: number, s: number) => ((n << s) | (n >>> (32 - s))) >>> 0;

  for (let offset = 0; offset < totalBytes; offset += 64) {
    for (let i = 0; i < 16; i++) {
      w[i] = view.getUint32(offset + i * 4, false);
    }
    for (let i = 16; i < 80; i++) {
      w[i] = rotl(w[i - 3] ^ w[i - 8] ^ w[i - 14] ^ w[i - 16], 1);
    }

    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;

    for (let i = 0; i < 80; i++) {
      let f = 0;
      let k = 0;
      if (i < 20) {
        f = ((b & c) | (~b & d)) >>> 0;
        k = 0x5a827999;
      } else if (i < 40) {
        f = (b ^ c ^ d) >>> 0;
        k = 0x6ed9eba1;
      } else if (i < 60) {
        f = ((b & c) | (b & d) | (c & d)) >>> 0;
        k = 0x8f1bbcdc;
      } else {
        f = (b ^ c ^ d) >>> 0;
        k = 0xca62c1d6;
      }

      const temp = (rotl(a, 5) + f + e + k + w[i]) >>> 0;
      e = d;
      d = c;
      c = rotl(b, 30);
      b = a;
      a = temp;
    }

    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
  }

  const digest = new Uint8Array(20);
  const digestView = new DataView(digest.buffer);
  digestView.setUint32(0, h0, false);
  digestView.setUint32(4, h1, false);
  digestView.setUint32(8, h2, false);
  digestView.setUint32(12, h3, false);
  digestView.setUint32(16, h4, false);
  return digest;
}

/**
 * Computes RFC 6455 Sec-WebSocket-Accept value from client's Sec-WebSocket-Key.
 */
export function computeWebSocketAcceptKey(secWebSocketKey: string): string {
  const combined = secWebSocketKey.trim() + WS_GUID;
  return bytesToBase64(sha1Bytes(combined));
}

export interface ParsedHttpRequest {
  method: string;
  path: string;
  headers: Record<string, string>;
  headerByteLength: number;
  remainingBytes: Uint8Array;
}

/**
 * Attempts to parse an HTTP request header block from an incoming TCP byte buffer.
 * Returns null if `\r\n\r\n` has not yet arrived.
 */
export function parseHttpRequest(buffer: Uint8Array): ParsedHttpRequest | null {
  let headerEndIndex = -1;
  for (let i = 0; i <= buffer.length - 4; i++) {
    if (
      buffer[i] === 13 &&
      buffer[i + 1] === 10 &&
      buffer[i + 2] === 13 &&
      buffer[i + 3] === 10
    ) {
      headerEndIndex = i + 4;
      break;
    }
  }

  if (headerEndIndex === -1) {
    return null;
  }

  const headerText = utf8Decode(buffer.subarray(0, headerEndIndex - 4));
  const lines = headerText.split('\r\n');
  const requestLine = lines[0] || 'GET / HTTP/1.1';
  const [method = 'GET', rawPath = '/'] = requestLine.split(' ');

  const headers: Record<string, string> = {};
  for (let i = 1; i < lines.length; i++) {
    const colonIdx = lines[i].indexOf(':');
    if (colonIdx !== -1) {
      const key = lines[i].slice(0, colonIdx).trim().toLowerCase();
      const val = lines[i].slice(colonIdx + 1).trim();
      headers[key] = val;
    }
  }

  return {
    method: method.toUpperCase(),
    path: rawPath,
    headers,
    headerByteLength: headerEndIndex,
    remainingBytes: buffer.subarray(headerEndIndex),
  };
}

export function buildHttpResponse(params: {
  status?: string;
  contentType?: string;
  body: string;
}): Uint8Array {
  const status = params.status || '200 OK';
  const contentType = params.contentType || 'text/html; charset=utf-8';
  const bodyBytes = utf8Encode(params.body);
  const headerStr =
    `HTTP/1.1 ${status}\r\n` +
    `Content-Type: ${contentType}\r\n` +
    `Content-Length: ${bodyBytes.length}\r\n` +
    `Cache-Control: no-store, no-cache, must-revalidate\r\n` +
    `Access-Control-Allow-Origin: *\r\n` +
    `Connection: close\r\n\r\n`;
  const headerBytes = utf8Encode(headerStr);
  const out = new Uint8Array(headerBytes.length + bodyBytes.length);
  out.set(headerBytes, 0);
  out.set(bodyBytes, headerBytes.length);
  return out;
}

export function buildWebSocketHandshakeResponse(
  secWebSocketKey: string
): Uint8Array {
  const acceptKey = computeWebSocketAcceptKey(secWebSocketKey);
  const response =
    `HTTP/1.1 101 Switching Protocols\r\n` +
    `Upgrade: websocket\r\n` +
    `Connection: Upgrade\r\n` +
    `Sec-WebSocket-Accept: ${acceptKey}\r\n\r\n`;
  return utf8Encode(response);
}

export interface DecodedWsFrame {
  fin: boolean;
  opcode: number;
  payload: Uint8Array;
  text?: string;
}

/**
 * Decodes as many complete RFC 6455 WebSocket frames as possible from `buffer`,
 * returning the decoded frames and any unconsumed trailing bytes.
 */
export function decodeWebSocketFrames(buffer: Uint8Array): {
  frames: DecodedWsFrame[];
  remaining: Uint8Array;
} {
  const frames: DecodedWsFrame[] = [];
  let offset = 0;

  while (offset + 2 <= buffer.length) {
    const b0 = buffer[offset];
    const b1 = buffer[offset + 1];

    const fin = (b0 & 0x80) !== 0;
    const opcode = b0 & 0x0f;
    const masked = (b1 & 0x80) !== 0;
    let payloadLen = b1 & 0x7f;
    let headerLen = 2;

    if (payloadLen === 126) {
      if (offset + 4 > buffer.length) break;
      payloadLen = (buffer[offset + 2] << 8) | buffer[offset + 3];
      headerLen = 4;
    } else if (payloadLen === 127) {
      if (offset + 10 > buffer.length) break;
      // Read lower 32 bits (safe for payloads up to 4GB)
      const high =
        (buffer[offset + 2] << 24) |
        (buffer[offset + 3] << 16) |
        (buffer[offset + 4] << 8) |
        buffer[offset + 5];
      const low =
        ((buffer[offset + 6] << 24) >>> 0) +
        ((buffer[offset + 7] << 16) |
          (buffer[offset + 8] << 8) |
          buffer[offset + 9]);
      payloadLen = high * 0x100000000 + low;
      headerLen = 10;
    }

    const maskLen = masked ? 4 : 0;
    const totalFrameLen = headerLen + maskLen + payloadLen;

    if (offset + totalFrameLen > buffer.length) {
      // Wait for more TCP chunks to complete this frame
      break;
    }

    const payloadStart = offset + headerLen + maskLen;
    const payload = new Uint8Array(payloadLen);

    if (masked) {
      const m0 = buffer[offset + headerLen];
      const m1 = buffer[offset + headerLen + 1];
      const m2 = buffer[offset + headerLen + 2];
      const m3 = buffer[offset + headerLen + 3];
      const mask = [m0, m1, m2, m3];

      for (let i = 0; i < payloadLen; i++) {
        payload[i] = buffer[payloadStart + i] ^ mask[i & 3];
      }
    } else {
      payload.set(buffer.subarray(payloadStart, payloadStart + payloadLen));
    }

    const frame: DecodedWsFrame = {
      fin,
      opcode,
      payload,
      text: opcode === 0x1 ? utf8Decode(payload) : undefined,
    };

    frames.push(frame);
    offset += totalFrameLen;
  }

  return {
    frames,
    remaining: buffer.subarray(offset),
  };
}

/**
 * Encodes an unmasked Server-to-Client RFC 6455 WebSocket frame.
 */
export function encodeWebSocketFrame(
  data: string | Uint8Array,
  opcode: number = 0x1
): Uint8Array {
  const payload = typeof data === 'string' ? utf8Encode(data) : data;
  const len = payload.length;

  let headerLen = 2;
  if (len >= 126 && len <= 65535) {
    headerLen = 4;
  } else if (len > 65535) {
    headerLen = 10;
  }

  const frame = new Uint8Array(headerLen + len);
  frame[0] = 0x80 | (opcode & 0x0f); // FIN=1 + opcode

  if (len < 126) {
    frame[1] = len;
  } else if (len <= 65535) {
    frame[1] = 126;
    frame[2] = (len >> 8) & 0xff;
    frame[3] = len & 0xff;
  } else {
    frame[1] = 127;
    const view = new DataView(frame.buffer);
    view.setUint32(2, Math.floor(len / 0x100000000), false);
    view.setUint32(6, len >>> 0, false);
  }

  frame.set(payload, headerLen);
  return frame;
}

export function concatUint8Arrays(a: Uint8Array, b: Uint8Array): Uint8Array {
  if (a.length === 0) return b;
  if (b.length === 0) return a;
  const out = new Uint8Array(a.length + b.length);
  out.set(a, 0);
  out.set(b, a.length);
  return out;
}

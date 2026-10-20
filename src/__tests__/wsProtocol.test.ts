import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  computeWebSocketAcceptKey,
  decodeWebSocketFrames,
  encodeWebSocketFrame,
  parseHttpRequest,
  utf8Decode,
  utf8Encode,
} from '../server/wsProtocol';
import { TcpHttpWsRouter } from '../server/EmbeddedServer';

/**
 * Helper to create a masked Client-to-Server WebSocket frame (as browsers send).
 */
function createMaskedClientFrame(
  text: string,
  maskKey: [number, number, number, number] = [0x37, 0xfa, 0x21, 0x3d]
): Uint8Array {
  const payload = utf8Encode(text);
  const len = payload.length;
  let headerLen = 2;
  if (len >= 126 && len <= 65535) {
    headerLen = 4;
  }

  const frame = new Uint8Array(headerLen + 4 + len);
  frame[0] = 0x81; // FIN + text frame
  if (len < 126) {
    frame[1] = 0x80 | len;
  } else {
    frame[1] = 0x80 | 126;
    frame[2] = (len >> 8) & 0xff;
    frame[3] = len & 0xff;
  }

  frame.set(maskKey, headerLen);
  for (let i = 0; i < len; i++) {
    frame[headerLen + 4 + i] = payload[i] ^ maskKey[i & 3];
  }
  return frame;
}

describe('HTTP & RFC 6455 WebSocket Protocol Engine', () => {
  it('computes the exact RFC 6455 Sec-WebSocket-Accept key', () => {
    // Official RFC 6455 Section 1.3 test vector
    const clientKey = 'dGhlIHNhbXBsZSBub25jZQ==';
    const expectedAccept = 's3pPLMBiTxaQ9kYGzzhZRbK+xOo=';
    assert.equal(computeWebSocketAcceptKey(clientKey), expectedAccept);
  });

  it('parses HTTP GET headers and detects incomplete header buffers', () => {
    const partial = utf8Encode('GET / HTTP/1.1\r\nHost: 192.168.1.50:8080\r\n');
    assert.equal(parseHttpRequest(partial), null);

    const complete = utf8Encode(
      'GET /ws HTTP/1.1\r\nHost: 192.168.1.50:8080\r\nUpgrade: websocket\r\nSec-WebSocket-Key: abc123==\r\n\r\n'
    );
    const parsed = parseHttpRequest(complete);
    assert.ok(parsed);
    assert.equal(parsed.method, 'GET');
    assert.equal(parsed.path, '/ws');
    assert.equal(parsed.headers['upgrade'], 'websocket');
    assert.equal(parsed.headers['sec-websocket-key'], 'abc123==');
  });

  it('decodes 16-bit masked WebSocket frames split across multiple TCP chunks (e.g. Selfie Base64 payload)', () => {
    const fakeSelfieDataUrl = 'data:image/jpeg;base64,' + 'A'.repeat(6000);
    const jsonMsg = JSON.stringify({
      type: 'JOIN_PLAYER',
      name: 'Sophia',
      avatarDataUrl: fakeSelfieDataUrl,
    });

    const maskedFrame = createMaskedClientFrame(jsonMsg);
    assert.ok(maskedFrame.length > 6000);

    // First partial TCP chunk (only 1500 bytes)
    const chunk1 = maskedFrame.subarray(0, 1500);
    const res1 = decodeWebSocketFrames(chunk1);
    assert.equal(res1.frames.length, 0);
    assert.equal(res1.remaining.length, 1500);

    // Full reassembled buffer
    const resFull = decodeWebSocketFrames(maskedFrame);
    assert.equal(resFull.frames.length, 1);
    assert.equal(resFull.remaining.length, 0);
    assert.equal(resFull.frames[0].text, jsonMsg);
  });

  it('serves the Phone Web App HTML on GET / and routes WebSocket messages on GET /ws', () => {
    const receivedMessages: any[] = [];
    const router = new TcpHttpWsRouter(
      (_clientId, msg, reply) => {
        receivedMessages.push(msg);
        reply({ type: 'PONG' });
      },
      () => {}
    );

    // 1. Test HTTP GET /
    const httpSentChunks: Uint8Array[] = [];
    let httpClosed = false;
    const httpClient = router.registerSocket(
      'c_http',
      (bytes) => httpSentChunks.push(bytes),
      () => {
        httpClosed = true;
      }
    );

    httpClient.onData(
      utf8Encode('GET / HTTP/1.1\r\nHost: 192.168.1.50:8080\r\n\r\n')
    );

    assert.equal(httpClosed, true);
    assert.equal(httpSentChunks.length, 1);
    const htmlResponseText = utf8Decode(httpSentChunks[0]);
    assert.ok(htmlResponseText.includes('HTTP/1.1 200 OK'));
    assert.ok(htmlResponseText.includes('capture="user"'));
    assert.ok(htmlResponseText.includes('simplifySelfieToAvatar'));
    assert.ok(htmlResponseText.includes('requestFullscreen'));

    // 2. Test WebSocket Upgrade + Message Exchange
    const wsSentChunks: Uint8Array[] = [];
    const wsClient = router.registerSocket(
      'c_ws',
      (bytes) => wsSentChunks.push(bytes),
      () => {}
    );

    wsClient.onData(
      utf8Encode(
        'GET /ws HTTP/1.1\r\nHost: 192.168.1.50:8080\r\nUpgrade: websocket\r\nSec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==\r\n\r\n'
      )
    );

    assert.equal(wsSentChunks.length, 1);
    const handshakeText = utf8Decode(wsSentChunks[0]);
    assert.ok(handshakeText.includes('101 Switching Protocols'));
    assert.ok(handshakeText.includes('s3pPLMBiTxaQ9kYGzzhZRbK+xOo='));

    // Send a masked JOIN_PLAYER message
    const joinMsg = JSON.stringify({
      type: 'JOIN_PLAYER',
      name: 'Leo',
      avatarDataUrl: 'data:image/jpeg;base64,xyz',
    });
    wsClient.onData(createMaskedClientFrame(joinMsg));

    assert.equal(receivedMessages.length, 1);
    assert.equal(receivedMessages[0].type, 'JOIN_PLAYER');
    assert.equal(receivedMessages[0].name, 'Leo');

    // Verify server replied with an unmasked WebSocket frame
    assert.equal(wsSentChunks.length, 2);
    const decodedReply = decodeWebSocketFrames(wsSentChunks[1]);
    assert.equal(decodedReply.frames.length, 1);
    assert.deepEqual(JSON.parse(decodedReply.frames[0].text!), {
      type: 'PONG',
    });
  });
});

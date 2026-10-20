const net = require('net');
const os = require('os');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT || 8080);
const WS_GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';

function getLocalLanIp() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const iface of nets[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

function loadPhoneClientHtml() {
  const tsPath = path.join(__dirname, '..', 'src', 'webClient', 'phoneClientHtml.ts');
  const raw = fs.readFileSync(tsPath, 'utf8');
  const startIdx = raw.indexOf('`<!DOCTYPE html>');
  const endIdx = raw.lastIndexOf('</html>`');
  if (startIdx !== -1 && endIdx !== -1) {
    return raw.slice(startIdx + 1, endIdx + 7);
  }
  return '<html><body>Error loading phone client HTML</body></html>';
}

function encodeWsFrame(text, opcode = 0x1) {
  const payload = Buffer.isBuffer(text) ? text : Buffer.from(text, 'utf8');
  const len = payload.length;
  let header;
  if (len < 126) {
    header = Buffer.alloc(2);
    header[0] = 0x80 | opcode;
    header[1] = len;
  } else if (len <= 65535) {
    header = Buffer.alloc(4);
    header[0] = 0x80 | opcode;
    header[1] = 126;
    header.writeUInt16BE(len, 2);
  } else {
    header = Buffer.alloc(10);
    header[0] = 0x80 | opcode;
    header[1] = 127;
    header.writeBigUInt64BE(BigInt(len), 2);
  }
  return Buffer.concat([header, payload]);
}

function decodeWsFrames(buffer) {
  const frames = [];
  let offset = 0;
  while (offset + 2 <= buffer.length) {
    const b0 = buffer[offset];
    const b1 = buffer[offset + 1];
    const opcode = b0 & 0x0f;
    const masked = (b1 & 0x80) !== 0;
    let len = b1 & 0x7f;
    let headerLen = 2;

    if (len === 126) {
      if (offset + 4 > buffer.length) break;
      len = buffer.readUInt16BE(offset + 2);
      headerLen = 4;
    } else if (len === 127) {
      if (offset + 10 > buffer.length) break;
      len = Number(buffer.readBigUInt64BE(offset + 2));
      headerLen = 10;
    }

    const maskLen = masked ? 4 : 0;
    const total = headerLen + maskLen + len;
    if (offset + total > buffer.length) break;

    const payloadStart = offset + headerLen + maskLen;
    const payload = Buffer.alloc(len);
    if (masked) {
      const mask = buffer.subarray(offset + headerLen, offset + headerLen + 4);
      for (let i = 0; i < len; i++) {
        payload[i] = buffer[payloadStart + i] ^ mask[i & 3];
      }
    } else {
      buffer.copy(payload, 0, payloadStart, payloadStart + len);
    }

    frames.push({ opcode, payload });
    offset += total;
  }

  return { frames, remaining: buffer.subarray(offset) };
}

const clients = new Map();
let hostClientId = null;
let counter = 0;
const lanIp = getLocalLanIp();

const server = net.createServer((socket) => {
  counter += 1;
  const clientId = `lan_${Date.now()}_${counter}`;
  let isWs = false;
  let buffer = Buffer.alloc(0);

  clients.set(clientId, { socket, isWs: false });

  socket.on('data', (chunk) => {
    buffer = Buffer.concat([buffer, chunk]);

    if (!isWs) {
      const headerEnd = buffer.indexOf('\r\n\r\n');
      if (headerEnd === -1) return;

      const headerStr = buffer.subarray(0, headerEnd).toString('utf8');
      buffer = buffer.subarray(headerEnd + 4);

      const lines = headerStr.split('\r\n');
      const headers = {};
      for (let i = 1; i < lines.length; i++) {
        const idx = lines[i].indexOf(':');
        if (idx !== -1) {
          headers[lines[i].slice(0, idx).trim().toLowerCase()] = lines[i]
            .slice(idx + 1)
            .trim();
        }
      }

      if (
        (headers['upgrade'] || '').toLowerCase() === 'websocket' &&
        headers['sec-websocket-key']
      ) {
        isWs = true;
        clients.get(clientId).isWs = true;
        const accept = crypto
          .createHash('sha1')
          .update(headers['sec-websocket-key'] + WS_GUID)
          .digest('base64');

        socket.write(
          `HTTP/1.1 101 Switching Protocols\r\n` +
            `Upgrade: websocket\r\n` +
            `Connection: Upgrade\r\n` +
            `Sec-WebSocket-Accept: ${accept}\r\n\r\n`
        );
      } else {
        const html = loadPhoneClientHtml();
        const body = Buffer.from(html, 'utf8');
        socket.write(
          `HTTP/1.1 200 OK\r\n` +
            `Content-Type: text/html; charset=utf-8\r\n` +
            `Content-Length: ${body.length}\r\n` +
            `Cache-Control: no-store\r\n` +
            `Connection: close\r\n\r\n`
        );
        socket.write(body);
        socket.end();
        return;
      }
    }

    if (isWs && buffer.length > 0) {
      const { frames, remaining } = decodeWsFrames(buffer);
      buffer = remaining;

      for (const frame of frames) {
        if (frame.opcode === 0x8) {
          socket.end();
          return;
        }
        if (frame.opcode === 0x9) {
          socket.write(encodeWsFrame(frame.payload, 0x0a));
          continue;
        }
        if (frame.opcode === 0x1) {
          try {
            const msg = JSON.parse(frame.payload.toString('utf8'));
            handleWsMessage(clientId, msg);
          } catch {}
        }
      }
    }
  });

  const cleanup = () => {
    clients.delete(clientId);
    if (clientId === hostClientId) {
      hostClientId = null;
    } else if (hostClientId && clients.has(hostClientId)) {
      const host = clients.get(hostClientId);
      host.socket.write(
        encodeWsFrame(
          JSON.stringify({
            type: 'COMPANION_CLIENT_DISCONNECT',
            clientId,
          })
        )
      );
    }
  };

  socket.on('close', cleanup);
  socket.on('error', cleanup);
});

function handleWsMessage(clientId, msg) {
  if (msg.type === 'REGISTER_HOST') {
    hostClientId = clientId;
    const host = clients.get(clientId);
    if (host) {
      host.socket.write(
        encodeWsFrame(
          JSON.stringify({
            type: 'HOST_REGISTERED',
            lanIp,
            port: PORT,
          })
        )
      );
    }
    return;
  }

  if (msg.type === 'HOST_BROADCAST' && clientId === hostClientId) {
    const encoded = encodeWsFrame(JSON.stringify(msg.payload));
    for (const [id, c] of clients.entries()) {
      if (id !== hostClientId && c.isWs) {
        c.socket.write(encoded);
      }
    }
    return;
  }

  if (msg.type === 'HOST_DIRECT_REPLY' && clientId === hostClientId) {
    const target = clients.get(msg.clientId);
    if (target && target.isWs) {
      target.socket.write(encodeWsFrame(JSON.stringify(msg.payload)));
    }
    return;
  }

  // Forward player phone messages to the Host
  if (hostClientId && clients.has(hostClientId)) {
    const host = clients.get(hostClientId);
    host.socket.write(
      encodeWsFrame(
        JSON.stringify({
          type: 'COMPANION_CLIENT_MSG',
          clientId,
          payload: msg,
        })
      )
    );
  }
}

server.listen(PORT, '0.0.0.0', () => {
  console.log('==========================================================');
  console.log('🎨 Pictionary Party — Local LAN Server Running!');
  console.log(`📱 Phone Join URL : http://${lanIp}:${PORT}`);
  console.log(`🔌 WebSocket URL  : ws://${lanIp}:${PORT}/ws`);
  console.log('==========================================================');
});

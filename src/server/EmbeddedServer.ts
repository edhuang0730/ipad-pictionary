import { Platform } from 'react-native';
import * as Network from 'expo-network';
import {
  buildHttpResponse,
  buildWebSocketHandshakeResponse,
  concatUint8Arrays,
  decodeWebSocketFrames,
  encodeWebSocketFrame,
  parseHttpRequest,
  utf8Decode,
} from './wsProtocol';
import { PHONE_CLIENT_HTML } from '../webClient/phoneClientHtml';
import {
  ClientToServerMessage,
  ServerToClientMessage,
} from '../types/game';

export interface ServerStatus {
  running: boolean;
  mode: 'embedded-native' | 'lan-companion' | 'offline';
  ipAddress: string;
  port: number;
  url: string;
  error?: string;
}

export type ClientMessageHandler = (
  clientId: string,
  message: ClientToServerMessage,
  reply: (msg: ServerToClientMessage) => void
) => void;

export type ClientDisconnectHandler = (clientId: string) => void;

interface ClientSession {
  id: string;
  isWebSocket: boolean;
  buffer: Uint8Array;
  fragmentedChunks: Uint8Array[];
  sendRaw: (bytes: Uint8Array) => void;
  close: () => void;
}

/**
 * Manages raw TCP client sockets, handling both HTTP GET requests (serving the phone web app)
 * and upgrading `/ws` connections to persistent RFC 6455 WebSockets.
 */
export class TcpHttpWsRouter {
  private sessions = new Map<string, ClientSession>();
  private onMessage: ClientMessageHandler;
  private onDisconnect: ClientDisconnectHandler;

  constructor(
    onMessage: ClientMessageHandler,
    onDisconnect: ClientDisconnectHandler
  ) {
    this.onMessage = onMessage;
    this.onDisconnect = onDisconnect;
  }

  public registerSocket(
    clientId: string,
    sendRaw: (bytes: Uint8Array) => void,
    close: () => void
  ): {
    onData: (chunk: Uint8Array) => void;
    onClose: () => void;
  } {
    const session: ClientSession = {
      id: clientId,
      isWebSocket: false,
      buffer: new Uint8Array(0),
      fragmentedChunks: [],
      sendRaw,
      close,
    };
    this.sessions.set(clientId, session);

    return {
      onData: (chunk: Uint8Array) => this.handleChunk(session, chunk),
      onClose: () => this.handleSocketClose(session.id),
    };
  }

  private handleChunk(session: ClientSession, chunk: Uint8Array): void {
    session.buffer = concatUint8Arrays(session.buffer, chunk);

    if (!session.isWebSocket) {
      const req = parseHttpRequest(session.buffer);
      if (!req) {
        return; // Wait for complete HTTP headers
      }

      session.buffer = req.remainingBytes;
      const upgradeHeader = (req.headers['upgrade'] || '').toLowerCase();
      const wsKey = req.headers['sec-websocket-key'];

      if (upgradeHeader === 'websocket' && wsKey) {
        // Upgrade connection to WebSocket
        session.isWebSocket = true;
        const handshake = buildWebSocketHandshakeResponse(wsKey);
        session.sendRaw(handshake);

        // If any WebSocket frames arrived in the same TCP packet after headers, process them
        if (session.buffer.length > 0) {
          this.processWebSocketBuffer(session);
        }
        return;
      }

      // Standard HTTP request -> Serve Phone Web App
      if (req.path === '/health') {
        const res = buildHttpResponse({
          contentType: 'application/json; charset=utf-8',
          body: JSON.stringify({ ok: true }),
        });
        session.sendRaw(res);
        session.close();
        return;
      }

      const htmlResponse = buildHttpResponse({
        contentType: 'text/html; charset=utf-8',
        body: PHONE_CLIENT_HTML,
      });
      session.sendRaw(htmlResponse);
      session.close();
      return;
    }

    this.processWebSocketBuffer(session);
  }

  private processWebSocketBuffer(session: ClientSession): void {
    const { frames, remaining } = decodeWebSocketFrames(session.buffer);
    session.buffer = remaining;

    for (const frame of frames) {
      if (frame.opcode === 0x8) {
        // Connection Close frame
        session.close();
        this.handleSocketClose(session.id);
        return;
      }

      if (frame.opcode === 0x9) {
        // Ping -> Reply with Pong (0xA)
        const pong = encodeWebSocketFrame(frame.payload, 0x0a);
        session.sendRaw(pong);
        continue;
      }

      if (frame.opcode === 0x1 || frame.opcode === 0x0) {
        if (!frame.fin) {
          session.fragmentedChunks.push(frame.payload);
          continue;
        }

        let fullPayload = frame.payload;
        if (session.fragmentedChunks.length > 0) {
          fullPayload = session.fragmentedChunks.reduce(
            (acc, cur) => concatUint8Arrays(acc, cur),
            new Uint8Array(0)
          );
          fullPayload = concatUint8Arrays(fullPayload, frame.payload);
          session.fragmentedChunks = [];
        }

        const text = utf8Decode(fullPayload);
        try {
          const parsed = JSON.parse(text) as ClientToServerMessage;
          this.onMessage(session.id, parsed, (replyMsg) => {
            this.sendToClient(session.id, replyMsg);
          });
        } catch {
          // Ignore malformed JSON
        }
      }
    }
  }

  public sendToClient(clientId: string, message: ServerToClientMessage): void {
    const session = this.sessions.get(clientId);
    if (!session || !session.isWebSocket) return;
    const encoded = encodeWebSocketFrame(JSON.stringify(message), 0x1);
    session.sendRaw(encoded);
  }

  public broadcast(message: ServerToClientMessage): void {
    const encoded = encodeWebSocketFrame(JSON.stringify(message), 0x1);
    for (const session of this.sessions.values()) {
      if (session.isWebSocket) {
        session.sendRaw(encoded);
      }
    }
  }

  private handleSocketClose(clientId: string): void {
    const existed = this.sessions.get(clientId);
    if (existed) {
      this.sessions.delete(clientId);
      if (existed.isWebSocket) {
        this.onDisconnect(clientId);
      }
    }
  }

  public closeAll(): void {
    for (const session of this.sessions.values()) {
      try {
        session.close();
      } catch {}
    }
    this.sessions.clear();
  }
}

/**
 * Embedded iPad HTTP + WebSocket Server with automatic fallback to LAN Companion Bridge
 * when testing in Web/Expo Go on Windows.
 */
export class EmbeddedGameServer {
  private router: TcpHttpWsRouter;
  private tcpServer: any = null;
  private companionWs: WebSocket | null = null;
  private status: ServerStatus = {
    running: false,
    mode: 'offline',
    ipAddress: '127.0.0.1',
    port: 8080,
    url: 'http://127.0.0.1:8080',
  };
  private onStatusChange: (status: ServerStatus) => void;
  private onMessage: ClientMessageHandler;
  private onDisconnect: ClientDisconnectHandler;

  constructor(params: {
    onMessage: ClientMessageHandler;
    onDisconnect: ClientDisconnectHandler;
    onStatusChange: (status: ServerStatus) => void;
  }) {
    this.onMessage = params.onMessage;
    this.onDisconnect = params.onDisconnect;
    this.onStatusChange = params.onStatusChange;
    this.router = new TcpHttpWsRouter(params.onMessage, params.onDisconnect);
  }

  public async start(preferredPort: number = 8080): Promise<ServerStatus> {
    let ip = '127.0.0.1';
    try {
      if (Platform.OS !== 'web') {
        const detectedIp = await Network.getIpAddressAsync();
        if (detectedIp && detectedIp !== '0.0.0.0') {
          ip = detectedIp;
        }
      } else if (
        typeof window !== 'undefined' &&
        window.location &&
        window.location.hostname
      ) {
        ip = window.location.hostname;
      }
    } catch {}

    // 1. Try starting the native embedded TCP server on iPad (react-native-tcp-socket)
    if (Platform.OS !== 'web') {
      try {
        // Dynamic require so web/Expo Go doesn't crash if native module isn't linked
        const TcpSocket = require('react-native-tcp-socket');
        if (TcpSocket && typeof TcpSocket.createServer === 'function') {
          const boundPort = await this.bindNativeTcpServer(
            TcpSocket,
            preferredPort
          );
          this.status = {
            running: true,
            mode: 'embedded-native',
            ipAddress: ip,
            port: boundPort,
            url: `http://${ip}:${boundPort}`,
          };
          this.onStatusChange(this.status);
          return this.status;
        }
      } catch (err: any) {
        // Native module not available (e.g., running inside Expo Go instead of sideloaded .ipa)
      }
    }

    // 2. Fallback: Connect to LAN Companion Server (for Windows Web preview or Expo Go testing)
    return this.connectLanCompanionBridge(ip, preferredPort);
  }

  private bindNativeTcpServer(
    TcpSocket: any,
    startPort: number
  ): Promise<number> {
    return new Promise((resolve, reject) => {
      let portAttempt = startPort;
      let sockCounter = 0;

      const tryListen = (port: number) => {
        const server = TcpSocket.createServer((socket: any) => {
          sockCounter += 1;
          const clientId = `tcp_${Date.now()}_${sockCounter}`;

          const handlers = this.router.registerSocket(
            clientId,
            (bytes: Uint8Array) => {
              try {
                // react-native-tcp-socket accepts Buffer or Uint8Array
                socket.write(bytes);
              } catch {}
            },
            () => {
              try {
                socket.destroy();
              } catch {}
            }
          );

          socket.on('data', (data: any) => {
            const chunk =
              data instanceof Uint8Array ? data : new Uint8Array(data);
            handlers.onData(chunk);
          });

          socket.on('close', () => {
            handlers.onClose();
          });

          socket.on('error', () => {
            handlers.onClose();
          });
        });

        server.on('error', (err: any) => {
          if (port < startPort + 10) {
            try {
              server.close();
            } catch {}
            tryListen(port + 1);
          } else {
            reject(err);
          }
        });

        server.listen({ port, host: '0.0.0.0' }, () => {
          this.tcpServer = server;
          resolve(port);
        });
      };

      tryListen(portAttempt);
    });
  }

  private connectLanCompanionBridge(
    fallbackIp: string,
    port: number
  ): Promise<ServerStatus> {
    return new Promise((resolve) => {
      try {
        const wsHost =
          typeof window !== 'undefined' && window.location?.hostname
            ? window.location.hostname
            : fallbackIp;
        const wsUrl = `ws://${wsHost}:${port}/ws`;
        const ws = new WebSocket(wsUrl);
        this.companionWs = ws;

        ws.onopen = () => {
          ws.send(JSON.stringify({ type: 'REGISTER_HOST' }));
        };

        ws.onmessage = (ev) => {
          try {
            const msg = JSON.parse(ev.data);
            if (msg.type === 'HOST_REGISTERED') {
              const lanIp = msg.lanIp || wsHost;
              this.status = {
                running: true,
                mode: 'lan-companion',
                ipAddress: lanIp,
                port: msg.port || port,
                url: `http://${lanIp}:${msg.port || port}`,
              };
              this.onStatusChange(this.status);
              resolve(this.status);
              return;
            }

            if (msg.type === 'COMPANION_CLIENT_MSG') {
              const clientId = msg.clientId;
              const payload = msg.payload as ClientToServerMessage;
              this.onMessage(clientId, payload, (replyMsg) => {
                if (ws.readyState === WebSocket.OPEN) {
                  ws.send(
                    JSON.stringify({
                      type: 'HOST_DIRECT_REPLY',
                      clientId,
                      payload: replyMsg,
                    })
                  );
                }
              });
            } else if (msg.type === 'COMPANION_CLIENT_DISCONNECT') {
              this.onDisconnect(msg.clientId);
            }
          } catch {}
        };

        ws.onerror = () => {
          this.status = {
            running: false,
            mode: 'offline',
            ipAddress: fallbackIp,
            port,
            url: `http://${fallbackIp}:${port}`,
            error:
              'Embedded TCP server requires the native iPad .ipa build (or run `npm run lan-host` on PC for web preview).',
          };
          this.onStatusChange(this.status);
          resolve(this.status);
        };
      } catch (e: any) {
        this.status = {
          running: false,
          mode: 'offline',
          ipAddress: fallbackIp,
          port,
          url: `http://${fallbackIp}:${port}`,
          error: e?.message || 'Unable to start server',
        };
        this.onStatusChange(this.status);
        resolve(this.status);
      }
    });
  }

  public broadcast(message: ServerToClientMessage): void {
    if (this.status.mode === 'embedded-native') {
      this.router.broadcast(message);
    } else if (
      this.status.mode === 'lan-companion' &&
      this.companionWs &&
      this.companionWs.readyState === WebSocket.OPEN
    ) {
      this.companionWs.send(
        JSON.stringify({
          type: 'HOST_BROADCAST',
          payload: message,
        })
      );
    }
  }

  public stop(): void {
    this.router.closeAll();
    if (this.tcpServer) {
      try {
        this.tcpServer.close();
      } catch {}
      this.tcpServer = null;
    }
    if (this.companionWs) {
      try {
        this.companionWs.close();
      } catch {}
      this.companionWs = null;
    }
  }
}

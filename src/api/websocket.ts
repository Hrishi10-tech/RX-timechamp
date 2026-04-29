/** WebSocket client with auto-reconnect, JWT auth, and typed message handling. */

import type { WebSocketMessage, WebSocketMessageType } from "@/types/api";
import { TOKEN_STORAGE_KEYS, WEBSOCKET } from "@/config/constants";

type MessageHandler = (message: WebSocketMessage) => void;

interface WebSocketClientOptions {
  url: string;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
}

export class WebSocketClient {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private handlers: Map<WebSocketMessageType, Set<MessageHandler>> = new Map();
  private globalHandlers: Set<MessageHandler> = new Set();
  private subscribedDevices: Set<string> = new Set();
  private isManualClose = false;
  private readonly options: WebSocketClientOptions;

  constructor(options: WebSocketClientOptions) {
    this.options = options;
  }

  connect(): void {
    const token = localStorage.getItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN);
    if (!token) {
      return;
    }

    this.isManualClose = false;

    const url = new URL(this.options.url);
    url.searchParams.set("token", token);

    this.socket = new WebSocket(url.toString());

    this.socket.onopen = () => {
      this.reconnectAttempts = 0;
      this.startHeartbeat();
      this.resubscribeDevices();
      this.options.onOpen?.();
    };

    this.socket.onmessage = (event: MessageEvent) => {
      this.handleMessage(event);
    };

    this.socket.onclose = () => {
      this.stopHeartbeat();
      this.options.onClose?.();
      if (!this.isManualClose) {
        this.scheduleReconnect();
      }
    };

    this.socket.onerror = (event: Event) => {
      this.options.onError?.(event);
    };
  }

  disconnect(): void {
    this.isManualClose = true;
    this.stopHeartbeat();
    this.clearReconnectTimer();
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  subscribe(type: WebSocketMessageType, handler: MessageHandler): () => void {
    const handlers = this.handlers.get(type) ?? new Set();
    handlers.add(handler);
    this.handlers.set(type, handlers);

    return () => {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.handlers.delete(type);
      }
    };
  }

  onMessage(handler: MessageHandler): () => void {
    this.globalHandlers.add(handler);
    return () => {
      this.globalHandlers.delete(handler);
    };
  }

  subscribeDevice(deviceId: string): void {
    this.subscribedDevices.add(deviceId);
    this.sendMessage({
      type: "subscribe_device",
      device_id: deviceId,
    });
  }

  unsubscribeDevice(deviceId: string): void {
    this.subscribedDevices.delete(deviceId);
    this.sendMessage({
      type: "unsubscribe_device",
      device_id: deviceId,
    });
  }

  get isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  private handleMessage(event: MessageEvent): void {
    let message: WebSocketMessage;
    try {
      message = JSON.parse(String(event.data)) as WebSocketMessage;
    } catch {
      return;
    }

    const typeHandlers = this.handlers.get(message.type);
    if (typeHandlers) {
      for (const handler of typeHandlers) {
        handler(message);
      }
    }

    for (const handler of this.globalHandlers) {
      handler(message);
    }
  }

  private sendMessage(data: Record<string, unknown>): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    }
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      this.sendMessage({ type: "ping" });
    }, WEBSOCKET.HEARTBEAT_INTERVAL_MS);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= WEBSOCKET.MAX_RECONNECT_ATTEMPTS) {
      return;
    }

    const delay = Math.min(
      WEBSOCKET.RECONNECT_BASE_DELAY_MS *
        Math.pow(WEBSOCKET.RECONNECT_MULTIPLIER, this.reconnectAttempts),
      WEBSOCKET.RECONNECT_MAX_DELAY_MS,
    );

    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts += 1;
      this.connect();
    }, delay);
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private resubscribeDevices(): void {
    for (const deviceId of this.subscribedDevices) {
      this.sendMessage({
        type: "subscribe_device",
        device_id: deviceId,
      });
    }
  }
}

const WS_URL = import.meta.env.VITE_WS_URL ?? "wss://rx-timechamp-be.onrender.com/ws";

export const wsClient = new WebSocketClient({ url: WS_URL });

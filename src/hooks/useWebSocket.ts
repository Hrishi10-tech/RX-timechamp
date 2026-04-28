/** WebSocket connection hook for real-time updates. */

import { useCallback, useEffect, useRef, useState } from "react";

import type { WebSocketMessage, WebSocketMessageType } from "@/types/api";
import { wsClient } from "@/api/websocket";
import { useAuthStore } from "@/stores/authStore";

export interface UseWebSocketReturn {
  isConnected: boolean;
  subscribe: (type: WebSocketMessageType, handler: (msg: WebSocketMessage) => void) => void;
  subscribeDevice: (deviceId: string) => void;
  unsubscribeDevice: (deviceId: string) => void;
}

export function useWebSocket(): UseWebSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const unsubscribersRef = useRef<Array<() => void>>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      wsClient.disconnect();
      setIsConnected(false);
      return;
    }

    const originalOnOpen = wsClient["options"].onOpen;
    const originalOnClose = wsClient["options"].onClose;

    wsClient["options"].onOpen = () => {
      setIsConnected(true);
      originalOnOpen?.();
    };

    wsClient["options"].onClose = () => {
      setIsConnected(false);
      originalOnClose?.();
    };

    wsClient.connect();

    return () => {
      for (const unsub of unsubscribersRef.current) {
        unsub();
      }
      unsubscribersRef.current = [];
      wsClient.disconnect();
    };
  }, [isAuthenticated]);

  const subscribe = useCallback(
    (type: WebSocketMessageType, handler: (msg: WebSocketMessage) => void): void => {
      const unsub = wsClient.subscribe(type, handler);
      unsubscribersRef.current.push(unsub);
    },
    [],
  );

  const subscribeDevice = useCallback((deviceId: string): void => {
    wsClient.subscribeDevice(deviceId);
  }, []);

  const unsubscribeDevice = useCallback((deviceId: string): void => {
    wsClient.unsubscribeDevice(deviceId);
  }, []);

  return {
    isConnected,
    subscribe,
    subscribeDevice,
    unsubscribeDevice,
  };
}

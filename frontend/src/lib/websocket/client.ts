import { AgentEventLog } from '@/types/crm.types';
import { safeStorage } from '@/lib/storage';

export type ConnectionStatus = 'CONNECTING' | 'OPEN' | 'CLOSED' | 'ERROR';
export type EventListener = (event: AgentEventLog) => void;

class RealtimeWebSocketClient {
  private socket: WebSocket | null = null;
  private url: string;
  private listeners: Set<EventListener> = new Set();
  private statusListeners: Set<(status: ConnectionStatus) => void> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000;
  private currentStatus: ConnectionStatus = 'CLOSED';

  constructor() {
    if (!import.meta.env.VITE_WS_URL && typeof window !== 'undefined') {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'localhost:8000'
        : window.location.host;
      this.url = `${protocol}//${host}/ws`;
    } else {
      this.url = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws';
    }
  }

  /**
   * SECURITY: Build WebSocket URL with auth token query parameter.
   * The backend accepts optional `token` for authenticated connections.
   */
  private getAuthenticatedUrl(): string {
    const token = safeStorage.getItem('crm_access_token');
    if (token) {
      const separator = this.url.includes('?') ? '&' : '?';
      return `${this.url}${separator}token=${encodeURIComponent(token)}`;
    }
    return this.url;
  }

  public connect() {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.setStatus('CONNECTING');

    try {
      // SECURITY: Pass auth token for authenticated WebSocket connections
      const wsUrl = this.getAuthenticatedUrl();
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        this.setStatus('OPEN');
        this.reconnectAttempts = 0;
      };

      this.socket.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          const logEvent: AgentEventLog = {
            id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            timestamp: parsed.timestamp || new Date().toISOString(),
            agent: parsed.agent || parsed.data?.agent || 'System',
            type: parsed.type || 'system_event',
            data: parsed,
          };
          this.notifyListeners(logEvent);
        } catch {
          // Ignore unparseable frames
        }
      };

      this.socket.onerror = () => {
        this.setStatus('ERROR');
      };

      this.socket.onclose = () => {
        this.setStatus('CLOSED');
        this.attemptReconnect();
      };
    } catch {
      this.setStatus('CLOSED');
      this.attemptReconnect();
    }
  }

  public disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.setStatus('CLOSED');
  }

  public send(data: Record<string, any>) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    }
  }

  public subscribe(listener: EventListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public onStatusChange(callback: (status: ConnectionStatus) => void): () => void {
    this.statusListeners.add(callback);
    callback(this.currentStatus);
    return () => {
      this.statusListeners.delete(callback);
    };
  }

  private setStatus(status: ConnectionStatus) {
    this.currentStatus = status;
    this.statusListeners.forEach((cb) => cb(status));
  }

  private notifyListeners(event: AgentEventLog) {
    this.listeners.forEach((listener) => listener(event));
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        this.connect();
      }, this.reconnectInterval * Math.pow(1.5, this.reconnectAttempts - 1));
    }
  }
}

export const realtimeClient = new RealtimeWebSocketClient();

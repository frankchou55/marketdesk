import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { filter, tap } from 'rxjs/operators';

// Binance.US is the US-compliant endpoint (binance.com blocks US IPs). Same message format.
const STREAM_BASE_URL = 'wss://stream.binance.us:9443/stream';

export interface ConnectionStatus {
  state: 'connecting' | 'live' | 'reconnecting' | 'offline';
  message: string;
}

export interface BinanceTick {
  s: string; // symbol
  c: string; // close/last price
  o: string; // open price
  h: string; // high
  l: string; // low
  v: string; // volume
  a: number; // ask price
  b: number; // bid price
  E: number; // event time
}

@Injectable({ providedIn: 'root' })
export class MarketSocketService {
  private ws$: WebSocketSubject<any> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000;
  private activeSymbols = new Set<string>([
    'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'DOGEUSDT',
    'SOLUSDT', 'XRPUSDT', 'AVAXUSDT', 'LINKUSDT', 'DOTUSDT',
    'LTCUSDT', 'MATICUSDT', 'ATOMUSDT', 'UNIUSDT', 'SHIBUSDT',
  ]);

  private connectionSubject = new BehaviorSubject<ConnectionStatus>({
    state: 'offline',
    message: 'Disconnected',
  });

  public connection$ = this.connectionSubject.asObservable();

  private ticksSubject = new Subject<BinanceTick[]>();
  public ticks$ = this.ticksSubject.asObservable();

  private worker: Worker | null = null;
  private tickBuffer: BinanceTick[] = [];
  private flushTimer: ReturnType<typeof setTimeout> | null = null;
  private flushInterval = 100; // ms

  constructor() {
    this.initWorker();
  }

  private initWorker(): void {
    if (typeof Worker !== 'undefined') {
      try {
        this.worker = new Worker(new URL('./market.worker', import.meta.url), { type: 'module' });
        this.worker.onmessage = ({ data }: MessageEvent<BinanceTick[]>) => {
          this.ticksSubject.next(data);
        };
      } catch (e) {
        console.warn('Web Worker not available, processing on main thread', e);
      }
    }
  }

  connect(): void {
    if (this.ws$) return;
    this.clearReconnectTimer();

    this.connectionSubject.next({ state: 'connecting', message: 'Connecting to Binance...' });

    const streamNames = Array.from(this.activeSymbols)
      .map((s) => `${s.toLowerCase()}@ticker`)
      .join('/');

    const wsUrl = `${STREAM_BASE_URL}?streams=${streamNames}`;

    const socket: WebSocketSubject<any> = webSocket({
      url: wsUrl,
      openObserver: {
        next: () => {
          if (this.ws$ !== socket) return;
          this.reconnectAttempts = 0;
          this.connectionSubject.next({ state: 'live', message: 'Connected' });
        },
      },
      closeObserver: {
        next: () => this.handleDrop(socket, 'Connection closed'),
      },
    });
    this.ws$ = socket;

    socket
      .pipe(
        filter((msg: any) => msg.data?.e === '24hrTicker'),
        tap((msg: any) => {
          const tick: BinanceTick = {
            s: msg.data.s,
            c: msg.data.c,
            o: msg.data.o,
            h: msg.data.h,
            l: msg.data.l,
            v: msg.data.v,
            a: parseFloat(msg.data.a),
            b: parseFloat(msg.data.b),
            E: msg.data.E,
          };
          this.processTick(tick);
        })
      )
      .subscribe({
        error: (err) => {
          console.error('WebSocket error:', err);
          this.handleDrop(socket, 'Connection error');
        },
      });
  }

  // Only the current socket may trigger a reconnect; sockets we closed ourselves are ignored.
  private handleDrop(socket: WebSocketSubject<any>, message: string): void {
    if (this.ws$ !== socket) return;
    this.ws$ = null;
    this.connectionSubject.next({ state: 'offline', message });
    this.reconnect();
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private processTick(tick: BinanceTick): void {
    this.tickBuffer.push(tick);
    if (!this.flushTimer) {
      this.flushTimer = setTimeout(() => {
        this.flushTimer = null;
        this.flushBuffer();
      }, this.flushInterval);
    }
  }

  private flushBuffer(): void {
    if (this.tickBuffer.length === 0) return;

    if (this.worker) {
      this.worker.postMessage(this.tickBuffer);
    } else {
      this.ticksSubject.next(this.tickBuffer);
    }

    this.tickBuffer = [];
  }

  private reconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.connectionSubject.next({
        state: 'offline',
        message: 'Max reconnection attempts reached',
      });
      return;
    }

    this.reconnectAttempts++;
    this.connectionSubject.next({
      state: 'reconnecting',
      message: `Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`,
    });

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts - 1), 30000);
    this.clearReconnectTimer();
    this.reconnectTimer = setTimeout(() => this.connect(), delay);
  }

  disconnect(): void {
    this.clearReconnectTimer();
    const socket = this.ws$;
    this.ws$ = null; // detach first so the close event is treated as intentional
    socket?.complete();
  }

  subscribeToSymbol(symbol: string): void {
    this.activeSymbols.add(symbol);
    if (this.ws$) {
      this.disconnect();
      this.connect();
    }
  }

  unsubscribeFromSymbol(symbol: string): void {
    this.activeSymbols.delete(symbol);
    if (this.ws$) {
      this.disconnect();
      this.connect();
    }
  }
}

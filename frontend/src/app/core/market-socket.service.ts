import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { filter, tap } from 'rxjs/operators';

// Binance.US is the US-compliant endpoint (binance.com blocks US IPs). Same message format.
const STREAM_BASE_URL = 'wss://stream.binance.us:9443/stream';

const DEFAULT_SYMBOLS = [
  'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'DOGEUSDT',
  'SOLUSDT', 'XRPUSDT', 'AVAXUSDT', 'LINKUSDT', 'DOTUSDT',
  'LTCUSDT', 'MATICUSDT', 'ATOMUSDT', 'UNIUSDT', 'SHIBUSDT',
];

export const EMPTY_WATCHLIST_MESSAGE = 'Watchlist is empty';
const STORAGE_KEY = 'marketdesk.watchlist.v1';

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
  private controlId = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000;
  private activeSymbols = new Set<string>(this.loadWatchlist());
  /** Symbols baked into the current socket's URL, to reconcile with changes made while it was connecting. */
  private urlSymbols = new Set<string>();

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
    this.watchBrowserState();
  }

  private loadWatchlist(): string[] {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
      if (Array.isArray(saved) && saved.every((x) => typeof x === 'string' && /^[A-Z0-9]{2,15}$/.test(x))) {
        return saved;
      }
    } catch {
      /* storage unavailable or corrupt: fall back to defaults */
    }
    return [...DEFAULT_SYMBOLS];
  }

  private saveWatchlist(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...this.activeSymbols]));
    } catch {
      /* ignore quota / private-mode errors */
    }
  }

  /** Recover quickly when the network returns or the tab is revisited, instead of waiting out the backoff. */
  private watchBrowserState(): void {
    if (typeof window === 'undefined') return;
    window.addEventListener('online', () => {
      if (this.connectionSubject.value.state !== 'live') this.retry();
    });
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && this.connectionSubject.value.state === 'offline') {
        this.retry();
      }
    });
  }

  /** Manual / automatic recovery: forget the backoff and try again now. */
  retry(): void {
    this.disconnect();
    this.reconnectAttempts = 0;
    this.connect();
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

    if (this.activeSymbols.size === 0) {
      this.connectionSubject.next({ state: 'offline', message: EMPTY_WATCHLIST_MESSAGE });
      return;
    }

    this.connectionSubject.next({ state: 'connecting', message: 'Connecting to Binance...' });

    this.urlSymbols = new Set(this.activeSymbols);
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
          // Reconcile symbols added/removed while the socket was still connecting.
          for (const sym of this.activeSymbols) if (!this.urlSymbols.has(sym)) this.sendControl('SUBSCRIBE', sym);
          for (const sym of this.urlSymbols) if (!this.activeSymbols.has(sym)) this.sendControl('UNSUBSCRIBE', sym);
          this.urlSymbols = new Set(this.activeSymbols);
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

  /** Adds a symbol to the live stream without reconnecting (Binance SUBSCRIBE control message). */
  subscribeToSymbol(symbol: string): void {
    if (this.activeSymbols.has(symbol)) return;
    this.activeSymbols.add(symbol);
    this.saveWatchlist();
    // First symbol after an empty watchlist: there is no socket yet, so open one.
    if (!this.ws$ && !this.reconnectTimer && this.activeSymbols.size === 1) {
      this.connect();
      return;
    }
    this.sendControl('SUBSCRIBE', symbol);
  }

  unsubscribeFromSymbol(symbol: string): void {
    if (!this.activeSymbols.delete(symbol)) return;
    this.saveWatchlist();
    this.sendControl('UNSUBSCRIBE', symbol);
    if (this.activeSymbols.size === 0) {
      this.disconnect();
      this.connectionSubject.next({ state: 'offline', message: EMPTY_WATCHLIST_MESSAGE });
    }
  }

  private sendControl(method: 'SUBSCRIBE' | 'UNSUBSCRIBE', symbol: string): void {
    // While not live, connect()'s open handler reconciles against activeSymbols.
    if (this.ws$ && this.connectionSubject.value.state === 'live') {
      this.ws$.next({ method, params: [`${symbol.toLowerCase()}@ticker`], id: ++this.controlId });
    }
  }
}

import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { merge, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { MarketSocketService, BinanceTick } from '../../core/market-socket.service';
import { Ticker } from '../../shared/models/ticker.model';
import * as MarketActions from './market.actions';

function toTicker(t: BinanceTick): Ticker {
  const price = parseFloat(t.c);
  const open = parseFloat(t.o);
  const change = price - open;
  return {
    symbol: t.s,
    price,
    change,
    changePercent: open ? (change / open) * 100 : 0,
    volume: parseFloat(t.v),
    bid: t.b,
    ask: t.a,
    timestamp: t.E,
  };
}

const MOCK_TICKERS: Ticker[] = [
  { symbol: 'AAPL', price: 150.25, change: 2.5, changePercent: 1.69, volume: 45000000, bid: 150.24, ask: 150.26, timestamp: Date.now() },
  { symbol: 'GOOGL', price: 140.80, change: 1.2, changePercent: 0.86, volume: 30000000, bid: 140.79, ask: 140.81, timestamp: Date.now() },
  { symbol: 'MSFT', price: 380.50, change: 5.0, changePercent: 1.33, volume: 25000000, bid: 380.49, ask: 380.51, timestamp: Date.now() },
  { symbol: 'AMZN', price: 175.30, change: -1.5, changePercent: -0.84, volume: 50000000, bid: 175.29, ask: 175.31, timestamp: Date.now() },
  { symbol: 'TSLA', price: 242.15, change: 8.5, changePercent: 3.63, volume: 120000000, bid: 242.14, ask: 242.16, timestamp: Date.now() },
  { symbol: 'META', price: 350.75, change: 3.2, changePercent: 0.92, volume: 18000000, bid: 350.74, ask: 350.76, timestamp: Date.now() },
  { symbol: 'NFLX', price: 280.40, change: -2.1, changePercent: -0.74, volume: 3500000, bid: 280.39, ask: 280.41, timestamp: Date.now() },
  { symbol: 'NVDA', price: 875.20, change: 15.0, changePercent: 1.74, volume: 28000000, bid: 875.19, ask: 875.21, timestamp: Date.now() },
  { symbol: 'IBM', price: 195.55, change: 1.8, changePercent: 0.93, volume: 2500000, bid: 195.54, ask: 195.56, timestamp: Date.now() },
  { symbol: 'INTC', price: 42.30, change: -0.5, changePercent: -1.17, volume: 50000000, bid: 42.29, ask: 42.31, timestamp: Date.now() },
  { symbol: 'AMD', price: 138.75, change: 4.2, changePercent: 3.12, volume: 42000000, bid: 138.74, ask: 138.76, timestamp: Date.now() },
  { symbol: 'QCOM', price: 165.40, change: 2.0, changePercent: 1.22, volume: 28000000, bid: 165.39, ask: 165.41, timestamp: Date.now() },
  { symbol: 'MU', price: 112.50, change: 3.5, changePercent: 3.21, volume: 35000000, bid: 112.49, ask: 112.51, timestamp: Date.now() },
  { symbol: 'AVGO', price: 128.30, change: 1.5, changePercent: 1.18, volume: 2200000, bid: 128.29, ask: 128.31, timestamp: Date.now() },
  { symbol: 'MCHP', price: 88.15, change: -0.8, changePercent: -0.90, volume: 3600000, bid: 88.14, ask: 88.16, timestamp: Date.now() },
  { symbol: 'MRVL', price: 68.40, change: 2.1, changePercent: 3.18, volume: 18000000, bid: 68.39, ask: 68.41, timestamp: Date.now() },
  { symbol: 'ADBE', price: 520.80, change: 6.3, changePercent: 1.22, volume: 2100000, bid: 520.79, ask: 520.81, timestamp: Date.now() },
  { symbol: 'CRM', price: 285.50, change: -3.2, changePercent: -1.11, volume: 2800000, bid: 285.49, ask: 285.51, timestamp: Date.now() },
  { symbol: 'NOW', price: 775.25, change: 8.5, changePercent: 1.11, volume: 900000, bid: 775.24, ask: 775.26, timestamp: Date.now() },
  { symbol: 'TEAM', price: 189.30, change: 4.2, changePercent: 2.27, volume: 1500000, bid: 189.29, ask: 189.31, timestamp: Date.now() },
];

@Injectable()
export class MarketEffects {
  private readonly actions$ = inject(Actions);
  private readonly socket = inject(MarketSocketService);

  readonly loadMockTickers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MarketActions.loadMockTickers),
      switchMap(() => of(MarketActions.tickersLoaded({ tickers: MOCK_TICKERS })))
    )
  );

  /** Opens the Binance stream and feeds status + batched ticks into the store. */
  readonly connectSocket$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MarketActions.connectSocket),
      tap(() => this.socket.connect()),
      switchMap(() =>
        merge(
          this.socket.connection$.pipe(
            map(({ state, message }) => MarketActions.connectionStatusChanged({ state, message }))
          ),
          this.socket.ticks$.pipe(
            map((ticks) => MarketActions.ticksReceived({ batch: ticks.map(toTicker) }))
          )
        )
      )
    )
  );

  readonly symbolAdded$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(MarketActions.symbolAdded),
        tap(({ symbol }) => this.socket.subscribeToSymbol(symbol))
      ),
    { dispatch: false }
  );

  readonly symbolRemoved$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(MarketActions.symbolRemoved),
        tap(({ symbol }) => this.socket.unsubscribeFromSymbol(symbol))
      ),
    { dispatch: false }
  );
}

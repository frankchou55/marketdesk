# Architecture

## Stack
- **Angular** (current major), standalone components, strict TypeScript, signals where they simplify view code.
- **NgRx Store + Effects + Entity** for market state. (Signal Store is an option for small local UI state; the main feed stays in classic Store so the Redux DevTools story is visible to reviewers.)
- **AG Grid Community** for the blotter. Note: row grouping, pivoting and integrated charts are Enterprise-only (paid). v1 stays Community; mention Enterprise familiarity only if true.
- **RxJS** `webSocket()` subject for sockets.
- **Web Worker** for parsing and batching.
- **Charts:** a lightweight canvas library (e.g. lightweight-charts or uPlot) for price/depth. Avoid heavy SVG chart libs for streaming data.
- Hosting: Cloudflare (static build).

## Data flow
```
Binance WS / Simulator
        │  raw JSON frames (very high rate)
        ▼
  Web Worker  ── parse, normalize, dedupe, drop stale, coalesce per symbol
        │  one batch every ~50–100 ms (configurable)
        ▼
  MarketSocketService (main thread)
        │  dispatch(ticksReceived({ batch }))
        ▼
  NgRx reducer (Entity adapter: upsertMany)
        │
        ├─ selectors ─► AG Grid via applyTransactionAsync (only changed rows)
        ├─ selectors ─► charts (canvas, requestAnimationFrame)
        └─ selectors ─► perf HUD (msgs/sec, batch size, latency, fps)
```

Key idea: the socket can fire thousands of times a second, but the UI updates at most ~10–20 times a second with coalesced data. That's the main optimization story.

## Socket layer
- `MarketSocketService` owns one connection; components never touch the socket.
- Subscribe/unsubscribe per symbol by sending stream subscribe messages; driven by NgRx actions (`symbolAdded`, `symbolRemoved`) through an Effect.
- Reconnect with exponential backoff + jitter; re-subscribes to active symbols automatically.
- Heartbeat/ping and a "stale" flag if no message for N seconds; the UI greys out stale rows.
- Connection state in the store: `connecting | live | reconnecting | offline`, shown in the header.

## State shape (sketch)
```ts
interface MarketState {
  tickers: EntityState<Ticker>;      // keyed by symbol
  watchlist: string[];
  connection: ConnectionStatus;
  feed: 'live' | 'simulated';
  sim: { rate: number; chaos: ChaosFlags };
  metrics: { msgsPerSec: number; batchSize: number; p50LatencyMs: number; p95LatencyMs: number };
}
```

## Folder layout (sketch)
```
src/app/
  core/        socket service, worker bridge, simulator
  state/       actions, reducer, effects, selectors (market + metrics)
  features/
    blotter/   AG Grid component
    depth/     order book
    chart/     price chart
    hud/       performance overlay
    ai/        AI panel (05-ai.md)
  shared/      models, formatters, pipes
```

## Testing
- Reducer and selector unit tests (pure functions, easy wins).
- Effects tests with marble testing for reconnect/backoff.
- One Playwright smoke test: app loads, data streams, grid has rows.

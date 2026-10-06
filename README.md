# Market Desk

[![CI](https://github.com/frankchou55/marketdesk/actions/workflows/ci.yml/badge.svg)](https://github.com/frankchou55/marketdesk/actions/workflows/ci.yml)

A live market blotter built with **Angular, NgRx and AG Grid**. It streams real-time crypto prices from Binance.US over a WebSocket and shows them in a sortable, filterable, paged grid with a watchlist you can edit on the fly.

<!-- TODO: add a screenshot or short GIF of the live blotter here, e.g. docs/images/blotter.png -->

## Features

- **Live prices** from the Binance.US public ticker stream. No API key and no backend are needed.
- **Data grid** (AG Grid Community): sorting, per-column filters, paging, resizable columns, pinned symbol column, green/red change coloring, and a brief flash when price, bid or ask ticks.
- **Editable watchlist**: add a symbol (`SOL` or `SOLUSDT`) or remove one with ✕. Changes use Binance's live `SUBSCRIBE`/`UNSUBSCRIBE` messages, so the connection stays open. The list is saved in the browser. A symbol that never produces data is dropped after 8 seconds with an explanation.
- **Connection resilience**: exponential backoff with a 10-attempt limit, immediate retry when the browser comes back online or the tab is revisited, a manual **Retry** button, and a clear stale-data state (dimmed grid and banner) while disconnected.
- **Tick batching in a Web Worker**: raw ticks are buffered for 100 ms and collapsed to the latest tick per symbol off the main thread, so the store receives one update per symbol per flush instead of one per message.

## Architecture

```
Binance.US WebSocket
        │  raw 24h-ticker messages
        ▼
MarketSocketService ── 100 ms buffer ──► Web Worker (latest tick per symbol)
        │                                        │
        │ connection status                      │ deduped ticks
        ▼                                        ▼
            NgRx Effects  (map to Ticker, derive change / change %)
                          │
                          ▼
            NgRx Store (Entity adapter, keyed by symbol)
                          │  selectors
                          ▼
            Blotter component ──► AG Grid
```

| Area | Where | Notes |
|---|---|---|
| Socket + reconnect | `frontend/src/app/core/market-socket.service.ts` | RxJS `webSocket`, backoff, live subscribe/unsubscribe, persisted watchlist |
| Tick dedupe | `core/tick-dedupe.ts`, `core/market.worker.ts` | Pure function, used by the worker and unit-tested separately |
| State | `frontend/src/app/state/market/` | Actions, reducer (Entity adapter), selectors, effects |
| UI | `frontend/src/app/features/blotter/`, `app.ts` | Standalone components, AG Grid theming API |

### Decisions worth knowing

- **NgRx Entity keyed by symbol** gives O(1) upserts for high-frequency updates, and AG Grid `getRowId` uses the same key so rows update in place instead of re-rendering.
- **Batching before the store**: every tick reaching the store re-runs selectors and change detection, so ticks are throttled and deduped first.
- **Binance.US, not binance.com**: binance.com blocks US IP addresses. The stream URL is one constant in the socket service if you need a different region.
- **AG Grid Community only.** All community modules are registered in `main.ts`, which is simple but makes the bundle about 1.4 MB; the build budget in `angular.json` is set accordingly. Registering only the modules in use would shrink it.

## Getting started

Requires Node 22+.

```bash
cd frontend
npm ci
npm start        # http://localhost:4200
```

Other scripts, all run from `frontend/`:

```bash
npm run lint
npm test -- --watch=false
npm run build
```

CI (`.github/workflows/ci.yml`) runs lint, tests and a production build on every push and pull request.

## Testing

Unit tests (Vitest via the Angular test builder) cover the reducer and watchlist rules, Binance-to-ticker mapping, the tick-dedupe logic, and watchlist persistence in the socket service. The live WebSocket connection and grid rendering are not covered by automated tests; they were checked manually against the live feed.

## Status

Front end only, running locally. Not deployed yet. Planned next: deployment to Cloudflare, and a Spring Boot and Kafka backend (see `docs/`).

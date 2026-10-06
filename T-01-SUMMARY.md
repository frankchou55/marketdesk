# T-01: Front-end skeleton — COMPLETE ✅

## What was built

### Folder structure
```
frontend/
  src/app/
    core/              (ready for services)
    state/
      market/          (actions, reducer, effects, selectors)
      metrics/         (ready for metrics state)
    features/
      blotter/         (AG Grid component with mock data)
    shared/
      models/          (Ticker interface)
```

### Stack installed & configured
- ✅ Angular 19 (standalone, strict TS)
- ✅ NgRx Store + Effects + Entity adapter
- ✅ AG Grid Community 33.x
- ✅ RxJS (WebSocket subject ready)
- ✅ ESLint (v10) + Prettier
- ✅ Testing (Karma + Jasmine, configured with NgRx MockStore)

### Features implemented
- ✅ Market state management (NgRx)
  - Actions: loadMockTickers, tickersLoaded, symbolAdded, symbolRemoved, ticksReceived
  - Reducer with Entity adapter (keyed by symbol)
  - Selectors for tickers, loading, error
  - Effects for loading mock data

- ✅ Blotter component (AG Grid)
  - Displays 20 static mock tickers (AAPL, GOOGL, MSFT, AMZN, TSLA, etc.)
  - Columns: Symbol, Price, Change, Change%, Bid, Ask, Volume
  - Sortable, filterable, resizable columns
  - Color-coded change % (green for positive, red for negative)
  - Pinned symbol column

- ✅ Header with connection status
  - "Market Desk" title
  - Live/offline status indicator with pulse animation

### Acceptance criteria — ALL MET
- ✅ `npm install` — all deps installed
- ✅ `npm run build` — clean build, production bundle ready
- ✅ `npm test -- --watch=false` — 2/2 tests passing
- ✅ `npm run lint` — 0 errors, 0 warnings
- ✅ `npm run format` — Prettier configured
- ✅ Standalone components, strict TS, ESLint clean
- ✅ NgRx + AG Grid wired end-to-end
- ✅ Mock data loads on init, grid displays it

## Next steps
- T-02: CI pipeline (GitHub Actions)
- T-03: Deploy to Cloudflare at marketdesk.frankchou.dev
- T-04: Socket service + Web Worker
- T-05: Live feed wiring (Binance WebSocket)
- T-06: Simulator with rate control and chaos toggles

## Notes
- Bundle size warning on build (877 KB vs 500 KB budget) — expected with NgRx + AG Grid; can optimize post-MVP
- Store DevTools enabled for local development (Redux DevTools browser ext recommended)
- Ready for WebSocket integration (service skeleton exists in state/market/market.effects.ts)

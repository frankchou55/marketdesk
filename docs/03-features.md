# Features (v1)

## Layout
Dark-or-light "trading desk" dashboard, one screen, no scrolling on a laptop. Header with connection status and feed toggle; grid takes the main area; chart and depth on the side; perf HUD docked bottom.

## 1. Live blotter (AG Grid)
- Rows: one per symbol (~20–50 pairs). Columns: symbol, last, change, change %, bid, ask, spread, volume, last update (ms ago).
- Cell flash green/red on change; numeric columns right-aligned, monospace.
- Sorting and filtering keep working while data streams.
- Updates via `applyTransactionAsync` so only changed rows re-render.
- Add/remove symbols from a picker → subscribes/unsubscribes on the socket.

## 2. Trade tape
- Last ~200 trades for the selected symbol, newest on top, virtualized. Shows how a high-churn list stays smooth.

## 3. Price chart
- Canvas chart for the selected symbol, ticks or 1s candles, drawn on `requestAnimationFrame`.

## 4. Order book depth
- Top 10–20 bid/ask levels with size bars. Driven by the depth stream.

## 5. Performance HUD (the "proof" panel)
- Messages/sec in, batches/sec dispatched, avg batch size.
- Feed latency (exchange event time → render), p50/p95.
- FPS meter and long-task counter.
- Toggle: "naive mode" (dispatch every message, default change detection) vs "optimized mode". Watching FPS drop in naive mode is the most convincing demo of optimization skill.

## 6. Stress test (simulator)
- Slider: 100 → 50,000 msgs/sec. Chaos switches: drop, duplicate, reorder, malformed.
- Shows the app staying responsive and the data staying correct.

## 6b. Hierarchy view (Frank's recursive builder)
- Positions/exposure tree: desk → book → instrument, built from a **flat** stream using Frank's recursive flat→hierarchy approach (configurable grouping keys).
- Live aggregates (P&L, notional) roll up as ticks arrive.
- Note: AG Grid's built-in Tree Data and Row Grouping are Enterprise features. In Community, render the tree with the custom builder (expand/collapse rows or a side tree). That makes it a stronger demo of Frank's own skill anyway.

## 7. AI panel
See 05-ai.md.

## Out of scope for v1
Auth, order entry, persistence, mobile layout beyond "readable", AG Grid Enterprise features.

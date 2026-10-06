# Performance Plan

## Budget
| Metric | Target |
|---|---|
| Initial JS (gzipped) | ≤ 300 KB |
| First meaningful paint | < 1.5 s laptop / broadband |
| UI update rate | 10–20 Hz (coalesced), independent of feed rate |
| Scroll / interaction | 60 fps at 5,000+ msgs/sec |
| Dataset size | 100k–250k rows loaded and streaming (JD: "hundreds of thousands of transactions") |
| Feed → render latency | p95 < 150 ms in optimized mode |
| Long tasks (>50 ms) | ~0 during steady streaming |

## Techniques (and what each proves)
1. **Coalescing and batching:** keep only the latest tick per symbol inside each window; one dispatch per window instead of thousands.
2. **Web Worker:** JSON parsing and normalization off the main thread.
3. **Change detection:** OnPush everywhere, zoneless if the Angular version supports it cleanly; signals for view bindings; nothing triggers app-wide checks per message.
4. **AG Grid:** `getRowId` for stable identity, `applyTransactionAsync`, `asyncTransactionWaitMillis` tuned, value formatters instead of re-creating row objects, row/column virtualization left on.
5. **Memoized selectors:** grid and charts only recompute when their slice changes.
6. **Canvas over DOM** for charts and depth bars; draw on `requestAnimationFrame`.
7. **Bundle:** lazy-load the AI panel and chart lib; only import the AG Grid modules used; check with source-map-explorer.
8. **Memory:** ring buffers for the trade tape and chart history so nothing grows forever.

## How we measure (so the résumé numbers are real)
- The HUD shows live metrics in the app itself.
- Chrome Performance profiles for naive vs optimized at the same feed rate; save screenshots in the repo README.
- Lighthouse for load metrics.
- Record actual numbers in the README, e.g. "naive: 22 fps, 340 ms p95; optimized: 60 fps, 45 ms p95 at 10k msgs/sec." **Only use numbers we actually measured.**

# Project Brief

## Goal
One link a Barclays reviewer can open that *proves* the résumé in under a minute: data visibly streaming, a grid updating thousands of cells a second without jank, and numbers on screen showing it's fast.

## Audience
- Hiring manager or front-end lead on a trading/markets tech team. Skims, clicks around for 60 seconds.
- An engineer in a technical round. Opens DevTools and reads the repo.

Design for both: the first needs instant "wow, it's live"; the second needs clean code, a README explaining decisions, and real measurements.

## Skill → proof map
| Skill to show | Where it's proven in the app |
|---|---|
| Angular + TypeScript | Standalone components, strict TS, typed models end to end |
| NgRx | Store + Effects + Entity for the market data, selectors feeding the grid; DevTools-friendly actions |
| AG Grid | Live blotter with high-frequency transaction updates, cell flash, sorting/filtering while streaming |
| WebSockets | Subscribe/unsubscribe per symbol, reconnect with backoff, heartbeat, stale-data indicator |
| Low latency | On-screen latency and throughput meters; batched updates; work off the main thread |
| Front-end optimization | OnPush/zoneless change detection, throttled rendering, web worker parsing, bundle budget |
| AI usage | AI feature in the app + documented AI-assisted workflow (see 05-ai.md) |

## Data source
- **Live:** Binance public WebSocket streams (trades, ticker, order book depth). Free, no key, millisecond-level, high volume. Coinbase as a fallback.
- **Simulated:** A built-in feed generator with a rate slider (e.g. 100 to 50,000 msgs/sec) and "chaos" toggles (drops, duplicates, out-of-order, malformed). This lets a reviewer stress the app on demand, and it keeps the demo working if the live feed is down.

Why crypto: it's the only free, truly real-time, high-volume market feed. The patterns (tick streams, order books, blotters) match equities/FX desks.

## Where it lives
- App: `desk.frankchou.dev` (Cloudflare Worker/Pages, same account as the main site).
- Code: public GitHub repo (also fixes the "not much on GitHub" gap).
- Main site: new entry under Projects, plus a line on the résumé.

## Success criteria
- First meaningful paint < 1.5 s on a laptop; JS bundle under ~300 KB gzipped (initial).
- Grid holds 60 fps scrolling while ingesting 5,000+ updates/sec.
- Recovers on its own from a dropped socket within a few seconds, with a visible status.
- A reviewer understands what they're looking at without reading anything.

## Open questions for Frank
- Do you have the Barclays job description? Paste it in so the features and résumé line up with their exact wording.
- Your current résumé (PDF or text) for 06-resume.md.
- Repo name and subdomain preference (`desk.frankchou.dev` is the placeholder).

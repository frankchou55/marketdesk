# Tasks

Each ticket is sized for one focused session. Do them in order unless noted. Each lists the docs to read; don't read the rest.

Legend: [ ] todo · [~] in progress · [x] done

## T-00 Inputs from Frank  [ ]
Collect the open inputs in HANDOFF.md. Write Frank's past Angular/NgRx description into `docs/06-resume.md` under "Frank's raw notes" verbatim. Update 08 gap table.
**Done when:** every open input is answered or explicitly deferred.

## T-01 Front-end skeleton  [ ]
Read: 02.
- `frontend/`: latest Angular, standalone, strict TS, ESLint + Prettier, NgRx store/effects/entity/devtools, AG Grid Community.
- One page with an AG Grid showing 20 static mock tickers.
**Done when:** `npm start` works, `npm test` passes, lint clean.

## T-02 CI pipeline  [ ]
Read: 08 (CI rows).
- GitHub Actions: install → lint → unit test → build → bundle-size check → npm audit (fail on high).
**Done when:** pipeline green on a PR.

## T-03 Deploy front end  [ ]
- Cloudflare static deploy at the agreed subdomain, CSP + security headers.
- **Ask Frank before deploying.**
**Done when:** URL loads the T-01 page.

## T-04 Socket service + worker  [ ]
Read: 02 (Socket layer, Data flow), 04.
- Web Worker parses/normalizes Binance frames, coalesces per symbol, posts batches every 50–100 ms.
- `MarketSocketService`: connect, subscribe/unsubscribe per symbol, reconnect with backoff + jitter, heartbeat, stale detection, connection status.
**Done when:** unit tests cover reconnect/backoff (marble tests); live ticks visible in console.

## T-05 NgRx wiring → grid  [ ]
Read: 02 (State shape), 03 (#1).
- Actions/reducer/effects/selectors; Entity `upsertMany`; grid via `getRowId` + `applyTransactionAsync`; flash cells; symbol picker.
**Done when:** grid streams live, sort/filter work mid-stream, reducer/selector tests pass.

## T-06 Simulator (crypto + equities/options)  [ ]
Read: 01 (Data source), 03 (#6), 08 (domain row).
- Rate slider 100 → 50k msgs/sec; chaos toggles; **equities mode** (tickers, bid/ask, volume) and **options chain** (strikes, expiries, simple Black-Scholes Greeks).
- **Row-count control up to 250k rows.**
**Done when:** 250k rows load and stream without the tab freezing.

## T-06b Hierarchy view  [ ]
Read: 03 (#6b), 06 (raw notes, last bullet).
- Generic recursive flat→tree builder (configurable keys), unit-tested; live roll-ups.
**Done when:** desk → book → instrument tree updates live at 100k rows without jank.

## T-07 Performance HUD + naive/optimized toggle  [ ]
Read: 03 (#5), 04.
**Done when:** HUD shows msgs/sec, batch size, p50/p95 latency, fps, long tasks; toggle visibly changes them.

## T-08 Chart, depth, trade tape  [ ]
Read: 03 (#2–#4), 04 (#6, #8).
**Done when:** all three render on canvas/virtualized lists with ring buffers; no memory growth over 10 min.

## T-09 AI feature  [ ]
Read: 05. Needs Frank's choice + API key handled by Frank.
- Cloudflare Worker proxy (rate-limited); schema-validated output; lazy-loaded panel.
**Done when:** NL query → validated AG Grid filter; invalid output handled.

## T-10 Tests + e2e  [ ]
- Raise unit coverage on state + core; Playwright smoke (loads, streams, filter works).
**Done when:** CI runs e2e and is green.

## T-20 Backend skeleton  [ ]
Read: 09.
- `backend/`: Java 21, Spring Boot 3.x, ingest-service + gateway-service, docker-compose with Kafka.
**Done when:** `docker compose up` streams ticks through Kafka to a WebSocket client.

## T-21 Gateway features  [ ]
- Per-client subscriptions, server-side conflation, REST endpoints, OpenAPI, JUnit + Testcontainers.
- Front-end feed selector `Direct | Gateway`.
**Done when:** Angular app runs fully on the gateway feed; backend tests in CI.

## T-30 Measure + document  [ ]
Read: 04 (How we measure).
- Profile naive vs optimized at fixed rates and row counts; record numbers (with date + machine) in README; screenshots/GIF; ADRs for major decisions; `AI-WORKFLOW.md`.
**Done when:** README has real numbers and a 30-second demo GIF.

## T-31 Résumé  [ ]
Read: 06, 08. Inputs from T-00 required.
- Rewrite résumé using JD wording where true; fill Market Desk bullets with T-30 numbers; keep to 1–2 pages; export PDF to `~/Workspace/sitey/resume.pdf`.
- **No invented content. Mark anything unverified `[Frank to confirm]` and ask.**
**Done when:** Frank approves the PDF.

## T-32 Link it up  [ ]
- Add "market desk" under Projects on frankchou.dev (`~/Workspace/sitey/index.html`, same `<li>` pattern, opens in new tab). Pin repo on GitHub (Frank does this).

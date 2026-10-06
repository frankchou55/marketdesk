> Superseded for execution by `10-tasks.md` (adds backend, CI, 100k+ rows, equities/options). Kept for the phase overview.

# Build Plan

## Phase 0: Inputs (now)
- [ ] Barclays JD pasted into 06-resume.md
- [ ] Current résumé provided
- [ ] Pick AI feature (05-ai.md)
- [ ] Confirm name + subdomain (`market-desk`, `desk.frankchou.dev`)

## Phase 1: Skeleton (day 1)
- Angular app, strict TS, ESLint, Prettier; NgRx installed; AG Grid Community.
- Static mock data in the grid. Deploy to Cloudflare at the subdomain right away.

## Phase 2: Live data (days 2–3)
- Worker + socket service + Binance streams; reconnect/backoff; connection status in header.
- Ticks → batch → NgRx → grid with `applyTransactionAsync`.

## Phase 3: Simulator + HUD (days 4–5)
- Simulator with rate slider and chaos toggles.
- HUD metrics; naive vs optimized toggle.

## Phase 4: Chart, depth, tape (days 6–7)
- Canvas chart, order book, virtualized trade tape.

## Phase 5: AI feature (day 8)
- Worker proxy, schema validation, lazy-loaded panel.

## Phase 6: Measure + polish (days 9–10)
- Profile, record real numbers, README with screenshots/GIF, AI-WORKFLOW.md.
- Unit + effects tests, one Playwright smoke test.

## Phase 7: Ship
- Link from frankchou.dev Projects ("market desk").
- Fill in the résumé project bullets with measured numbers; regenerate PDF.
- Pin the repo on GitHub.

Days are rough effort estimates, not a schedule.

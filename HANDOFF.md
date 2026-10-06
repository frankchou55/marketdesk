# HANDOFF: Read This First

You are continuing work on **Market Desk** for Frank Chou. This file is the entry point for a new session or a smaller model. Read it fully, then read only the docs your ticket points to.

## Context in 5 lines
1. Frank is applying for **Senior Front End Full Stack Developer (VP)** at Barclays (Whippany, NJ). JD mapping: `docs/08-jd-alignment.md`.
2. Market Desk is a portfolio app proving: Angular/TS, NgRx, AG Grid, WebSockets, UI performance at 100k+ rows, Java/Spring + Kafka backend, CI/CD + tests, AI-assisted development.
3. Front end deploys to Cloudflare at `desk.frankchou.dev` (placeholder). Main site `frankchou.dev` lives in `~/Workspace/sitey` (plain HTML/CSS; do not convert it to a framework).
4. Backend is Spring Boot + Kafka, runs locally via docker compose; public hosting undecided (`docs/09-backend.md`).
5. Work is broken into tickets in `docs/10-tasks.md`. Do **one ticket per session** unless told otherwise.

## Hard rules
- **Never invent résumé content.** No made-up jobs, employers, dates, metrics, or tools Frank hasn't used. Use placeholders like `[Frank to confirm]`.
- **Numbers must be measured.** Performance claims in README/résumé come from the in-app HUD or Chrome profiles, recorded with the date and machine.
- **No secrets in the repo.** API keys only in Cloudflare/host env vars.
- **AG Grid Community only** unless Frank says he has an Enterprise license.
- Keep `docs/` in sync: if you change a decision, update the doc that owns it and add a line to the Decision Log below.
- Ask Frank before: spending money, creating accounts, deploying, pushing to GitHub, or changing scope.

## Where things are
```
~/Workspace/market-desk/
  HANDOFF.md        ← you are here
  docs/00-README.md ← index of all planning docs
  docs/10-tasks.md  ← ticket list with acceptance criteria
  frontend/         (created in T-01)
  backend/          (created in T-20)
```

## Status (update at the end of every session)
- Phase: **Planning complete, awaiting inputs**
- Last session: 2026-10-05, planning docs + JD alignment + handoff written.
- Next ticket: **T-00 (Inputs from Frank)**, then T-01.

## Open inputs from Frank
- [ ] Current résumé (PDF/text)
- [x] Brief description of past Angular/NgRx work (in docs/06-resume.md, raw notes + draft bullets)
- [ ] Answers to the 6 questions at the bottom of docs/06-resume.md
- [ ] Java/Spring, Kafka/Solace, trading-domain, leadership experience (see gaps in 08)
- [ ] AI feature choice (05-ai.md)
- [ ] Backend hosting decision (09-backend.md)
- [ ] Subdomain/repo name confirmation

## Decision Log
| Date | Decision |
|---|---|
| 2026-10-05 | Live feed = Binance public WS; plus simulator with equities/options mode for capital-markets relevance |
| 2026-10-05 | NgRx classic Store/Effects/Entity for feed state; AG Grid Community |
| 2026-10-05 | Added Spring Boot + Kafka backend to cover Java/Spring + event-driven JD requirements |
| 2026-10-05 | Added hierarchy view built on Frank's recursive flat→tree approach (03 #6b) |
| 2026-10-05 | Stress target raised to 100k–250k rows to match "hundreds of thousands of transactions" |

## End-of-session checklist
1. Ticket acceptance criteria met (or note what isn't).
2. Tests pass; lint clean.
3. Update **Status**, tick boxes in `docs/10-tasks.md`, add Decision Log lines.
4. Tell Frank what changed and the exact git commands to commit/push (he pushes himself).

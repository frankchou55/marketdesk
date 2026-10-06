# Job Description Alignment: Barclays, Senior Front End Full Stack Developer (VP), Whippany NJ

Source: JD pasted by Frank on 2026-10-05. This file maps every requirement to (a) proof in Market Desk and (b) what the résumé must say. Use the JD's wording in the résumé where it is true.

## Core requirements
| JD requirement | Proof in Market Desk | Résumé angle | Gap risk |
|---|---|---|---|
| Expertise in Angular, TypeScript, modern web; responsive front-office apps | Whole front end: standalone Angular, strict TS, trader-style dashboard | Lead with Angular/TS in summary + experience | Low. Confirmed: Angular + NgRx + REST against Spring middleware; Kendo UI; AG Grid on later team |
| Full-stack with **Java + Spring**, low-latency, high-volume | **NEW:** Spring Boot gateway service (09-backend.md) that ingests feeds and fans out over WebSocket | Only claim Java/Spring depth Frank actually has; the project gives a real, current example | **Medium.** Confirmed: Spring Boot services + CRUD app with a small team (2024); confirm years/depth |
| UI performance engineering: state mgmt, streaming, rendering optimization, **hundreds of thousands of transactions** | NgRx + worker batching + AG Grid async transactions; **stress mode with 100k–250k rows** and high update rates; naive vs optimized toggle | Measured numbers only | Medium: must actually hit the target and measure it |
| Real-time messaging / event-driven: **WebSocket, Kafka, Solace** | WebSocket end to end; **Kafka** topic between ingest and gateway in the backend (local docker-compose) | Name Kafka only if built/used; Solace = "familiar with" at most unless Frank has used it | Medium |
| RESTful APIs: performance, security, interoperability | Spring REST endpoints: symbols, snapshots, health; OpenAPI spec | | Low once built |
| Engineering excellence: test automation, CI/CD | Jest/Jasmine unit tests, NgRx marble tests, Playwright e2e, JUnit for backend; GitHub Actions pipeline with lint → test → build → deploy | Mention pipeline + coverage | Low once built |

## Highly valued
| JD item | Proof | Notes |
|---|---|---|
| AI-assisted dev (Copilot, ChatGPT, Claude, Cursor) | `AI-WORKFLOW.md` in repo + AI feature in app (05-ai.md) | JD names Claude explicitly; describe real usage, incl. this planning session |
| AG Grid advanced customization, large datasets, live market data | Custom cell renderers, flash cells, value formatters, 100k+ row stress test, column state persistence | Community edition; don't claim Enterprise unless true |
| Electronic trading / capital markets: **equities, derivatives** | Simulator gains **equities + options** mode (bid/ask, last, volume, options chain with strikes/expiries, simple Greeks) next to the live crypto feed | Domain knowledge Frank should be able to talk about in interview |
| Partner with Traders/Sales/Client Service/RTB | Not provable by a demo. Résumé: real stakeholder examples from Frank's jobs | Frank to supply |

## VP-level expectations (résumé + interview, not the demo)
Technical direction, mentoring, code reviews, risk/controls, stakeholder influence, multi-year efforts. The repo can show *some* of this: ADRs (architecture decision records), a CONTRIBUTING.md, clean PR history. The rest must come from Frank's real experience.

## Secure coding (explicit accountability)
API keys server-side only, input validation on AI output, CSP headers, dependency scanning in CI (npm audit / OWASP dependency-check), no secrets in repo.

## Biggest gaps to resolve with Frank
1. Java/Spring depth/years (exists, see 06 raw notes).
2. Kafka / Solace exposure.
3. Trading/capital-markets domain exposure.
4. Leadership scope (people managed, mentoring, ownership) for the VP level.

## Strengths surfaced by Frank's notes (2026-10-05)
- Real full-stack Angular + Spring Boot + Oracle delivery, with NgRx.
- Audience-aware dashboard design (engineer drill-down vs CTO summary) maps to "partner with stakeholders / intuitive UX".
- Recursive flat→hierarchy utility maps to "advanced customization" and complex data visualization.
- Self-identified polling→streaming lesson is a natural bridge to Market Desk and the JD's event-driven requirement.

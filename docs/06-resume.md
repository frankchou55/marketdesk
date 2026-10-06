# Résumé Update

## Rules
- Every bullet must be something Frank actually did. The project below is new, real work, so it's fair game once built; everything else comes from Frank's real history.
- Use Barclays' own wording from the job description where it's true (paste the JD here).
- Numbers only if measured (see 04-performance.md).

## Structure
1. Header: name, frankchou.dev, GitHub, LinkedIn, email.
2. Summary (2 lines): front-end/software developer focused on Angular, TypeScript and real-time data UIs.
3. Skills: Angular, TypeScript, RxJS, NgRx, AG Grid, WebSockets, performance profiling, testing, AI-assisted development, plus whatever else is true (Supabase, SQL, etc.).
4. Experience: Frank's real roles. Re-word existing bullets toward the skills above where honest.
5. **Projects:** Market Desk (this app), Pocaroo, Loraoke.
6. Education.

## Project entry template (fill in after it's built)
**Market Desk**: real-time market dashboard · desk.frankchou.dev · GitHub
- Built an Angular/TypeScript dashboard streaming live market data over WebSockets, with NgRx Store/Effects/Entity managing [N] symbols.
- Kept AG Grid at [X] fps while ingesting [Y] updates/sec by batching in a Web Worker, coalescing ticks and using async row transactions.
- Implemented reconnect with backoff, per-symbol subscribe/unsubscribe and stale-data detection.
- Cut feed-to-render p95 latency from [A] ms to [B] ms (measured with in-app instrumentation and Chrome profiles).
- Added an AI natural-language filter that converts plain English into validated AG Grid filter models via a rate-limited proxy.

## What Frank needs to provide
- Current résumé (PDF/text).
- The Barclays job description.
- Any past work with Angular, NgRx, AG Grid, sockets or streaming data, even partial or at a previous job.

---

## Frank's raw notes (verbatim, 2026-10-05)

> * 2024 built an API health checker dashboard using Spring and Angular. I pointed schedulers to query APIs periodically and logged the statuses into an oracle database so I could have historical data. I know now that I can do this way less expensively by subscribing through sockets/kafka services but at the time none of these APIs had those deployed.
> * The Java Spring Boot projects were developed and maintained by me and a small team, where I built a CRUD application that allowed end users to maintain and modify API endpoints if they needed.
> * The Angular application was a separate repo that hit the Java middleware through REST APIs, and I used NgRx to satisfy a lot of state management.
> * I also incorporated caching in sessionStorage to save static domain data (for dropdowns and whatnot).
> * At this point of time I used Progress Kendo UI for Angular for most of my UI development work, but I designed and built the dashboard to be "card" heavy and user friendly so that specific users can drill down more granularly versus a CTO, who would want to see the eagle point of view.
> * I moved teams and did more work on AG Grid, which has similar capability but not identical ability.
> * One thing I am particularly proud of is serving flat data through an API, and then building a custom method that recurses that data to create dynamic hierarchical data based on a few variables. This allowed me to reuse data and abstract that functionality for multiple purposes, especially for front end work (helped with hierarchical diagrams, trees, maps, etc)

## Draft experience bullets (from the notes above, DRAFT, Frank to approve)
Only facts Frank stated. `[ ]` = details Frank must supply.

**[Title], [Employer], [Team/Org], [Dates]**
- Designed and built a full-stack API health-monitoring dashboard (Angular + Java Spring Boot) that polled [N] APIs on scheduled jobs and persisted status history to Oracle for trend reporting.
- Built the Angular front end as a separate app consuming Spring Boot REST middleware, using NgRx for application state management.
- Designed tiered, card-based views so engineers could drill into individual endpoints while executives (incl. the CTO) saw an at-a-glance summary.
- Developed and maintained Spring Boot services with a small team, including a CRUD application letting end users manage and modify API endpoint configurations.
- Cached static reference data in sessionStorage to cut redundant API calls for dropdowns and lookups.
- Built a reusable recursive utility that turns flat API data into dynamic hierarchical structures from configurable keys, powering trees, hierarchy diagrams and maps across multiple features.

**[Title], [Employer], [Team], [Dates]** (after team move)
- Built data-heavy views with AG Grid [features: custom renderers? large datasets? filtering? Frank to confirm].

## Interview talking point (true and strong)
"I built polling-based monitoring because the APIs had no streaming endpoints. Today I'd subscribe over WebSockets/Kafka instead: lower cost, lower latency, no wasted polls." Market Desk is that redesign, built for real.

## Questions for Frank
1. Employer(s), titles and dates for both teams.
2. Roughly how many APIs/endpoints did the dashboard monitor? How many users? How often did it poll?
3. Team size on the Spring Boot work; did you lead, review code, or mentor anyone? (VP-level signal.)
4. What exactly did you do with AG Grid on the new team (dataset size, custom cell renderers, real-time updates, performance work)?
5. Anything measurable: fewer incidents, faster triage, time saved, adoption?
6. Kendo UI: keep on résumé as "Kendo UI for Angular" (it's a real enterprise UI skill) unless you'd rather not.

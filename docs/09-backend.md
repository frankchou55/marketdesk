# Backend: Spring Boot Gateway

Added because the JD requires Java/Spring full stack + Kafka/event-driven experience.

## Shape
```
Binance WS ─┐
Simulator ──┴─► ingest-service (Spring Boot) ─► Kafka topic `ticks` ─► gateway-service (Spring Boot)
                                                                         ├─ WebSocket /stream (fan-out, per-symbol subscriptions)
                                                                         └─ REST /api/symbols, /api/snapshot/{symbol}, /actuator/health
Angular app ◄──────────────────────────────────────────────────────────┘
```
- Java 21, Spring Boot 3.x, Spring WebFlux or plain Spring WebSocket (pick one; WebFlux shows reactive skills).
- Kafka via docker-compose for local; optional in deployed mode.
- Server-side conflation per client (latest tick per symbol per window) to protect slow clients: a strong talking point for trading UIs.
- Backpressure: drop/conflate strategy documented.
- OpenAPI spec generated (springdoc).
- Tests: JUnit 5 + Testcontainers for Kafka.

## Hosting reality
Cloudflare can't run Java. Options:
- **Public demo runs front-end-only** (browser simulator + direct Binance socket), always available, free.
- **Backend** runs via `docker compose up` locally (documented in README), and optionally deployed to a container host (Fly.io / Render / Railway; check current free tiers before choosing).
- Front end has a feed selector: `Direct (browser)` | `Gateway (Spring)`.

## Decision for Frank
Deploy the backend publicly (small monthly cost possible) or local-only with a recorded demo GIF?

# Request Lifecycle

This traces a Mock EDR event from HTTP POST to the dashboard.

## 1. HTTP POST

A source posts JSON to `POST /api/v1/ingest/MOCK_EDR` with `X-Ingest-Key`.

Relevant file: `apps/api/src/ingestion/ingestion.controller.ts`.

## 2. Ingestion key guard

`apps/api/src/ingestion/ingest-key.guard.ts` reads the header and compares it with `INGEST_API_KEY` using `timingSafeEqual` when lengths match.

## 3. Source allowlist and adapter lookup

`AdapterRegistry` maps `MOCK_EDR` to `MockEdrAdapter`. Unsupported source types are rejected.

Relevant file: `apps/api/src/ingestion/adapters/adapter-registry.ts`.

## 4. Validation

`MockEdrPayloadDto` validates the fictional payload. Extra fields are rejected by the global validation settings.

Relevant file: `apps/api/src/ingestion/dto/mock-edr.dto.ts`.

## 5. Normalization

`MockEdrAdapter.normalize` maps fields into `NormalizedEventInput`: detection ID, title, severity, category, hostname, timestamp, raw payload, and fingerprint.

Relevant file: `apps/api/src/ingestion/adapters/mock-edr.adapter.ts`.

## 6. Deduplicate and persist

`IngestionService.ingest` opens a transaction. It locks an existing row if present, or inserts a new row. If concurrent first inserts race, PostgreSQL's unique constraint turns one into a duplicate merge.

Relevant file: `apps/api/src/ingestion/ingestion.service.ts`.

## 7. Source statistics and history

The service updates `EventSource.lastEventAt`, increments `totalEvents`, and writes `INGESTED` or `DEDUPLICATED` history.

## 8. Analyst API

The dashboard calls `/api/v1/dashboard/*` for aggregates and `/api/v1/events` for recent event rows.

Relevant files: `apps/api/src/dashboard/dashboard.service.ts` and `apps/api/src/events/events.service.ts`.

## 9. Next.js dashboard

The web app uses TanStack Query to request the API and renders cards, charts, and tables.

Relevant file: `apps/web/app/dashboard/page.tsx`.

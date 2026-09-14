# Request Lifecycle

1. A Mock EDR payload is posted to `apps/api/src/ingestion/ingestion.controller.ts`.
2. `IngestKeyGuard` checks `X-Ingest-Key`.
3. `AdapterRegistry` returns `MockEdrAdapter`.
4. `MockEdrAdapter.validate` validates shape and fields.
5. `MockEdrAdapter.normalize` creates `NormalizedEventInput`.
6. `IngestionService.ingest` stores or deduplicates the event in a transaction.
7. Event source counters and history are updated.
8. The dashboard reads aggregates through `apps/api/src/dashboard/dashboard.service.ts`.

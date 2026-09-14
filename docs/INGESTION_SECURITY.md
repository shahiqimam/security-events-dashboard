# Ingestion Security

The ingestion API is the trust boundary between external fictional sources and the internal event model.

## Endpoint

`POST /api/v1/ingest/:sourceType`

Required header:

```http
X-Ingest-Key: <secret>
```

The expected value comes from `INGEST_API_KEY`. It must be supplied by the API runtime environment and must not be exposed through the frontend.

## Request lifecycle controls

1. Helmet and JSON body-size limit run at application startup.
2. `IngestKeyGuard` rejects missing or invalid keys with `401`.
3. `AdapterRegistry` allowlists source types.
4. Source DTO validation rejects malformed or extra fields.
5. Adapter normalization maps only known fields into the internal model.
6. `IngestionService` writes or deduplicates in a transaction.
7. Event source counters and history are updated.

## Secret handling

The API never logs, stores, or returns the ingestion key. `.env.example` documents variable names, while `.env` is ignored.

## Replay and duplicates

Webhook retries or repeated sends are handled by idempotent deduplication. A duplicate event does not create a second row; it increments `occurrenceCount` and records history.

## Stronger production alternatives

A production integration could use per-source credentials, signed webhooks, mTLS, OAuth client credentials, private networking, replay windows, nonce tracking, and source-specific rate limits. Those are documented future improvements, not implemented in v1.

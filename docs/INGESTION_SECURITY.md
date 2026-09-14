# Ingestion Security

`POST /api/v1/ingest/:sourceType` requires `X-Ingest-Key`. The expected value comes from `INGEST_API_KEY`.

The API rejects missing or invalid keys with `401`, allowlists source types through the adapter registry, limits JSON request size, and validates payloads before normalization. The key is never returned and is not available to the frontend.

Production alternatives include per-source keys, signed webhooks, mTLS, OAuth, private networking, and replay windows.

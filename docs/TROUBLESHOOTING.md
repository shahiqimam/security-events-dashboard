# Troubleshooting

- Ingestion 401: Check `INGEST_API_KEY` and the `X-Ingest-Key` header.
- Invalid payload: Compare the source payload with the DTO fields in `apps/api/src/ingestion/dto`.
- Duplicates not merging: Confirm `sourceType` and source event ID are identical.
- Empty dashboard: Run the demo generator after logging in.
- DB unavailable: Confirm PostgreSQL is healthy and environment variables match.
- API unreachable from web: Check `NEXT_PUBLIC_API_URL` and CORS origin.
- API cannot reach Postgres: In Docker, use `DATABASE_HOST=postgres`.
- Source stale: Increase `SOURCE_STALE_MINUTES` or ingest fresh demo events.
- Filter mismatch: Use enum values such as `HIGH` and `OPEN`.
- Raw JSON display issue: Raw payload is rendered as escaped text with `JSON.stringify`.

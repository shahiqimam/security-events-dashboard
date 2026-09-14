# Event Normalization

SentinelView normalizes three fictional source payloads into one internal `SecurityEvent` model. The public ingestion endpoint accepts unknown JSON, but the application never persists it until the source adapter validates it.

## Adapter contract

`apps/api/src/ingestion/adapters/security-event-adapter.ts` defines:

```typescript
interface SecurityEventAdapter<TPayload> {
  readonly sourceType: SourceType;
  validate(payload: unknown): TPayload;
  normalize(payload: TPayload): NormalizedEventInput;
}
```

Controllers only perform routing, guard checks, adapter lookup, and service calls. Validation and field mapping stay in adapter classes.

## DTO validation

- `MockSiemPayloadDto` validates `event_id`, `rule_level`, `rule_name`, `agent_name`, `src_ip`, and `occurred_at`.
- `MockEdrPayloadDto` validates `detectionId`, textual severity, nested device shape, detection type, and timestamp.
- `MockIamPayloadDto` validates `id`, `risk`, actor email, activity, IP address, and created timestamp.

The global validation pipe also uses `whitelist`, `forbidNonWhitelisted`, and `transform`.

## Severity mapping

Mock SIEM maps `rule_level` as:

- `0-3` -> `INFO`
- `4-6` -> `LOW`
- `7-9` -> `MEDIUM`
- `10-12` -> `HIGH`
- `13-15` -> `CRITICAL`

Mock EDR maps `info`, `low`, `medium`, `high`, and `critical` directly to internal uppercase enum values.

Mock IAM maps `risk` as:

- `0-19` -> `INFO`
- `20-39` -> `LOW`
- `40-59` -> `MEDIUM`
- `60-79` -> `HIGH`
- `80-100` -> `CRITICAL`

## Category mapping

Category mapping is deterministic keyword matching in `adapter-utils.ts`. Authentication terms map to `AUTHENTICATION`, malware terms to `MALWARE`, privilege terms to `PRIVILEGE`, network terms to `NETWORK`, data terms to `DATA_ACCESS`, and endpoint execution terms to `ENDPOINT`. Unknown values fall back to `OTHER`, except IAM defaults to `AUTHENTICATION`.

## Worked examples

Mock SIEM input:

```json
{
  "event_id": "siem-1001",
  "rule_level": 12,
  "rule_name": "Repeated login failures",
  "agent_name": "WS-014",
  "src_ip": "198.51.100.25",
  "occurred_at": "2026-09-12T10:00:00Z"
}
```

Normalized result includes `sourceType=MOCK_SIEM`, `sourceEventId=siem-1001`, `severity=HIGH`, `category=AUTHENTICATION`, `assetName=WS-014`, `sourceIp=198.51.100.25`, and `detectedAt=2026-09-12T10:00:00Z`.

Mock EDR input with `detectionType=Suspicious PowerShell` normalizes to `category=ENDPOINT` and uses the device hostname as `assetName`.

Mock IAM input with `risk=90` and `activity=Multiple MFA failures` normalizes to `severity=CRITICAL`, `category=AUTHENTICATION`, `username=actor`, and `sourceIp=ipAddress`.

## Deduplication

The normalized event carries a fingerprint, but the idempotency key is the database unique pair `sourceType + sourceEventId`. On duplicate ingestion, the original row is updated with a new `lastSeenAt`, incremented `occurrenceCount`, latest raw payload, and a `DEDUPLICATED` history item.

# Event Normalization

The adapter contract is `SecurityEventAdapter<TPayload>`. Each adapter validates an unknown external payload and returns a `NormalizedEventInput`.

`MockSiemAdapter` maps `rule_level` to severity and derives category from deterministic keywords. `MockEdrAdapter` maps textual severity directly and categorizes endpoint terms such as PowerShell or process. `MockIamAdapter` maps risk score ranges to severity and defaults to `AUTHENTICATION` unless the activity text maps more specifically.

Deduplication uses `sourceType + sourceEventId`. Existing rows are merged by incrementing `occurrenceCount` and updating `lastSeenAt`.

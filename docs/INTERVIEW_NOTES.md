# Interview Notes

## SIEM
Simple answer: A system that centralizes security events.
Technical answer: SIEMs collect, normalize, search, and correlate logs.
How this project uses it: `MOCK_SIEM` is a fictional source only.
Likely interview question: How do you normalize vendor-specific logs?

## EDR
Simple answer: Endpoint detection and response telemetry.
Technical answer: EDR focuses on device activity such as processes, malware, and suspicious execution.
How this project uses it: `MOCK_EDR` normalizes endpoint detections.
Likely interview question: What fields matter when reviewing endpoint alerts?

## IAM
Simple answer: Identity and access activity.
Technical answer: IAM events often involve users, risk, MFA, and privilege changes.
How this project uses it: `MOCK_IAM` maps risk scores and actors.
Likely interview question: Why are identity events important in incident review?

## Normalization
Simple answer: Convert different payloads into one internal format.
Technical answer: Adapters validate source payloads and map fields to `SecurityEvent`.
How this project uses it: All sources become one queryable schema.
Likely interview question: What belongs in an adapter versus a controller?

## Idempotency and Deduplication
Simple answer: Repeating the same event should not create duplicate rows.
Technical answer: A unique key and transaction merge duplicates safely.
How this project uses it: `sourceType + sourceEventId` is unique.
Likely interview question: How do you handle webhook retries?

## Authentication and Authorization
Simple answer: Authentication identifies a user; authorization decides what they can do.
Technical answer: JWT protects analyst APIs, and RBAC limits mutations.
How this project uses it: VIEWER is read-only; ANALYST and ADMIN mutate workflow.
Likely interview question: Where should authorization be enforced?

## Docker
Simple answer: Compose runs the web, API, and database together.
Technical answer: Containers share a network, so the API reaches PostgreSQL at `postgres:5432`.
How this project uses it: `docker-compose.yml` defines `web`, `api`, and `postgres`.
Likely interview question: Why does `localhost` differ inside a container?

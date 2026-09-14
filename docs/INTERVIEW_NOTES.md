# Interview Notes

## SIEM
Simple answer: A SIEM centralizes security event data.
Technical answer: SIEM platforms collect, normalize, search, and correlate logs and alerts across systems.
How this project uses it: `MOCK_SIEM` is a fictional rule-based source.
Likely interview question: How would you map vendor-specific fields into a common schema?

## EDR
Simple answer: EDR monitors endpoint activity.
Technical answer: EDR data often includes processes, devices, malware signals, and endpoint detections.
How this project uses it: `MOCK_EDR` maps device detections into normalized events.
Likely interview question: What endpoint fields are useful during triage?

## IAM
Simple answer: IAM tracks identity and access activity.
Technical answer: IAM events often involve users, MFA, risk scores, privilege changes, and access policy.
How this project uses it: `MOCK_IAM` maps actor, risk, activity, and IP address.
Likely interview question: Why are identity events often high-value security signals?

## Event vs alert
Simple answer: An event is observed activity; an alert is activity selected for review.
Technical answer: Alerting adds interpretation, severity, or workflow to raw events.
How this project uses it: The app calls records security events and gives them analyst lifecycle state.
Likely interview question: Why avoid treating every event as an incident?

## Normalization
Simple answer: Convert different payloads into one format.
Technical answer: Normalization lets the API, database, filters, and UI operate over consistent fields.
How this project uses it: Adapters output `NormalizedEventInput`.
Likely interview question: What fields should be common across event sources?

## Adapter pattern
Simple answer: Put source-specific logic behind a shared interface.
Technical answer: Each adapter validates and normalizes one source while callers depend on the common contract.
How this project uses it: `MockSiemAdapter`, `MockEdrAdapter`, and `MockIamAdapter` implement the same interface.
Likely interview question: How do you add a fourth source?

## Idempotency
Simple answer: Repeating a request should not create an unintended second record.
Technical answer: Stable source identifiers let retries resolve to the same internal event.
How this project uses it: `sourceType + sourceEventId` is unique.
Likely interview question: How do you handle webhook retries?

## Deduplication
Simple answer: Merge repeat observations instead of inserting duplicates.
Technical answer: Duplicate ingestion increments count, updates last seen, and preserves first seen.
How this project uses it: `IngestionService` performs transactional merge behavior.
Likely interview question: What happens if duplicates arrive concurrently?

## REST
Simple answer: HTTP endpoints expose resources and actions.
Technical answer: REST APIs use methods, paths, status codes, and JSON DTOs for client-server contracts.
How this project uses it: `/events`, `/sources`, `/dashboard`, `/auth`, and `/ingest` expose the app.
Likely interview question: Which endpoints should be protected?

## DTO
Simple answer: A DTO defines request or response shape.
Technical answer: DTOs validate and document fields at the HTTP boundary.
How this project uses it: Source payloads and mutation requests use DTO classes.
Likely interview question: Why not accept arbitrary JSON into a service?

## Controller
Simple answer: A controller handles HTTP routing.
Technical answer: Controllers should stay thin and delegate business logic to services.
How this project uses it: Ingestion controllers call adapters and services, but do not embed mapping rules.
Likely interview question: What logic belongs outside controllers?

## Service
Simple answer: A service contains application behavior.
Technical answer: Services coordinate repositories, transactions, validation helpers, and history records.
How this project uses it: Event and ingestion workflows live in services.
Likely interview question: How do you test service logic without HTTP?

## Repository
Simple answer: A repository reads and writes entities.
Technical answer: TypeORM repositories abstract persistence operations for entity classes.
How this project uses it: Services inject repositories for users, events, notes, history, and sources.
Likely interview question: When do you use a query builder?

## PostgreSQL
Simple answer: PostgreSQL is the relational database.
Technical answer: It provides constraints, indexes, transactions, UUIDs, and JSONB.
How this project uses it: Events, users, source metrics, notes, and history are stored in PostgreSQL.
Likely interview question: Why enforce uniqueness in the database?

## JSONB
Simple answer: JSONB stores structured JSON in PostgreSQL.
Technical answer: JSONB stores parsed binary JSON and can be indexed or queried when needed.
How this project uses it: Raw source payloads are preserved for analyst context.
Likely interview question: Why store both normalized fields and raw payload?

## Index
Simple answer: An index speeds up common queries.
Technical answer: Indexes trade write overhead and storage for faster filtering and sorting.
How this project uses it: `detectedAt`, `severity`, `status`, `sourceType`, `category`, `assetName`, and `assignedToId` are indexed.
Likely interview question: Which filters deserve indexes?

## Transaction
Simple answer: A transaction groups database changes atomically.
Technical answer: Either all related writes commit or none do.
How this project uses it: Event insert/merge, source metrics, and history are coordinated during ingestion.
Likely interview question: Why does deduplication need a transaction?

## Authentication
Simple answer: Prove who the user is.
Technical answer: Login checks bcrypt password hashes and returns a JWT.
How this project uses it: Seeded users authenticate at `/auth/login`.
Likely interview question: Why store password hashes instead of passwords?

## Authorization
Simple answer: Decide what an authenticated user may do.
Technical answer: Authorization applies policies such as role checks and assignee rules.
How this project uses it: VIEWER is read-only; ANALYST and ADMIN can mutate workflow.
Likely interview question: Where should authorization checks run?

## RBAC
Simple answer: Role-based access control grants permissions by role.
Technical answer: Guards compare required route roles with the authenticated user's role.
How this project uses it: `RolesGuard` protects mutation endpoints.
Likely interview question: What are RBAC's limitations?

## JWT
Simple answer: A signed token carrying user identity claims.
Technical answer: The API validates bearer tokens before protected requests.
How this project uses it: Analyst APIs require JWT auth.
Likely interview question: What should not be stored in a JWT?

## API key
Simple answer: A shared secret used by machine clients.
Technical answer: API keys can authenticate ingestion clients but need rotation and scoping in production.
How this project uses it: `X-Ingest-Key` protects fictional source ingestion.
Likely interview question: Why would per-source keys be better?

## Docker
Simple answer: Docker packages apps and dependencies into containers.
Technical answer: Multi-stage Dockerfiles build smaller runtime images.
How this project uses it: Separate images are defined for the API and web app.
Likely interview question: What belongs in an image versus an environment variable?

## Compose networking
Simple answer: Compose services can reach each other by service name.
Technical answer: `api` connects to PostgreSQL using host `postgres`, not `localhost`.
How this project uses it: `docker-compose.yml` wires `web`, `api`, and `postgres`.
Likely interview question: Why does localhost fail inside containers?

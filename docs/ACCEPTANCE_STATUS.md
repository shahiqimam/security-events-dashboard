# Acceptance Status

This file tracks the build brief honestly. It is not a substitute for CI.

## Completed in code

- Three fictional adapters: `MOCK_SIEM`, `MOCK_EDR`, `MOCK_IAM`
- Source validation with `class-validator`
- Normalization outside controllers
- API-key ingestion guard
- Normalized `SecurityEvent` model
- Unique deduplication key: `sourceType + sourceEventId`
- Duplicate merge with occurrence count and history
- Concurrent duplicate insert recovery on PostgreSQL unique violation
- Event source metrics and derived activity state
- JWT login and seeded users
- RBAC guards for analyst/admin mutations
- Event list/detail APIs with filters and pagination
- Status workflow helper and tests
- Assignment rules preventing VIEWER assignment
- Notes and history APIs
- Dashboard aggregate APIs
- Next.js dashboard, event list, event detail, assignment, notes, history, and sources pages
- TypeORM migration and seed data
- Swagger setup and endpoint metadata
- Demo ingestion generator
- Demo verification script
- Dockerfiles, `.dockerignore`, and Docker Compose
- README and docs

## Verified locally

- `npm ci`
- `npm run lint`
- `npm run test`
- `npm run build`
- `docker compose up --build -d`
- `npm run demo:events -- --source MOCK_SIEM --count 10`
- `npm run demo:events -- --source MOCK_EDR --count 10`
- `npm run demo:events -- --source MOCK_IAM --count 10`
- `npm run demo:events -- --source MOCK_SIEM --count 5 --duplicates`
- `npm run verify:demo`

`verify:demo` checks login, bad ingestion key rejection, event list/filter, duplicate occurrence count, assignment, status transitions, viewer mutation denial, notes, history, dashboard summary, and Swagger JSON.

## Remaining caveats

- `npm audit --audit-level=moderate` still reports dependency vulnerabilities. `npm audit fix` does not resolve them without breaking major upgrades such as Nest 12 and Next 16, so they are documented rather than force-upgraded in this pass.
- Browser UI was verified through HTTP/API flow and successful Next.js production builds, not visual screenshot capture.

## Remaining production-hardening items intentionally not implemented

- Per-source ingestion credentials
- Signed webhook verification
- mTLS/OAuth/private networking
- Message queue or workers
- Search engine integration
- Correlation engine
- Threat intelligence enrichment
- Multi-tenancy and high availability

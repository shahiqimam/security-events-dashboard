# Architecture

SentinelView accepts fictional source payloads through the ingestion API, validates them with source-specific DTOs, normalizes them through adapters, and stores a common `SecurityEvent` record in PostgreSQL.

Controllers route requests and enforce guards. Adapter and normalization logic lives under `apps/api/src/ingestion/adapters`. Analyst behavior lives in `apps/api/src/events`.

#!/usr/bin/env sh
set -eu

: "${INGEST_API_KEY:?INGEST_API_KEY is required}"

npm run demo:events -- --source MOCK_SIEM --count 3
npm run demo:events -- --source MOCK_EDR --count 3
npm run demo:events -- --source MOCK_IAM --count 3
npm run demo:events -- --source MOCK_SIEM --count 3 --duplicates

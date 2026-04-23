# Backend Implementation Plan

## Purpose

Implement backend for GPS logistics system using firmware MQTT contract in [Firmware_MQTT_Client_Dashboard_Guide.md](./Firmware_MQTT_Client_Dashboard_Guide.md) as source of truth for mobile device events.

Backend goals:

- consume MQTT events from mobile firmware
- normalize telemetry, scan, heartbeat, command flows
- persist device, package, timeline, alert state
- expose REST and realtime APIs for dashboard
- keep dashboard isolated from raw broker access

This plan assumes current repo remains main web app and backend logic is added in stages. Because firmware already speaks MQTT, backend should be event-driven first, CRUD second.

---

## 1. Contract Lock

Before coding, freeze backend-facing firmware contract.

Deliverables:

- schema docs for `telemetry`, `scan`, `heartbeat`, `cmd`
- allowed topic list:
  - `logistics/mobile/{device_id}/telemetry`
  - `logistics/mobile/{device_id}/scan`
  - `logistics/mobile/{device_id}/heartbeat`
  - `logistics/mobile/{device_id}/cmd`
- field validation rules for:
  - `schema_version`
  - `device_id`
  - `timestamp_utc`
  - `facility_id`
  - `gps_fix`
  - `scan_context`
  - `event_id`
  - `sequence_no`
- fallback timestamp policy for low-confidence device time
- retained telemetry policy review

Decisions to lock:

- use firmware `schema_version = 2.0` as accepted version
- keep raw MQTT payload alongside normalized records for audit/debug
- treat `event_id` as idempotency key for scan events
- treat `(device_id, sequence_no)` as telemetry dedupe key when present

---

## 2. Target Backend Shape

Recommended shape for this repo:

- Next.js app keeps UI and authenticated dashboard routes
- separate backend worker process inside repo handles MQTT subscribe/publish, background jobs, alert evaluation
- shared `lib/` package holds schemas, types, status mapping, auth helpers
- database used as system of record
- dashboard receives live updates from backend via server-sent events or WebSocket

Reason:

- firmware integration needs long-lived MQTT connection and background consumers
- route handlers alone not enough for reliable broker ingestion
- current repo already Node/TypeScript, so shared code easier than split-language stack

Suggested folders:

- `lib/backend/schemas`
- `lib/backend/mqtt`
- `lib/backend/domain`
- `lib/backend/db`
- `lib/backend/realtime`
- `app/api/...` for REST endpoints
- `scripts/backend-worker.ts` or `server/backend-worker.ts`

---

## 3. Core Domain Model

Create canonical backend entities.

### Devices

Store:

- `device_id`
- `device_type`
- `device_role`
- `facility_id`
- `location_name`
- `status`
- `last_seen_at`
- `last_heartbeat_at`
- `last_telemetry_at`
- `last_lat`
- `last_lng`
- `gps_fix`
- `battery_pct`
- `wifi_rssi`
- `signal_strength`
- `uptime_sec`

### Packages

Store:

- `tracking_id`
- `rfid_epc`
- `status`
- `current_device_id`
- `current_facility_id`
- `last_known_lat`
- `last_known_lng`
- `last_event_at`
- `eta`
- sender/recipient fields from product flows

### Package Events

Timeline table for all package movement/status transitions.

Store:

- `event_id`
- `tracking_id`
- `source_type` (`scan`, `telemetry-derived`, `manual`, `alert`)
- `status`
- `scan_context`
- `device_id`
- `facility_id`
- `location_name`
- `lat`
- `lng`
- `timestamp_utc`
- `raw_payload`

### Device Telemetry

Append-only telemetry history.

Store:

- `device_id`
- `sequence_no`
- GPS fields
- `active_package_count`
- `battery_pct`
- `signal_strength`
- `gps_fix`
- `timestamp_utc`
- `ingested_at`

### Device Heartbeats

Store heartbeat samples and derived online/offline transitions.

### Alerts

Store:

- `alert_id`
- `type`
- `severity`
- `device_id`
- optional `tracking_id`
- `target_roles`
- `message`
- `is_read`
- `acknowledged_by`
- `triggered_at`

### Commands

Audit every outbound command.

Store:

- `command_id`
- `device_id`
- `command`
- `payload`
- `requested_by`
- `status` (`queued`, `published`, `acked`, `failed`)
- `created_at`

---

## 4. Ingestion Pipeline

Build MQTT consumer first. Everything else depends on it.

### 4.1 MQTT Subscriber

Subscribe to:

- `logistics/mobile/+/telemetry`
- `logistics/mobile/+/scan`
- `logistics/mobile/+/heartbeat`

Responsibilities:

- parse topic into `device_id`, message type
- validate JSON against runtime schema
- reject unknown schema versions
- persist raw event log
- route message to correct processor

### 4.2 Telemetry Processor

Responsibilities:

- validate retained/current telemetry payload
- upsert device live state
- append telemetry history
- update package live positions for packages assigned to mobile device
- run geofence checks
- push live dashboard event

Special rules:

- if `gps_fix = false`, mark position low-confidence
- if lat/lng are `0.0`, do not overwrite last good map position without explicit low-confidence flag
- use `sequence_no` to reject out-of-order duplicates when possible

### 4.3 Scan Processor

Responsibilities:

- enforce idempotency using `event_id`
- secondary dedupe window on `(device_id, rfid_epc, scan_context, timestamp bucket)`
- resolve `rfid_epc` to package
- create package timeline event
- update package status/location
- attach/detach package to current mobile device as needed
- trigger alert rules and customer-visible updates

Initial status mapping:

- `pickup` -> package becomes `picked_up` or `loaded`
- `in_transit` -> package becomes `in_transit`

Need extension point for future scan contexts.

### 4.4 Heartbeat Processor

Responsibilities:

- update `last_heartbeat_at`
- mark device `online`
- store health sample
- refresh status panel cache
- emit online event on reconnect

Background rule:

- if heartbeat absent for >90s, mark device `offline`
- create alert for operator

---

## 5. Command Pipeline

Dashboard must never publish raw MQTT directly.

Flow:

1. authenticated user calls backend action/API
2. backend authorizes by role
3. backend validates command payload
4. backend writes command audit record
5. backend publishes JSON to `logistics/mobile/{device_id}/cmd`
6. backend updates command status based on publish result and later device heartbeat/telemetry evidence

Supported first-wave commands:

- `update_role`
- `force_scan`
- `set_cooldown`
- `reboot`

REST/API surface:

- `POST /api/devices/:deviceId/commands/update-role`
- `POST /api/devices/:deviceId/commands/force-scan`
- `POST /api/devices/:deviceId/commands/set-cooldown`
- `POST /api/devices/:deviceId/commands/reboot`

Security rules:

- operator only
- full audit log
- rate limit dangerous commands
- require explicit confirmation UI for `reboot`

---

## 6. Dashboard-Facing APIs

Implement thin APIs over normalized data, not over raw MQTT payloads.

### Realtime

Push channels:

- live device telemetry stream
- package timeline updates
- alert feed
- device online/offline transitions

Recommended payloads:

- compact device snapshot for map cards
- normalized package event DTO
- alert DTO with role-filtered visibility

### REST

Minimum endpoints:

- `POST /api/auth/login`
- `GET /api/me`
- `GET /api/devices`
- `GET /api/devices/:deviceId`
- `GET /api/packages`
- `GET /api/packages/:trackingId`
- `GET /api/packages/:trackingId/timeline`
- `GET /api/alerts`
- `POST /api/alerts/:alertId/acknowledge`
- `GET /api/public/track/:trackingId`

Filtering support:

- device status
- facility
- package status
- date range
- unread alerts

---

## 7. Database Plan

Use PostgreSQL. Add PostGIS if geofence work starts in same phase.

Phase 1 tables:

- `devices`
- `device_telemetry`
- `device_heartbeats`
- `packages`
- `package_events`
- `alerts`
- `device_commands`
- `raw_mqtt_events`
- `users`
- `user_facility_scopes`

Phase 2 tables:

- `geofences`
- `package_device_assignments`
- `unknown_scans`
- `notification_deliveries`

Indexing priorities:

- `devices(device_id)` unique
- `device_telemetry(device_id, timestamp_utc desc)`
- `package_events(tracking_id, timestamp_utc desc)`
- `package_events(event_id)` unique
- `packages(rfid_epc)` unique
- `alerts(is_read, triggered_at desc)`
- `raw_mqtt_events(device_id, ingested_at desc)`

Retention policy:

- keep normalized events indefinitely for MVP
- move old raw MQTT events to cheaper retention or prune by age

---

## 8. Status Resolution Rules

Backend must translate firmware events into business state.

Initial package state machine:

- `registered`
- `picked_up`
- `in_transit`
- `at_hub`
- `out_for_delivery`
- `delivered`
- `exception`

Resolution rules for firmware-first phase:

- first valid `pickup` scan -> `picked_up`
- subsequent mobile telemetry while attached to truck -> `in_transit`
- operator override or future fixed scanner event can move package to `at_hub`
- delivered state needs explicit future scan context or operator/manual rule

Important gap:

- current firmware only emits `pickup` and `in_transit`
- backend plan must include extensible mapping table, not hardcoded assumptions

---

## 9. Security Plan

Implement security from start. Not later.

Requirements:

- JWT auth for operator and warehouse staff
- role-scoped API access
- facility-scoped data filtering
- public tracking endpoint returns no PII
- broker credentials kept server-side only
- MQTT ACLs enforced outside dashboard
- input validation on every command and MQTT payload
- audit logs for login, command publish, manual status changes

Role rules:

- operator: full fleet, alerts, commands, package override
- warehouse staff: facility-only views, no device command access
- public customer: tracking page only

---

## 10. Reliability Plan

Firmware guide already defines offline buffering. Backend must complement it.

Implement:

- idempotent ingestion for duplicate MQTT delivery
- dead-letter handling for invalid payloads
- reconnecting MQTT client with backoff
- offline detector job for missed heartbeats
- alert generation for reconnect and offline
- command publish retry for transient broker errors
- monitoring counters:
  - messages ingested
  - schema validation failures
  - duplicate scans dropped
  - offline devices
  - command publish failures

Operational rule:

- event ordering uses `timestamp_utc` plus `sequence_no` when available
- arrival order never treated as source of truth

---

## 11. Implementation Phases

### Phase 0. Foundation

- choose DB library and migration tool
- add env config for DB, MQTT, JWT
- add runtime schema validation layer
- create initial database schema
- seed users, facilities, test packages, RFID mappings

Exit criteria:

- local app boots
- DB migrated
- worker connects to broker

### Phase 1. MQTT Ingestion

- implement subscriber
- raw event logging
- telemetry/scan/heartbeat processors
- device online/offline state
- package event persistence

Exit criteria:

- firmware messages visible in DB
- device status page can render live backend data

### Phase 2. Realtime Dashboard Feed

- add SSE or WebSocket server path
- broadcast normalized telemetry, alerts, package events
- add cache/snapshot queries for initial load

Exit criteria:

- dashboard updates within PRD target window

### Phase 3. Command API

- authenticated command endpoints
- MQTT publisher
- command audit records
- operator-only access control

Exit criteria:

- backend can publish each supported firmware command safely

### Phase 4. Business Logic

- package status resolver
- alert engine
- facility scoping
- public tracking endpoint

Exit criteria:

- timeline and alerts reflect real firmware events

### Phase 5. Hardening

- integration tests with broker fixture
- invalid payload tests
- duplicate/out-of-order event tests
- load test at MVP scale
- observability and runbooks

Exit criteria:

- stable under 10–50 package/device simulation target

---

## 12. Test Strategy

Required test layers:

- schema unit tests for all firmware payloads
- processor unit tests for telemetry, scan, heartbeat
- DB integration tests for idempotency and status transitions
- MQTT integration tests using broker container
- API auth/RBAC tests
- end-to-end test: firmware event -> DB -> realtime push -> dashboard fetch

Critical scenarios:

- retained telemetry on subscriber start
- heartbeat reconnect after outage
- scan buffered then replayed after MQTT reconnect
- duplicate scan within dedupe window
- telemetry with `gps_fix = false`
- unknown RFID EPC
- operator sends `reboot` command

---

## 13. Open Decisions

Resolve before implementation starts:

- use SSE or WebSocket for dashboard live feed
- keep backend inside Next runtime or as dedicated Node worker + API hybrid
- exact DB stack and migration tool
- whether PostGIS starts in phase 1 or phase 4
- command acknowledgment strategy because firmware guide has no explicit command ack topic
- fallback timestamp handling for placeholder firmware time

---

## 14. Suggested Build Order In Repo

1. add shared schemas and DTOs
2. add database schema and seed data
3. add backend worker for MQTT ingest
4. add normalized query APIs
5. add realtime feed
6. add command publish APIs
7. wire dashboard to backend snapshots + live stream
8. add alerts and public tracking
9. harden with tests and observability

---

## 15. Immediate Next Tasks

Concrete next tickets:

- define TypeScript zod schemas for four firmware payloads
- create DB migration for `devices`, `device_telemetry`, `device_heartbeats`, `packages`, `package_events`, `device_commands`, `alerts`, `raw_mqtt_events`
- add MQTT topic parser and subscriber skeleton
- seed package-to-RFID mapping for test device `DEV-TRUCK-001`
- create device status query endpoint
- create package timeline query endpoint
- create operator command endpoint for `update_role`

These tasks give first end-to-end slice: firmware publish -> backend ingest -> DB state -> dashboard read -> backend command publish.

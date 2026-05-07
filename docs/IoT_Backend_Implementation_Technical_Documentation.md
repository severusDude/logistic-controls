# IoT Backend Implementation Technical Documentation

**Project:** Logistic Controls
**Document date:** May 7, 2026
**Source basis:** Current repository scan, `PRD_GPS_Logistic_Package_Tracking_MVP.md`, `IoT_Device_Implementation_Technical_Documentation.md`, and Next.js 16 local docs under `node_modules/next/dist/docs/`.
**Backend scope in this document:** Next.js route handlers, Prisma/PostgreSQL model, MQTT worker, ingestion processors, realtime SSE snapshot service, and backend requirement coverage.

---

## 1. Executive Summary

The backend has moved beyond a frontend-only mock. It now contains a partial IoT ingestion backend for mobile device telemetry, RFID scan events, heartbeats, raw MQTT event persistence, device offline detection, package timeline lookup, and mobile device command publishing.

The current backend is best described as **Phase 1 IoT control-plane backend** rather than the full PRD logistics tracking backend.

Implemented backend capabilities:

- Prisma schema for facilities, users, user facility scopes, devices, packages, package events, telemetry, heartbeats, alerts, device commands, raw MQTT events, and unknown scans.
- PostgreSQL datasource configured through Prisma 7 with `@prisma/adapter-pg`.
- Migration files exist for initial schema and unknown scan support.
- Seed script creates development operator, warehouse user, one facility, one mobile device, and three packages.
- MQTT worker subscribes to mobile telemetry, scan, and heartbeat topics.
- MQTT raw event persistence for telemetry, scan, heartbeat, and published commands.
- Zod schemas validate incoming mobile payloads and outgoing command payloads.
- Mobile telemetry processor updates device state, stores telemetry, and propagates mobile GPS to packages currently attached to that device.
- Scan processor resolves RFID EPC to package, creates package events, updates package state/location, and quarantines unknown scans.
- Heartbeat processor updates device state and stores heartbeat history.
- Offline detector marks devices offline after stale heartbeat threshold.
- API route handlers expose health, device list/detail, package timeline, raw events, realtime SSE snapshots, and device commands.
- Command publisher sends `update_role`, `force_scan`, `set_cooldown`, and `reboot` commands to mobile device MQTT cmd topics.

Major backend gaps against PRD and device architecture:

- No authentication/session/JWT middleware is implemented despite user and role models existing.
- No RBAC enforcement on API routes or realtime stream.
- No package CRUD API is implemented.
- No alert engine behavior is implemented, though the `Alert` table exists.
- No geofence model/evaluator/PostGIS spatial behavior is implemented.
- No fixed-device MQTT subscription or fixed-device processor is implemented.
- No full scan context coverage; scan schema currently accepts only `pickup` and `in_transit`.
- No route/waypoint/speed-profile simulation engine is implemented.
- No WebSocket server exists; realtime UI uses SSE snapshot polling.
- No database container is present in `docker-compose.yml`; only Mosquitto is configured.
- MQTT broker is configured with anonymous access and no ACL, suitable only for local MVP testing.

---

## 2. Backend Stack

| Area | Current implementation |
|---|---|
| Framework/API layer | Next.js 16 App Router route handlers under `app/api/` |
| Runtime | Node.js route handlers for MQTT command and SSE stream where needed |
| Database ORM | Prisma 7.8.0 generated to `generated/prisma` |
| Database adapter | `@prisma/adapter-pg` with PostgreSQL connection string |
| Database | PostgreSQL datasource configured in Prisma; no Docker DB service currently present |
| MQTT client | `mqtt` npm package |
| MQTT broker config | Mosquitto 2.x via `docker-compose.yml`, anonymous local listener on 1883 |
| Validation | Zod 4 schemas |
| Worker runtime | `tsx scripts/backend-worker.ts` |
| Password hashing | `bcryptjs` used by seed data only |
| Realtime dashboard feed | Server-Sent Events endpoint `/api/realtime/stream` |

---

## 3. Environment Configuration

Defined in `lib/backend/config.ts`.

| Variable | Required for app routes | Required for worker | Purpose |
|---|---:|---:|---|
| `DATABASE_URL` | Yes | Yes | PostgreSQL connection string used by Prisma adapter. |
| `JWT_SECRET` | Yes | Yes through shared base schema | Required by config schema, but no auth implementation currently consumes it. |
| `BCRYPT_ROUNDS` | Yes | Yes through shared base schema | Used by seed script for local user password hashing. |
| `MQTT_URL` | Optional | Yes | MQTT broker URL. |
| `MQTT_USERNAME` | Optional | Optional | MQTT username. |
| `MQTT_PASSWORD` | Optional | Optional | MQTT password. |
| `MQTT_CLIENT_ID` | Optional | Yes | MQTT client identity; publisher appends a generated suffix. |

Current config behavior:

- `getAppConfig()` validates database/JWT/bcrypt fields and marks `mqttConfigured` true only when `MQTT_URL` and `MQTT_CLIENT_ID` exist.
- `getWorkerConfig()` additionally requires `MQTT_URL` and `MQTT_CLIENT_ID`.
- Environment loading uses `@next/env` for app-style env loading outside normal Next runtime.

Planning note:

- Requiring `JWT_SECRET` and `BCRYPT_ROUNDS` for all app routes means even unauthenticated health checks need auth-related env variables today. That is acceptable for early local development, but may be unnecessarily strict for production health checks.

---

## 4. Database Schema

Defined in `prisma/schema.prisma`.

### 4.1 Enums

| Enum | Values | Current use |
|---|---|---|
| `DeviceType` | `mobile`, `fixed` | Device classification. Processors currently create/update mobile devices only. |
| `DeviceStatus` | `online`, `offline`, `warning`, `idle` | Device state for UI and offline detector. |
| `PackageStatus` | `registered`, `picked_up`, `in_transit`, `at_hub`, `out_for_delivery`, `delivered`, `exception` | Package lifecycle statuses. Scan processor currently maps only pickup/in_transit behavior. |
| `UserRole` | `operator`, `warehouse_staff` | Seeded users and facility scoping. Not enforced by routes yet. |
| `CommandStatus` | `queued`, `published`, `acked`, `failed` | Device command lifecycle. `acked` is modeled but no ack consumer exists. |
| `AlertSeverity` | `info`, `warning`, `critical` | Alert model exists; engine not implemented. |
| `RawEventType` | `telemetry`, `scan`, `heartbeat`, `cmd` | Raw MQTT event classification. |

### 4.2 Core Models

| Model | Current responsibility | Implemented behavior |
|---|---|---|
| `Facility` | Facility identity and location label. | Seeded and used to scope devices/packages/users. |
| `User` | Operator/warehouse staff account record. | Seeded only; no auth route/session/middleware yet. |
| `UserFacilityScope` | Warehouse user to facility relation. | Seeded only; not enforced yet. |
| `Device` | Canonical device registry state. | Upserted by telemetry/scan/heartbeat processors. Queried by API and dashboard snapshot. |
| `Package` | Package identity, RFID EPC, status, current location/device/facility. | Seeded; updated by scan/telemetry processors. No CRUD API yet. |
| `PackageEvent` | Timeline/status event history. | Created by scan processor. Queried by timeline API and realtime snapshot. |
| `DeviceTelemetry` | GPS telemetry history. | Created by telemetry processor with duplicate guard by device and sequence number. |
| `DeviceHeartbeat` | Device heartbeat history. | Created by heartbeat processor. |
| `Alert` | Alert storage. | Schema exists only; no alert creation/ack API implemented. |
| `DeviceCommand` | Outbound command history. | Created and status-updated by command publisher. |
| `RawMqttEvent` | Raw event audit log. | Created for inbound MQTT messages and published commands. |
| `UnknownScan` | Quarantine for scan events whose EPC does not match a package. | Created/upserted by scan processor. |

### 4.3 Missing Data Models for Full PRD

| Missing model/field area | Why needed |
|---|---|
| Geofence polygon model | PRD requires delivery zones and geofence breach detection. |
| Route and waypoint models | PRD requires predefined waypoints and route assignment. |
| Driver/carrier assignment model | Needed if mobile devices represent trucks/drivers beyond current device state. |
| Package dimensions fields | PRD requires package weight/dimensions; current model lacks dimensions and weight. |
| Origin/destination structured models | Current package stores sender/recipient addresses and current facility, but not origin/destination entities. |
| Alert recipient/read records | Current `Alert` has one `isRead` and one `acknowledgedByUserId`; role/user-specific read state is not modeled. |
| Command acknowledgement event model | `CommandStatus.acked` exists, but no ack topic/schema/processor exists. |

---

## 5. API Route Inventory

All API routes are implemented as Next.js App Router `route.ts` handlers under `app/api/`.

| Method | Route | File | Behavior | Auth/RBAC status |
|---|---|---|---|---|
| GET | `/api/health` | `app/api/health/route.ts` | Checks database with `SELECT 1`; returns MQTT configured flag. | No auth |
| GET | `/api/devices` | `app/api/devices/route.ts` | Returns device snapshots. | No auth |
| GET | `/api/devices/:deviceId` | `app/api/devices/[deviceId]/route.ts` | Returns detailed device snapshot with latest telemetry/heartbeat and raw event count. | No auth |
| POST | `/api/devices/:deviceId/commands/:command` | `app/api/devices/[deviceId]/commands/[command]/route.ts` | Validates command route/body, creates command record, publishes MQTT command. | No auth |
| GET | `/api/internal/raw-events` | `app/api/internal/raw-events/route.ts` | Returns recent raw MQTT events with optional `deviceId`, `type`, and `limit`. | No auth despite internal path |
| GET | `/api/packages/:trackingId/timeline` | `app/api/packages/[trackingId]/timeline/route.ts` | Returns package state and package event timeline. | No auth; not public-safe reviewed |
| GET | `/api/realtime/stream` | `app/api/realtime/stream/route.ts` | Emits SSE `snapshot` events when DB watermarks change; keepalive every 15 seconds. | No auth |

API gaps:

- No `/api/auth/login` or logout/session route.
- No package list route.
- No package create/update/status override routes.
- No alert list/ack/dismiss routes.
- No geofence CRUD/evaluation route.
- No facility CRUD route.
- No route/waypoint route.
- No public tracking route with restricted response contract.
- No RBAC middleware or request user resolution.

---

## 6. MQTT Integration

### 6.1 Broker

`docker-compose.yml` currently defines only one service:

```text
mosquitto -> eclipse-mosquitto:2.0, port 1883
```

`infra/mosquitto/mosquitto.conf`:

```text
listener 1883
allow_anonymous true
persistence false
log_dest stdout
```

This is a local development broker only. It does not satisfy the device tech doc security target of per-device credentials and broker ACLs.

### 6.2 Worker Startup

`pnpm worker:dev` runs:

```text
tsx scripts/backend-worker.ts
```

Worker startup flow:

```text
backend-worker.ts
  -> connect to database with SELECT 1
  -> create MQTT subscriber
  -> every 30 seconds run markOfflineDevices()
  -> handle SIGINT/SIGTERM cleanup
```

### 6.3 Subscribed Topics

Defined in `lib/backend/mqtt/subscriber.ts`:

```text
logistics/mobile/+/telemetry
logistics/mobile/+/scan
logistics/mobile/+/heartbeat
```

Unsupported today:

- `logistics/fixed/{device_id}/scan`
- `logistics/fixed/{device_id}/heartbeat`
- command acknowledgement topics
- alert topics
- wildcard `logistics/+/{device_id}/heartbeat` from the device tech doc

### 6.4 Topic Parser

`lib/backend/mqtt/topic-parser.ts` accepts only:

```text
logistics/mobile/{deviceId}/{telemetry|scan|heartbeat}
```

The parser returns namespace `mobile`, device ID, and topic type. Any unsupported topic is ignored by the worker.

### 6.5 Inbound Message Handling

```text
MQTT message received
  -> parse topic
  -> parse JSON payload
  -> persist RawMqttEvent
  -> validate payload by topic type with Zod
  -> verify payload.device_id matches topic deviceId
  -> call telemetry, scan, or heartbeat processor
  -> log result/error to worker console
```

Raw events are persisted before payload schema validation. Invalid JSON is not persisted because it cannot be stored as JSON. Invalid object shapes are also not persisted.

---

## 7. Payload Schemas

### 7.1 Shared Schema Behavior

Shared helpers live in `lib/backend/schemas/shared.ts`.

Current schemas use:

- `schema_version` literal from shared schema.
- Timestamp string transform to `Date`.
- Latitude/longitude validation for GPS fields.

### 7.2 Telemetry Payload

File: `lib/backend/schemas/telemetry.ts`

Accepted payload shape:

- `schema_version`
- `device_id`
- `device_type: "mobile"`
- `facility_id`
- `timestamp_utc`
- `sequence_no`
- `gps.lat`, `gps.lng`, optional altitude/accuracy/heading/speed
- optional `active_package_count`
- optional `battery_pct`
- optional `signal_strength`
- `gps_fix`

Gaps versus device tech doc:

- Device tech doc sample uses `device_type`, `facility_id`, and nested GPS fields; current schema aligns with mobile telemetry.
- No fixed-device telemetry needed per architecture.
- No schema for command acknowledgements.

### 7.3 Scan Payload

File: `lib/backend/schemas/scan.ts`

Accepted payload shape:

- `schema_version`
- `event_id`
- `device_id`
- `device_type: "mobile"`
- `device_role`
- `facility_id`
- `location_name`
- `timestamp_utc`
- `rfid_epc`
- `scan_context: "pickup" | "in_transit"`
- optional `signal_strength_dbm`
- optional `read_count`
- optional `device_gps`

Gaps versus device tech doc:

- Device tech doc scan contexts include `arrival`, `pickup`, `in_transit`, `hub_transfer`, `out_for_delivery`, `delivered`, and `exception`.
- Current backend accepts only `pickup` and `in_transit`.
- Current backend accepts only mobile scans, not fixed scanner scans.

### 7.4 Heartbeat Payload

File: `lib/backend/schemas/heartbeat.ts`

Accepted payload shape:

- `schema_version`
- `device_id`
- `device_type: "mobile"`
- `device_role`
- `facility_id`
- `timestamp_utc`
- optional `uptime_sec`
- `status`
- optional `rfid_reader_status`
- optional `gps_fix`
- optional `packages_scanned_today`
- optional `wifi_rssi`

Gaps:

- Fixed-device heartbeat is not accepted.
- No broker ACL/device credential verification layer exists.

### 7.5 Command Payloads

File: `lib/backend/schemas/cmd.ts`

Supported commands:

| API route segment | MQTT command | Payload |
|---|---|---|
| `update-role` | `update_role` | `new_role`, `new_facility_id`, `new_location_name` |
| `force-scan` | `force_scan` | `{}` |
| `set-cooldown` | `set_cooldown` | `cooldown_sec` |
| `reboot` | `reboot` | `{}` |

Command envelope:

```json
{
  "command": "force_scan",
  "command_id": "CMD-YYYYMMDD-XXXXXXXX",
  "payload": {}
}
```

Gaps:

- Device tech doc sample includes `schema_version`, `issued_by`, and `timestamp_utc`; current envelope omits these.
- Command records support `acked`, but no ack processor exists.
- `requestedByUserId` is nullable and currently not populated because auth is not implemented.

---

## 8. Processing Pipelines

### 8.1 Raw Event Persistence

File: `lib/backend/processors/raw-events.ts`

```text
persistRawEvent(input)
  -> create RawMqttEvent with topic, deviceId, eventType, qos, retain, payload, schemaVersion
```

Used for:

- inbound telemetry
- inbound scans
- inbound heartbeats
- outbound published commands

### 8.2 Telemetry Processor

File: `lib/backend/processors/telemetry.ts`

```text
processTelemetry(payload)
  -> find facility by facility_id
  -> check GPS usability: gps_fix true and coordinate not (0,0)
  -> upsert mobile Device as online
  -> insert DeviceTelemetry if same device/sequence_no not already present
  -> find packages where currentDeviceId == device.id
  -> update attached packages lastEventAt and location from usable GPS
  -> if package status is picked_up, move to in_transit
```

Implemented requirement value:

- Supports package location inheritance from mobile device GPS after a scan attaches the package to the mobile device.
- Guards duplicate telemetry by `deviceId` + `sequenceNo`.

Current limits:

- Does not create package timeline events for telemetry movement.
- Does not calculate ETA.
- Does not evaluate geofences.
- Does not update alerts.
- Does not compare firmware `active_package_count` against backend manifest.

### 8.3 Scan Processor

File: `lib/backend/processors/scan.ts`

```text
processScan(payload)
  -> skip if PackageEvent with event_id already exists
  -> find facility by facility_id
  -> upsert mobile Device as online
  -> lookup Package by rfid_epc
  -> if missing: upsert UnknownScan and return unknown_rfid
  -> map scan_context to PackageStatus
  -> create PackageEvent
  -> update Package currentFacilityId/currentDeviceId/status/lastEventAt/location
```

Current status mapping:

```text
pickup -> picked_up
in_transit -> in_transit
```

Implemented requirement value:

- Provides RFID EPC to package resolution.
- Persists status events for package timeline.
- Quarantines unknown scans.
- Supports package attachment to a mobile device.

Current limits:

- Does not implement backend duplicate suppression by `(device_id, rfid_epc, status_context)` time window.
- Does not support `arrival`, `hub_transfer`, `out_for_delivery`, `delivered`, or `exception` scan contexts.
- Does not produce alerts.
- Does not validate expected route/facility.
- Does not handle fixed devices.

### 8.4 Heartbeat Processor

File: `lib/backend/processors/heartbeat.ts`

```text
processHeartbeat(payload)
  -> find facility by facility_id
  -> upsert mobile Device as online
  -> create DeviceHeartbeat record
```

Current limits:

- No fixed heartbeat support.
- No alert on reconnect/offline recovery.
- No device health scoring beyond direct status fields.

### 8.5 Offline Detector

File: `lib/backend/processors/offline-detector.ts`

```text
markOfflineDevices()
  -> threshold = now - 90 seconds
  -> update devices with stale lastHeartbeatAt to status offline
```

Implemented requirement value:

- Matches device tech doc lifecycle rule for missed heartbeat >90s.

Current limits:

- Devices with null `lastHeartbeatAt` are not marked offline by this query.
- No alert is created when a device becomes offline.
- No package location uncertainty is set for packages attached to offline devices.

### 8.6 Command Publisher

File: `lib/backend/commands/publish-device-command.ts`

```text
publishDeviceCommand(input)
  -> lookup Device by deviceId
  -> reject if not found
  -> reject if deviceType != mobile
  -> generate commandId
  -> validate MQTT command envelope
  -> create DeviceCommand queued
  -> publish MQTT message to logistics/mobile/{deviceId}/cmd with QoS 2
  -> update DeviceCommand to published
  -> persist outbound RawMqttEvent cmd
  -> if publish fails, update DeviceCommand to failed
```

Implemented requirement value:

- Provides real backend-to-device command path for the firmware command handlers listed in the device doc.

Current limits:

- No command ack subscription.
- No auth or `issued_by` population.
- No fixed device command path.
- New MQTT client is created per publish; acceptable for MVP, but a pooled/shared publisher may be needed later.

---

## 9. Realtime Snapshot Service

Files:

- `app/api/realtime/stream/route.ts`
- `lib/backend/realtime/snapshot.ts`
- `lib/backend/realtime/contracts.ts`

### 9.1 SSE Route Behavior

```text
GET /api/realtime/stream
  -> get initial snapshot
  -> enqueue event: snapshot
  -> every 2 seconds check watermarks
  -> if device/raw/package event watermark changed, fetch and emit full snapshot
  -> every 15 seconds enqueue keepalive comment
```

Headers:

- `Content-Type: text/event-stream; charset=utf-8`
- `Cache-Control: no-cache, no-transform`
- `Connection: keep-alive`
- `X-Accel-Buffering: no`

### 9.2 Snapshot Contents

| Field | Source | Current consumer |
|---|---|---|
| `devices` | Device table mapped to UI device contract. | SimCon dashboard |
| `terminalEntries` | Recent `RawMqttEvent` records mapped to terminal lines. | SimCon dashboard |
| `packageEvents` | Recent `PackageEvent` records. | Not currently rendered |
| `watermarks` | Latest timestamps for device/raw/package changes. | SSE route change detection |
| `emittedAt` | Current server timestamp. | Not currently rendered |

### 9.3 Current Limits

- This is not a WebSocket server.
- It sends whole snapshots, not granular events.
- It uses polling every 2 seconds rather than direct push from processors.
- No user/role scoping exists.
- No alert stream exists.

---

## 10. Development Scripts and Deployment State

### 10.1 Scripts

From `package.json`:

| Script | Purpose |
|---|---|
| `pnpm dev` | Start Next.js dev server. |
| `pnpm build` | Build Next.js app. |
| `pnpm start` | Start production Next.js server. |
| `pnpm lint` | Run ESLint. |
| `pnpm db:generate` | Generate Prisma client. |
| `pnpm db:migrate` | Run Prisma migration in development. |
| `pnpm db:seed` | Seed database. Requires `--environment=development` or `--environment=production`. |
| `pnpm worker:dev` | Start MQTT backend worker. |
| `pnpm broker:up` | Start Mosquitto service. |
| `pnpm broker:down` | Stop Docker Compose services. |

### 10.2 Docker Compose

Current Docker Compose includes only:

- `mosquitto`

Missing from device tech doc target:

- backend API service
- frontend service
- PostgreSQL service
- fixed-device simulator
- mobile-device simulator

---

## 11. PRD Functional Requirement Coverage - Backend

### 11.1 GPS Simulation Engine Requirements

| ID | Backend state | Coverage |
|---|---|---|
| FR-SIM-01 | Backend ingests mobile telemetry every firmware interval if worker is running, but does not generate simulated GPS coordinates. | Not fulfilled as simulation engine |
| FR-SIM-02 | No waypoint model or route-following generator. | Not fulfilled |
| FR-SIM-03 | No load test for 10-50 concurrent packages/devices. | Not verified |
| FR-SIM-04 | No speed profile model/control. | Not fulfilled |
| FR-SIM-05 | REST APIs and SSE exist; no WebSocket API; no simulation API. | Partially fulfilled |

### 11.2 Real-Time Map Requirements

| ID | Backend state | Coverage |
|---|---|---|
| FR-MAP-01 | Package last-known positions can be stored and exposed through package timeline; no package map API exists. | Partially fulfilled data foundation |
| FR-MAP-02 | SSE emits snapshots at 2-second polling interval when watermarks change. | Partially fulfilled transport target |
| FR-MAP-03 | Package timeline API exists for a known tracking ID. | Partially fulfilled |
| FR-MAP-04 | Marker clustering is frontend concern; no backend clustering needed for MVP. | Not applicable/backend not needed now |
| FR-MAP-05 | No geofence model/API. | Not fulfilled |
| FR-MAP-06 | No geofence breach evaluation or breach state. | Not fulfilled |

### 11.3 Status Timeline Requirements

| ID | Backend state | Coverage |
|---|---|---|
| FR-TL-01 | `PackageEvent` model and `/api/packages/:trackingId/timeline` exist. | Partially fulfilled |
| FR-TL-02 | Prisma enum includes all standard PRD statuses. Processor currently maps only pickup/in_transit. | Partially fulfilled |
| FR-TL-03 | Package current status is returned by timeline API. | Fulfilled backend side |
| FR-TL-04 | Timeline entries include location and coordinates when scan payload includes GPS. | Partially fulfilled |

### 11.4 Alert and Notification Requirements

| ID | Backend state | Coverage |
|---|---|---|
| FR-ALT-01 | `Alert` model exists; no alert engine creates alerts. | Not fulfilled |
| FR-ALT-02 | No alert stream/notification center API. | Not fulfilled |
| FR-ALT-03 | `targetRoles` field exists but no role filtering is enforced. | Not fulfilled |
| FR-ALT-04 | `isRead` field exists but no API/use. | Not fulfilled |
| FR-ALT-05 | No email notification stub. | Not fulfilled |
| FR-ALT-06 | `acknowledgedByUserId` exists but no acknowledge/dismiss API. | Not fulfilled |

### 11.5 Package Management Requirements

| ID | Backend state | Coverage |
|---|---|---|
| FR-PKG-01 | Package model and seed data exist; no create package API. Weight/dimensions missing. | Partially fulfilled data foundation |
| FR-PKG-02 | No route assignment model/logic. | Not fulfilled |
| FR-PKG-03 | No manual status override API. | Not fulfilled |
| FR-PKG-04 | No package list/search/filter API. | Not fulfilled |
| FR-PKG-05 | Timeline endpoint is unauthenticated, but no public-safe tracking API/page contract exists. | Partially fulfilled, needs redesign |

### 11.6 RBAC Requirements

| ID | Backend state | Coverage |
|---|---|---|
| FR-RBAC-01 | User role enum supports operator and warehouse staff; no customer role because customer is public. | Partially fulfilled data foundation |
| FR-RBAC-02 | No operator access enforcement. | Not fulfilled |
| FR-RBAC-03 | User facility scope model exists; no API enforcement. | Partially fulfilled data foundation |
| FR-RBAC-04 | No public tracking-specific API with scoped data. | Not fulfilled |
| FR-RBAC-05 | User/passwordHash model and seed data exist; no login/JWT/session middleware. | Partially fulfilled data foundation |

---

## 12. Non-Functional Requirement Coverage - Backend

| ID | Requirement | Backend state | Coverage |
|---|---|---|---|
| NFR-01 | Map/timeline load within 3 seconds | Timeline endpoint exists but no benchmark. | Not verified |
| NFR-02 | Scale to 200+ packages without core refactor | Schema can represent many records; no load testing, queueing, or indexing review beyond basic indexes. | Not verified |
| NFR-03 | Simulation engine auto-restart and reconnecting state | Worker reconnects MQTT; Docker restart policy not configured; no frontend reconnect state. | Partially fulfilled for MQTT reconnect only |
| NFR-04 | Auth required except public tracking, HTTPS enforced | No auth/RBAC/HTTPS enforcement. | Not fulfilled |
| NFR-05 | Dashboard responsive | Frontend concern. | Not backend applicable |
| NFR-06 | Modular architecture and swappable simulation/IoT source | Backend modules are separated into schemas, processors, queries, MQTT, commands, realtime. | Partially fulfilled |
| NFR-07 | Browser support | Frontend verification needed. | Not backend applicable |

---

## 13. Device Technical Documentation Coverage

| Device doc area | Current backend status |
|---|---|
| Device-centric tracking model | Partially implemented. Packages inherit mobile device GPS after scan attaches them. |
| Fixed device simulator | Not implemented. |
| Mobile device MQTT telemetry | Implemented for `logistics/mobile/+/telemetry`. |
| Mobile device MQTT scan | Implemented for `logistics/mobile/+/scan`, limited contexts. |
| Mobile device MQTT heartbeat | Implemented for `logistics/mobile/+/heartbeat`. |
| Remote commands | Implemented outbound publish for four commands. Round-trip/ack not implemented. |
| Raw event audit | Implemented. |
| Unknown EPC quarantine | Implemented. |
| Backend duplicate suppression | Only event ID duplicate guard exists; time-window dedup not implemented. |
| Package location resolver | Partially implemented for mobile inherited GPS; fixed-device stamping not implemented. |
| Geofence evaluator | Not implemented. |
| ETA recalculation | Not implemented. |
| Device offline lifecycle | Partially implemented for stale heartbeat >90s. |
| Broker ACL | Not implemented; anonymous local broker config. |
| Docker Compose target architecture | Not implemented; only broker service exists. |

---

## 14. Planning Gaps

Backend areas needing design before implementation:

1. **Authentication and authorization**
   - Define JWT/session strategy for Next.js route handlers.
   - Add login route and password verification.
   - Add middleware/helper to enforce operator and warehouse scope.
   - Decide public tracking endpoint contract and rate limits.

2. **Package CRUD and search**
   - Add package list API with filters.
   - Add create package API with auto-generated tracking ID and RFID EPC assignment.
   - Add update/status override API with audit event creation.
   - Add sender/recipient/origin/destination validation.

3. **Route and geofence model**
   - Add route and waypoint schema.
   - Add geofence polygon schema.
   - Decide whether to use PostGIS now or defer to app-level geometry for MVP.
   - Implement geofence breach detection and alert creation.

4. **Alert engine**
   - Implement alert triggers for geofence breach, delay, delivered, exception, unknown EPC, device offline, and wrong facility.
   - Define target role/user/facility scoping.
   - Add alert list/read/ack/dismiss APIs.
   - Add email stub logging behavior.

5. **Fixed device support**
   - Add fixed topic parser and schemas.
   - Add fixed scan/heartbeat processors.
   - Implement fixed-device package location stamping.

6. **Full scan context support**
   - Expand scan schema to all contexts from device doc.
   - Implement status mapping for arrival, hub transfer, out for delivery, delivered, exception.
   - Add transition rules and invalid transition handling.

7. **Realtime architecture**
   - Decide whether to keep SSE snapshots for MVP or implement WebSocket events.
   - Add role-scoped realtime subscriptions.
   - Avoid full-snapshot fanout if package volume grows.

8. **Deployment**
   - Add PostgreSQL service to Docker Compose or document external DB dependency.
   - Add backend worker service and restart policy.
   - Add broker persistence and ACL/password config for non-local use.
   - Add health checks.

9. **Verification and load testing**
   - Add unit tests for schemas/processors.
   - Add integration test with MQTT broker and test database.
   - Add load test for 10-50 packages/devices and 2-second dashboard refresh.

---

## 15. Recommended Backend Roadmap

### Phase B1 - Secure API Foundation

- Implement login route and JWT session issuing.
- Add auth helper for route handlers.
- Enforce operator/warehouse access on device, raw event, command, and package APIs.
- Split public tracking response from internal package timeline response.

### Phase B2 - Package API Completion

- Add package list/search/filter API.
- Add package create API with tracking ID/RFID EPC generation.
- Add status override API that creates `PackageEvent` audit rows.
- Add package weight/dimensions and origin/destination fields or related models.

### Phase B3 - Scan Context and Fixed Device Support

- Expand scan schema to all device-doc contexts.
- Add fixed topic support.
- Implement fixed-device scan processor.
- Implement backend time-window duplicate suppression.

### Phase B4 - Geofence, Route, ETA

- Add route/waypoint/geofence models.
- Add route assignment on package creation.
- Implement mobile telemetry ETA recalculation.
- Implement geofence evaluator and breach state.

### Phase B5 - Alert Engine

- Create alerts from processors and scheduled detectors.
- Add alert APIs for list/read/ack/dismiss.
- Add role/facility/customer filtering.
- Add email stub logging.

### Phase B6 - Realtime and Deployment Hardening

- Decide SSE vs WebSocket and document final transport.
- Add role-scoped event streams.
- Add PostgreSQL, worker, and broker services to Compose.
- Add broker auth/ACL for device topics.
- Add integration tests and operational runbook.

---

## 16. Current Backend Completion Snapshot

| Product/backend area | Status |
|---|---|
| Database schema | Implemented partial foundation |
| Prisma migrations | Implemented for current schema |
| Development seed | Implemented |
| Health endpoint | Implemented |
| Device list/detail API | Implemented |
| Raw event API | Implemented |
| Package timeline API | Implemented partial |
| Realtime SSE snapshot | Implemented partial |
| MQTT mobile telemetry ingestion | Implemented |
| MQTT mobile scan ingestion | Implemented partial |
| MQTT mobile heartbeat ingestion | Implemented |
| Unknown scan quarantine | Implemented |
| Offline detector | Implemented partial |
| Mobile command publish | Implemented partial |
| Auth/JWT/session | Not started |
| RBAC enforcement | Not started |
| Package CRUD/search | Not started |
| Alert engine/API | Not started |
| Geofence evaluator/API | Not started |
| Route/waypoint simulation | Not started |
| Fixed device ingestion | Not started |
| Command acknowledgement | Not started |
| Email stub | Not started |
| Full Docker deployment | Not started |

---

## 17. Verification Commands

Current useful local commands:

```powershell
pnpm db:generate
pnpm db:migrate
pnpm db:seed -- --environment=development
pnpm broker:up
pnpm worker:dev
pnpm dev
pnpm lint
pnpm build
```

Backend readiness checks:

```text
GET /api/health
GET /api/devices
GET /api/devices/DEV-TRUCK-001
GET /api/packages/PKG-20260423-001/timeline
GET /api/internal/raw-events?limit=20
GET /api/realtime/stream
POST /api/devices/DEV-TRUCK-001/commands/force-scan
```

Expected local prerequisites:

- PostgreSQL database reachable through `DATABASE_URL`.
- Prisma client generated.
- Migrations applied.
- Development seed run.
- Mosquitto broker running for worker/command tests.
- Worker running for inbound MQTT ingestion.

---

## 18. Key Risks

- API routes are unauthenticated, including command publishing and internal raw event access.
- MQTT broker allows anonymous clients and has no ACL.
- Current command API can publish real device commands if MQTT env is configured.
- Timeline endpoint may expose internal device/facility data and should not become the public tracking endpoint without review.
- Current mobile scan schema is narrower than firmware/device architecture documentation.
- Missing fixed-device support means warehouse checkpoint architecture is incomplete.
- Alert and geofence models/logic are not implemented, so exception handling is not yet product-functional.
- Docker Compose does not represent the actual backend runtime topology.

---

## 19. Definition of Done for Backend MVP

Backend can be considered MVP-complete only when these are true:

- Auth login/JWT/session works for operator and warehouse users.
- Route handlers enforce RBAC and warehouse facility scope.
- Public tracking endpoint exposes only customer-safe package data.
- Package CRUD/search/filter/status override APIs exist.
- Package creation assigns route/RFID/tracking identity.
- Mobile and fixed MQTT scan/heartbeat paths are implemented.
- All scan contexts map to correct package status transitions.
- Telemetry updates package location, ETA, geofence state, and realtime output.
- Alert engine creates and stores alerts for PRD trigger types.
- Alert APIs support unread/read/ack/dismiss and role filtering.
- Realtime transport meets <=2 second refresh requirement for 10-50 active packages.
- Docker/runtime deployment includes broker, worker, database, and frontend/backend server with health checks.
- Tests cover schema validation, processors, route handlers, command publishing failure modes, and an MQTT ingestion integration path.

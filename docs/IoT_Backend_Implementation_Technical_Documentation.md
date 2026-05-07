# IoT Backend Implementation Technical Documentation

**Project:** Logistic Controls
**Document date:** May 7, 2026
**Source basis:** Current repository scan, `PRD_GPS_Logistic_Package_Tracking_MVP.md`, `IoT_Device_Implementation_Technical_Documentation.md`, and Next.js 16 local docs under `node_modules/next/dist/docs/`.
**Backend scope in this document:** Next.js route handlers, Prisma/PostgreSQL model, MQTT worker, ingestion processors, realtime SSE snapshot service, and backend requirement coverage.
**Research scope note:** This document follows `PRD_GPS_Logistic_Package_Tracking_MVP.md` v2.0 research scope.

---

## 1. Executive Summary

The backend implements the research prototype control plane for mobile device telemetry, RFID scan events, heartbeats, raw MQTT event persistence, device offline detection, package timeline lookup, and mobile device command publishing.

The current backend is best described as a **research-usable IoT ingestion backend** for proving the core data path:

```text
RFID/GPS device event -> MQTT -> backend worker -> PostgreSQL/Prisma -> API/dashboard
```

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

Current backend gaps for research completion:

- Final integrated test evidence still needs to be collected from worker logs, APIs, and dashboard observation.
- Scan processing currently supports only `pickup` and `in_transit`.
- Backend time-window duplicate suppression is not implemented; firmware cooldown is the primary duplicate guard.
- Command publish exists, but command round-trip and acknowledgement are not verified.
- Docker Compose includes Mosquitto only; PostgreSQL is an external/local prerequisite.
- MQTT broker is configured with anonymous access and no ACL, suitable only for local research testing.
- Authentication, RBAC, geofence, alert center, ETA, route optimization, public tracking, and production hardening are out of scope for PRD v2.0 and are not backend MVP blockers.

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
| `Package` | Package identity, RFID EPC, status, current location/device/facility. | Seeded; updated by scan/telemetry processors. Internal CRUD/search/status override is in scope but not implemented yet. |
| `PackageEvent` | Timeline/status event history. | Created by scan processor. Queried by timeline API and realtime snapshot. |
| `DeviceTelemetry` | GPS telemetry history. | Created by telemetry processor with duplicate guard by device and sequence number. |
| `DeviceHeartbeat` | Device heartbeat history. | Created by heartbeat processor. |
| `Alert` | Alert storage. | Schema exists only; no alert creation/ack API implemented. |
| `DeviceCommand` | Outbound command history. | Created and status-updated by command publisher. |
| `RawMqttEvent` | Raw event audit log. | Created for inbound MQTT messages and published commands. |
| `UnknownScan` | Quarantine for scan events whose EPC does not match a package. | Created/upserted by scan processor. |

### 4.3 Deferred Product Models

The current schema is broader than the active research scope. These areas are not required for PRD v2.0 completion, but remain useful future-work references.

| Deferred model/field area | Future use |
|---|---|
| Geofence polygon model | Future geofence detection. |
| Route and waypoint models | Future route assignment and ETA work. |
| Driver/carrier assignment model | Future operational user/device assignment. |
| Package dimensions fields | Optional future metadata expansion for package CRUD beyond current sender/recipient/address fields. |
| Origin/destination structured models | Future shipment management. |
| Alert recipient/read records | Future alert center. |
| Command acknowledgement event model | Future device command ack workflow. |

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

Planned or out-of-scope API gaps:

- No `/api/auth/login` or logout/session route; auth/RBAC is out of PRD v2.0 research scope.
- Planned package CRUD/search/status override routes are in scope but not implemented yet:
  - `GET /api/packages`
  - `POST /api/packages`
  - `GET /api/packages/{trackingId}`
  - `PATCH /api/packages/{trackingId}`
  - `DELETE /api/packages/{trackingId}` or a soft-delete/archive equivalent if safer for research evidence.
- No alert list/ack/dismiss routes; alerts are future work.
- No geofence CRUD/evaluation route; geofence is future work.
- No facility CRUD route; one seeded facility is enough for current research.
- No route/waypoint route; route optimization and ETA are out of scope.
- No public tracking route; package timeline API is internal/research evidence only.
- No RBAC middleware or request user resolution; APIs are local research endpoints.

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
- ETA calculation is out of PRD v2.0 scope.
- Geofence evaluation is out of PRD v2.0 scope.
- Alert creation is out of PRD v2.0 scope.
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

Not included in the active PRD v2.0 research Compose setup:

- backend API service
- frontend service
- PostgreSQL service
- fixed-device simulator
- mobile-device simulator

PostgreSQL remains an external/local prerequisite through `DATABASE_URL`. The backend API and worker run through local `pnpm` scripts during research verification.

---

## 11. PRD v2 Functional Requirement Coverage - Backend

### 11.1 IoT Device and MQTT Ingestion

| ID | Backend state | Coverage |
|---|---|---|
| FR-IOT-01 | Backend expects device-side ESP32/Wokwi simulation; simulation execution is firmware/tooling concern. | Not backend-owned |
| FR-IOT-02 | Mobile telemetry payload accepts GPS fix state, coordinates, and timestamp fields. | Implemented backend ingestion |
| FR-IOT-03 | Scan payload accepts deterministic RFID EPC values from the simulated device. | Implemented backend ingestion |
| FR-IOT-04 | Worker subscribes to mobile telemetry, scan, and heartbeat MQTT topics. | Implemented |
| FR-IOT-05 | Command publisher supports optional mobile commands for demonstration. | Partial; round-trip not verified |
| FR-MQTT-01 | Mosquitto service is configured for local research communication. | Implemented local broker |
| FR-MQTT-02 | Worker subscribes to `logistics/mobile/+/telemetry`, `scan`, and `heartbeat`. | Implemented |
| FR-MQTT-03 | Supported inbound MQTT payloads are persisted as `RawMqttEvent`. | Implemented |
| FR-MQTT-04 | Payload parsing and schema validation reject invalid messages without normal worker shutdown. | Implemented design; final evidence needed |
| FR-MQTT-05 | Backend can publish mobile command messages to device command topics. | Optional/partial |

### 11.2 Backend Data Processing

| ID | Backend state | Coverage |
|---|---|---|
| FR-BE-01 | Zod schemas validate telemetry, scan, heartbeat, and command payloads. | Implemented |
| FR-BE-02 | Telemetry and heartbeat processors update device state and store history rows. | Implemented |
| FR-BE-03 | Scan processor resolves known RFID EPC to package records. | Implemented; needs final known-scan evidence |
| FR-BE-04 | Valid scan events create `PackageEvent` rows. | Implemented for supported contexts |
| FR-BE-05 | Package status/current location can update from scan and later mobile telemetry. | Partial; mobile inherited GPS path implemented |
| FR-BE-06 | Unknown RFID EPC values are stored in `UnknownScan`. | Implemented |
| FR-BE-07 | Offline detector marks stale devices offline after heartbeat timeout. | Implemented; needs final evidence |

### 11.3 Dashboard/API Support

| ID | Backend state | Coverage |
|---|---|---|
| FR-UI-01 | `/api/devices` and `/api/devices/:deviceId` expose device state. | Implemented |
| FR-UI-02 | `/api/internal/raw-events` exposes recent raw MQTT event feed for research observation. | Implemented |
| FR-UI-03 | `/api/realtime/stream` emits SSE snapshots for dashboard refresh without manual reload. | Partial; polling snapshot, not WebSocket |
| FR-UI-04 | `/api/packages/:trackingId/timeline` exposes package timeline for verification. | Implemented API |
| FR-UI-05 | Device command API exists for optional demonstration commands. | Optional/partial |

### 11.4 Package Management

| ID | Backend state | Coverage |
|---|---|---|
| FR-PKG-01 | `Package` model and seed data exist; no package list/detail CRUD route beyond timeline yet. | In scope, pending API |
| FR-PKG-02 | No package creation API yet; planned route is `POST /api/packages`. | In scope, pending API |
| FR-PKG-03 | No metadata/status/RFID/facility/device assignment update route yet; planned route is `PATCH /api/packages/{trackingId}`. | In scope, pending API |
| FR-PKG-04 | No delete/archive route yet; planned route is `DELETE /api/packages/{trackingId}` or archive equivalent. | In scope, pending API |
| FR-PKG-05 | Package CRUD remains internal/research-facing; customer portal, RBAC, route/ETA, and production shipment workflow are excluded from package CRUD scope. | Documented boundary |

### 11.5 Testing and Evidence

| ID | Backend state | Coverage |
|---|---|---|
| FR-TEST-01 | Firmware scenarios exist; backend needs final integrated run evidence. | Pending evidence |
| FR-TEST-02 | Raw events, device APIs, package timeline API, and worker logs can provide evidence. | Evidence paths ready |
| FR-TEST-03 | Research documentation tracks implemented, partial, and out-of-scope areas. | Implemented in docs |

---

## 12. Non-Functional Requirement Coverage - Backend

| ID | Requirement | Backend state | Coverage |
|---|---|---|---|
| NFR-01 | Prioritize clear data flow over feature breadth | Backend focuses on MQTT ingestion, persistence, and verification APIs. | Implemented direction |
| NFR-02 | Raw events and logs inspectable | `RawMqttEvent`, worker logs, and raw event API support audit evidence. | Implemented |
| NFR-03 | Modular backend | Config, MQTT, schemas, processors, queries, commands, and realtime modules are separated. | Implemented |
| NFR-04 | Worker handles invalid payloads/reconnect attempts | Validation and MQTT reconnect behavior exist; final fault evidence still needed. | Partial |
| NFR-05 | Dashboard/realtime feed around 5 seconds during local tests | SSE polls watermarks every 2 seconds; final UI evidence needed. | Partial |
| NFR-06 | Document security limitations | Anonymous broker and unauthenticated APIs are documented as research limitations. | Implemented |
| NFR-07 | Scalability beyond prototype out of scope | No large-scale load testing planned for PRD v2.0. | Deferred |

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
| Geofence evaluator | Out of PRD v2.0 scope. |
| ETA recalculation | Out of PRD v2.0 scope. |
| Device offline lifecycle | Partially implemented for stale heartbeat >90s. |
| Broker ACL | Out of implementation scope; anonymous local broker config is documented limitation. |
| Docker Compose target architecture | Research setup uses local scripts plus Mosquitto service; DB is external/local. |

---

## 14. Research Completion Gaps

Backend areas needed before final research report evidence:

1. **Final integrated run evidence**
   - Capture worker startup log.
   - Capture raw event API output after device scenario.
   - Capture device detail API output after telemetry/heartbeat.

2. **Known package scan proof**
   - Run or replay known EPC scan scenario.
   - Verify package event creation.
   - Verify `/api/packages/{trackingId}/timeline` response.

3. **Telemetry and heartbeat proof**
   - Verify telemetry history and latest device GPS fields.
   - Verify heartbeat history and online state.
   - Optionally stop heartbeat long enough to prove offline detector.

4. **Unknown scan proof**
   - Send or simulate unregistered EPC.
   - Verify `UnknownScan` record and no package status update.

5. **Optional command proof**
   - POST force-scan or configuration command.
   - Verify `DeviceCommand`, outbound raw cmd event, and MQTT publish result.

6. **Documented limitations**
   - Record limited scan contexts, no backend time-window duplicate guard, local anonymous MQTT, external DB, and no production auth/hardening.

---

## 15. Recommended Backend Research Roadmap

### Phase B1 - Evidence Baseline

- Run database migration/seed, broker, worker, and Next.js app.
- Record worker startup and health check outputs.
- Collect raw event API and device API snapshots.

### Phase B2 - Package Tracking Proof

- Verify known RFID scan creates package event.
- Verify package status/location through timeline API.
- Capture unknown RFID quarantine evidence.

### Phase B3 - Liveness and Realtime Proof

- Verify heartbeat and telemetry persistence.
- Verify stale heartbeat offline behavior if time allows.
- Verify SSE snapshot changes are visible to `/simcon`.

### Phase B4 - Optional Command Proof

- Verify command API publish path.
- Document command ack/round-trip as unverified unless device receipt evidence is collected.

### Phase B5 - Final Documentation

- Insert evidence into research report materials.
- Keep auth, RBAC, geofence, alerts, ETA, route optimization, public tracking, and production security as future work.

---

## 16. Current Backend Completion Snapshot

| Research backend area | Status |
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
| Final integrated evidence | Pending |
| Known package timeline evidence | Pending |
| Telemetry/heartbeat API evidence | Pending |
| Dashboard evidence | Pending |
| Command round-trip evidence | Optional/pending |
| Auth/JWT/session | Out of scope |
| RBAC enforcement | Out of scope |
| Package CRUD/search/status override | In scope, pending implementation |
| Alert engine/API | Out of scope |
| Geofence evaluator/API | Out of scope |
| Route/waypoint simulation | Out of scope |
| Fixed device ingestion | Not started |
| Command acknowledgement | Not started |
| Email stub | Out of scope |
| Full Docker deployment | Out of scope |

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

- API routes are unauthenticated, including command publishing and internal raw event access; acceptable only for local research.
- MQTT broker allows anonymous clients and has no ACL; production broker security is future work.
- Current command API can publish device commands if MQTT env is configured; use only in controlled tests.
- Timeline endpoint may expose internal device/facility data and should not be treated as public tracking.
- Current mobile scan schema is narrower than firmware/device architecture documentation.
- Backend time-window duplicate suppression is missing; firmware cooldown remains primary duplicate guard.
- Docker Compose includes only Mosquitto; database and app processes must be started separately.
- Final integrated evidence is still pending, so report conclusions must not overclaim verified behavior.

---

## 19. Definition of Done for Backend Research Scope

Backend can be considered research-complete when these are true:

- Worker connects to PostgreSQL and Mosquitto.
- At least one heartbeat is stored and device state becomes online.
- At least one GPS telemetry event is stored and latest device position updates.
- At least one known RFID scan creates a package event and updates package timeline/status.
- At least one unknown RFID scan is quarantined without package update.
- Raw MQTT event API shows recent telemetry, scan, and heartbeat evidence.
- Package timeline API returns scan-derived event data for a known tracking ID.
- `/simcon` or SSE snapshot can observe device/event changes, or limitation is documented.
- Optional command publish path is tested or documented as unverified.
- Limitations clearly state simulation-only device, local anonymous MQTT, unauthenticated APIs, limited scan contexts, no production hardening, and no large-scale testing.

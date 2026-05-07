# IoT System Research Documentation
## Logistic Controls: RFID + GPS Package Tracking Prototype

**Document date:** May 7, 2026  
**Source draft:** `docs/Laporan Proyek IoT Logistic Controls.docx`  
**Scope reference:** `docs/PRD_GPS_Logistic_Package_Tracking_MVP.md` version 2.0 research prototype boundary  
**Purpose:** Track research report content, implementation progress, testing evidence, and remaining work.

---

## 1. Research Summary

This research develops a limited IoT prototype for logistics package tracking. The prototype uses a simulated ESP32 mobile device with GPS and RFID scan behavior. RFID identifies package tags, GPS represents device/package location, MQTT transports events, backend services validate and store data, and a simple dashboard/API displays progress.

The project is intentionally bounded as a research prototype, not a full commercial logistics platform. The core proof is the data flow:

```text
RFID + GPS device event
  -> MQTT broker
  -> backend worker
  -> database
  -> API/dashboard verification
```

---

## 2. Draft Report Mapping

The DOCX draft contains these main report chapters. This markdown file tracks what each chapter should contain and current completion state.

| Draft chapter | Intended content | Current status |
|---|---|---|
| Abstrak | Brief problem, method, prototype, testing result, conclusion. | Not written; draft still placeholder. |
| Pendahuluan | Background, problem, objectives, benefits, boundaries. | Needs rewrite using simplified research scope. |
| Tinjauan Pustaka | IoT, RFID, GPS, MQTT, ESP32/Wokwi, related logistics tracking research. | Needs literature content and citations. |
| Metodologi Penelitian | Prototype method, system design, tools, test scenarios. | Partially defined through PRD and tech docs. |
| Analisis Kebutuhan Sistem | Hardware/software requirements. | Needs final tables filled. |
| Perancangan Sistem | Architecture, data flow, communication topics, database overview. | Partially available in docs/code. |
| Flowchart Sistem | Device and backend process flow. | Not drawn in DOCX yet. |
| Skenario Implementasi | Wokwi/device scenario and backend/dashboard run steps. | Partially available from firmware docs. |
| Metode Pengujian | Heartbeat, telemetry, scan, unknown scan, duplicate, command test. | Needs formal test table. |
| Hasil dan Pembahasan | Implementation screenshots/logs/API results and analysis. | Not finalized. |
| Kesimpulan dan Saran | Summary and future work. | Not written. |
| Daftar Pustaka | References. | Empty. |
| Lampiran | Logs, screenshots, config snippets. | Not collected in final form. |

---

## 3. Research Boundaries

### 3.1 In Scope

- ESP32/Wokwi simulated mobile IoT device.
- GPS telemetry publishing.
- RFID scan event publishing.
- MQTT communication through local Mosquitto broker.
- Backend worker ingestion and schema validation.
- PostgreSQL/Prisma persistence.
- Device state, raw MQTT event, package event, heartbeat, telemetry, unknown scan records.
- Package timeline API for verification.
- Simple SimCon dashboard for device/event observation.
- Scenario-based test evidence.

### 3.2 Out of Scope

- Customer tracking portal.
- Operator/warehouse/customer RBAC.
- Interactive package map.
- Geofence detection.
- Alert notification center.
- Email notification.
- Full package CRUD.
- ETA and route optimization.
- Large fleet simulation.
- Multi-tenant deployment.
- Production security hardening.
- Real hardware procurement.

---

## 4. Current Implementation Snapshot

| Area | Implemented | Evidence/source | Notes |
|---|---:|---|---|
| ESP32 firmware modular structure | Yes | Device tech doc + firmware source | Mobile device focus. |
| Wokwi GPS + PN532 simulation | Yes | Device tech doc scenarios | Simulated cards `DEADBEEF`, `CAFEBABE`. |
| Firmware telemetry publish | Yes | Device tech doc | GPS telemetry interval around 5s. |
| Firmware scan publish | Yes | Device tech doc | Pickup/duplicate/delivery scenario evidence exists. |
| Firmware heartbeat publish | Yes | Device tech doc | Used by backend liveness. |
| Firmware remote command handlers | Yes | Device tech doc | Round-trip from backend not fully verified. |
| MQTT broker config | Yes | `docker-compose.yml`, `infra/mosquitto/mosquitto.conf` | Local anonymous broker only. |
| Backend worker | Yes | `scripts/backend-worker.ts` | Subscribes mobile topics. |
| MQTT raw event persistence | Yes | `lib/backend/processors/raw-events.ts` | Stores raw event audit. |
| Telemetry processor | Yes | `lib/backend/processors/telemetry.ts` | Updates device and attached package GPS. |
| Scan processor | Partial | `lib/backend/processors/scan.ts` | Supports `pickup` and `in_transit` only. |
| Heartbeat processor | Yes | `lib/backend/processors/heartbeat.ts` | Stores heartbeat and updates device. |
| Unknown scan quarantine | Yes | `UnknownScan` model + scan processor | Useful for failure analysis. |
| Offline detector | Yes | `lib/backend/processors/offline-detector.ts` | Marks stale heartbeat devices offline. |
| Prisma schema | Yes | `prisma/schema.prisma` | Research-ready, broader than current UI. |
| Development seed | Yes | `prisma/seed.ts` | Creates facility, users, device, packages. |
| Device API | Yes | `/api/devices`, `/api/devices/:deviceId` | No auth. |
| Package timeline API | Yes | `/api/packages/:trackingId/timeline` | Internal/research use. |
| Raw event API | Yes | `/api/internal/raw-events` | No auth; research only. |
| Realtime dashboard stream | Partial | `/api/realtime/stream` | SSE polling snapshots, not WebSocket. |
| SimCon dashboard | Yes | `app/simcon/page.tsx`, `components/simcon/` | Device/event/command oriented. |
| Full logistics product UI | No | N/A | Out of scope for research. |

---

## 5. Functional Progress Checklist

### 5.1 Device and MQTT

| ID | Task | Status | Evidence needed |
|---|---|---|---|
| IOT-01 | Simulated ESP32 device boots in Wokwi. | Done | Build output / Wokwi log. |
| IOT-02 | GPS telemetry emitted with lat/lng and timestamp. | Done | Serial JSONL + MQTT raw event. |
| IOT-03 | RFID scan emits known package EPC. | Done | Scenario log + raw scan event. |
| IOT-04 | Duplicate scan cooldown works. | Done firmware-side | Duplicate scenario analyzer output. |
| IOT-05 | Heartbeat event emitted. | Done | Raw heartbeat event. |
| IOT-06 | Command subscription exists on device. | Done firmware-side | Need backend round-trip proof. |
| IOT-07 | Backend publishes command to device topic. | Partial | API response + MQTT/device receipt log. |

### 5.2 Backend

| ID | Task | Status | Evidence needed |
|---|---|---|---|
| BE-01 | Database schema represents device/package/event records. | Done | Prisma schema + migration. |
| BE-02 | Worker connects to DB and broker. | Done | Worker startup log. |
| BE-03 | Worker persists raw telemetry/scan/heartbeat events. | Done | `/api/internal/raw-events`. |
| BE-04 | Telemetry updates device state. | Done | `/api/devices/:deviceId`. |
| BE-05 | Scan resolves known RFID EPC to package. | Partial | Package timeline response. |
| BE-06 | Unknown RFID scan is quarantined. | Done | `UnknownScan` record / terminal error line. |
| BE-07 | Device offline timeout works. | Partial | Need test evidence after heartbeat stop. |
| BE-08 | Backend duplicate scan dedup beyond event ID. | Not started | Future work; firmware cooldown currently primary. |
| BE-09 | Full scan contexts (`delivered`, `exception`, etc.) handled. | Not started | Simplify or implement only if needed for report. |

### 5.3 Frontend / Dashboard

| ID | Task | Status | Evidence needed |
|---|---|---|---|
| UI-01 | `/simcon` loads DB-backed snapshot. | Done | Screenshot. |
| UI-02 | Device table displays current device state. | Done | Screenshot. |
| UI-03 | Terminal feed displays MQTT/raw events. | Done | Screenshot after scenario run. |
| UI-04 | SSE updates dashboard without full reload. | Partial | Screen recording or before/after evidence. |
| UI-05 | Command panel posts mobile commands. | Partial | API success + command raw event. |
| UI-06 | Package timeline visible in UI. | Not started | API exists; UI not needed if report uses API evidence. |
| UI-07 | Live map. | Out of scope | N/A. |

### 5.4 Research Report

| ID | Task | Status | Notes |
|---|---|---|---|
| DOC-01 | Replace placeholder abstract. | Pending | Use final result after tests. |
| DOC-02 | Rewrite background for logistics tracking. | Pending | Use PRD section 2 and research objective. |
| DOC-03 | Fill rumusan masalah and tujuan. | Pending | Align with core IoT data flow. |
| DOC-04 | Fill batasan masalah. | Ready source | Use simplified PRD boundaries. |
| DOC-05 | Fill hardware/software tables. | Pending | Use ESP32, GPS, PN532/RFID, Wokwi, MQTT, Next.js, Prisma, PostgreSQL. |
| DOC-06 | Add architecture diagram. | Pending | Use simplified architecture from PRD. |
| DOC-07 | Add flowchart. | Pending | Device publish + backend ingest + dashboard flow. |
| DOC-08 | Add testing table. | Pending | Use section 7 in this doc. |
| DOC-09 | Add screenshots/log excerpts. | Pending | Collect after final test run. |
| DOC-10 | Add conclusion/suggestions. | Pending | Write after results fixed. |

---

## 6. Research Questions and Objectives

### 6.1 Rumusan Masalah Draft

1. Bagaimana merancang prototipe sistem pelacakan paket logistik berbasis IoT menggunakan RFID, GPS, dan MQTT?
2. Bagaimana mengimplementasikan pengiriman data telemetry, heartbeat, dan scan RFID dari perangkat IoT ke backend?
3. Bagaimana backend memvalidasi, menyimpan, dan menampilkan data pelacakan paket secara sederhana?
4. Bagaimana hasil pengujian prototipe berdasarkan keberhasilan pengiriman data, penyimpanan event, dan pembaruan status paket?

### 6.2 Tujuan Penelitian Draft

1. Merancang arsitektur prototipe pelacakan paket logistik berbasis IoT.
2. Mengimplementasikan simulasi perangkat ESP32 dengan GPS dan RFID.
3. Mengimplementasikan backend MQTT ingestion dan penyimpanan data pelacakan.
4. Menyediakan dashboard/API sederhana untuk observasi device, raw event, dan package timeline.
5. Menguji prototipe menggunakan skenario telemetry, scan RFID, unknown scan, dan heartbeat.

---

## 7. Testing Plan

| No | Scenario | Input/action | Expected result | Status |
|---|---|---|---|---|
| 1 | Device boot and heartbeat | Run Wokwi/device simulation and backend worker. | Heartbeat stored; device online. | Needs final evidence |
| 2 | GPS telemetry | Device publishes telemetry. | Raw telemetry stored; device last position updated. | Needs final evidence |
| 3 | Known package pickup | Simulate known RFID card scan with pickup context. | Package event created; package status changes. | Needs final evidence |
| 4 | Unknown RFID scan | Simulate unregistered RFID card. | Unknown scan stored; package not updated. | Needs final evidence |
| 5 | Duplicate scan cooldown | Repeat same package scan in cooldown window. | Duplicate suppressed or no duplicate timeline event. | Needs final evidence |
| 6 | Package timeline API | Call `/api/packages/{trackingId}/timeline`. | Timeline returns event list with status/location. | Needs final evidence |
| 7 | Dashboard realtime feed | Open `/simcon`, run scenario. | Device/event feed changes within local refresh interval. | Needs final evidence |
| 8 | Remote force scan command | POST force scan command from UI/API. | Command record and MQTT cmd raw event created. | Optional evidence |

---

## 8. Evidence Collection Checklist

Use this section before final report writing.

| Evidence | File/source | Collected |
|---|---|---|
| PlatformIO build output | Terminal output / log file | No |
| Wokwi scenario log: pickup | `logs/` | Not confirmed this round |
| Wokwi scenario log: duplicate cooldown | `logs/` | Not confirmed this round |
| Wokwi scenario log: delivery/status | `logs/` | Not confirmed this round |
| Backend worker startup log | Terminal output | No |
| Raw MQTT events API response | `/api/internal/raw-events?limit=20` | No |
| Device detail API response | `/api/devices/{deviceId}` | No |
| Package timeline API response | `/api/packages/{trackingId}/timeline` | No |
| Dashboard screenshot | `/simcon` | No |
| Command publish result | API/UI response | Optional |
| Final limitations list | Report chapter | Pending |

---

## 9. Hardware and Software Tables for Report

### 9.1 Hardware / Simulated Components

| No | Component | Module | Function | Research status |
|---|---|---|---|---|
| 1 | ESP32 | Wokwi ESP32 | Main IoT controller. | Implemented in simulation |
| 2 | GPS module | Custom NEO-6M-style Wokwi chip | Provides simulated latitude/longitude. | Implemented |
| 3 | RFID reader | Custom PN532-style Wokwi chip | Reads simulated package tags. | Implemented |
| 4 | RFID tag/package | Simulated UID/EPC | Package identity. | Implemented for test tags |
| 5 | LED indicators | Wokwi LEDs | Shows WiFi/MQTT/RFID/GPS state. | Implemented firmware-side |

### 9.2 Software

| No | Software | Function | Research status |
|---|---|---|---|
| 1 | Wokwi | ESP32 and sensor simulation. | Used |
| 2 | PlatformIO | Firmware build. | Used |
| 3 | Mosquitto | Local MQTT broker. | Configured |
| 4 | Next.js | API routes and dashboard UI. | Implemented partial |
| 5 | Prisma | Database schema and ORM. | Implemented |
| 6 | PostgreSQL | Event/device/package persistence. | Required runtime |
| 7 | Zod | Payload schema validation. | Implemented |
| 8 | MQTT.js | Backend MQTT subscriber/publisher. | Implemented |

---

## 10. Simplified System Flow

### 10.1 Device Flow

```text
Start device
  -> connect WiFi/MQTT
  -> publish heartbeat
  -> read GPS data
  -> publish telemetry
  -> detect RFID tag
  -> map UID to package EPC
  -> publish scan event
```

### 10.2 Backend Flow

```text
Receive MQTT topic
  -> parse topic
  -> parse JSON
  -> persist raw event
  -> validate schema
  -> process telemetry / scan / heartbeat
  -> update database state
  -> expose API/SSE snapshot
```

### 10.3 Dashboard Flow

```text
Open /simcon
  -> fetch initial snapshot from database
  -> subscribe to SSE stream
  -> display device table and event feed
  -> optional command POST to backend
```

---

## 11. Known Limitations for Report

- Prototype uses simulation, not physical deployment.
- MQTT broker is local and anonymous; production security is not implemented.
- Backend API has no authentication because RBAC is out of research scope.
- Scan processing currently supports limited contexts.
- Dashboard is device/event oriented, not full customer package tracking UI.
- Interactive map, geofence, alerts, and ETA are intentionally removed from scope.
- Performance and scalability are not tested beyond local prototype scale.
- Database service is not fully represented in current Docker Compose.

---

## 12. Next Work Items

| Priority | Work item | Target output |
|---|---|---|
| High | Run final firmware/backend/dashboard scenario tests. | Logs + API responses + screenshots. |
| High | Fill DOCX Pendahuluan using research scope. | Rewritten background/objectives/boundaries. |
| High | Fill hardware/software tables in DOCX. | Complete report tables. |
| High | Add architecture and flowchart visuals. | Diagram images or rendered tables. |
| Medium | Verify package timeline API with known EPC. | Evidence snippet. |
| Medium | Verify dashboard SSE update behavior. | Screenshot/short description. |
| Medium | Decide whether delivery context must be implemented or documented as limitation. | Clear report statement. |
| Low | Add optional command round-trip evidence. | Optional demo evidence. |

---

## 13. Report Writing Notes

Recommended wording direction:

- Use term **prototipe penelitian** instead of MVP product.
- Use **simulasi perangkat IoT** instead of production deployment.
- Use **observasi dashboard/API** instead of customer-facing tracking platform.
- Treat security, RBAC, geofence, alerts, ETA, and live map as **saran pengembangan**, not failed requirements.
- Emphasize core contribution: integration of RFID identification, GPS telemetry, MQTT transport, backend persistence, and dashboard monitoring.

---

## 14. Progress Status Summary

| Category | Status |
|---|---|
| Research scope clarified | Done |
| PRD simplified for research boundaries | Done |
| Draft DOCX reviewed | Done |
| Firmware implementation | Mostly done, based on existing tech doc |
| Backend ingestion | Partial but research-usable |
| Frontend dashboard | Partial but research-usable |
| Final integrated test evidence | Pending |
| Final report content | Pending |

---

## 15. Final Definition of Research Completion

Research project is ready for final report when:

1. Scope boundaries are reflected in PRD and report.
2. At least one known package scan is captured from device simulation to database.
3. At least one telemetry and heartbeat event is stored and visible through API/dashboard.
4. Package timeline shows scan-derived status evidence.
5. Test evidence is collected and inserted into report.
6. Limitations and future work clearly state what was intentionally not implemented.

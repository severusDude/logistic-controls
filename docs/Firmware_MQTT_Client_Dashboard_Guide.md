# Firmware MQTT Client Guide

## Mobile Device Firmware for Web Dashboard

**Project:** GPS-Based Logistic Package Tracking System  
**Firmware target:** ESP32 mobile device  
**Dashboard target:** Web app consuming MQTT events from the firmware  
**Related docs:** [PRD_GPS_Logistic_Package_Tracking_MVP.md](./PRD_GPS_Logistic_Package_Tracking_MVP.md), [TechDoc_GPS_IoT_Logistic_Tracking_v2.md](./TechDoc_GPS_IoT_Logistic_Tracking_v2.md)

---

## 1. Purpose

Firmware acts as the MQTT client for the mobile logistics device. It publishes live GPS telemetry, RFID scan events, and heartbeat status, then listens for remote commands from the dashboard or backend.

Dashboard use:

- live vehicle position
- package scan timeline
- online/offline status
- role and facility updates
- remote scan and reboot commands

This guide documents the current firmware contract in `src/main.cpp`.

---

## 2. Firmware Responsibilities

The mobile device firmware does the following:

- connects to WiFi
- connects to MQTT broker
- reads GPS from NEO-6M
- reads RFID tags from PN532
- publishes telemetry every 5 seconds
- publishes heartbeat every 60 seconds
- publishes RFID scan events on tag detection
- subscribes to command topic
- buffers events when MQTT is unavailable

The design follows the device-centric architecture in the technical doc. The device is the source of truth for its own GPS position and scan events.

---

## 3. MQTT Topic Map

Current topic pattern:

- `logistics/mobile/{device_id}/telemetry`
- `logistics/mobile/{device_id}/scan`
- `logistics/mobile/{device_id}/heartbeat`
- `logistics/mobile/{device_id}/cmd`

For the default firmware build:

- `device_id = DEV-TRUCK-001`

Example topics:

- `logistics/mobile/DEV-TRUCK-001/telemetry`
- `logistics/mobile/DEV-TRUCK-001/scan`
- `logistics/mobile/DEV-TRUCK-001/heartbeat`
- `logistics/mobile/DEV-TRUCK-001/cmd`

Topic ownership is per device. The dashboard should subscribe through the backend or a broker bridge, not by using broad wildcard access in production.

---

## 4. Publish Cadence

| Topic       | Purpose                   | QoS | Retain | Cadence                        |
| ----------- | ------------------------- | --: | -----: | ------------------------------ |
| `telemetry` | Live GPS and device state |   1 |    yes | every 5 s                      |
| `scan`      | RFID package detection    |   2 |     no | event-driven                   |
| `heartbeat` | Online status             |   0 |     no | every 60 s and on MQTT connect |
| `cmd`       | Remote device control     |   2 |    n/a | on demand                      |

Notes:

- telemetry is retained in the firmware publish call
- scan events are buffered if MQTT is down
- heartbeat is also sent once immediately after MQTT connect

---

## 5. Payload Schemas

### 5.1 Telemetry

Topic: `logistics/mobile/{device_id}/telemetry`

Example payload:

```json
{
  "schema_version": "2.0",
  "device_id": "DEV-TRUCK-001",
  "device_type": "mobile",
  "facility_id": "jkt-wh-01",
  "timestamp_utc": "2026-04-23T10:30:15.000Z",
  "sequence_no": 12,
  "gps": {
    "lat": -6.2088,
    "lng": 106.8456,
    "altitude_m": 12.3,
    "accuracy_m": 8.5,
    "heading_deg": 90.0,
    "speed_kmh": 32.1
  },
  "active_package_count": 3,
  "battery_pct": 85,
  "signal_strength": "good",
  "gps_fix": true
}
```

Dashboard usage:

- update live map marker
- update speed and heading widget
- show GPS fix state
- show connection quality

If GPS fix is missing:

- latitude and longitude are `0.0`
- `accuracy_m` becomes `999.9`
- `gps_fix` is `false`

### 5.2 Scan Event

Topic: `logistics/mobile/{device_id}/scan`

Example payload:

```json
{
  "schema_version": "2.0",
  "event_id": "SCAN-DEV-TRUCK-001-000013",
  "device_id": "DEV-TRUCK-001",
  "device_type": "mobile",
  "device_role": "truck",
  "facility_id": "jkt-wh-01",
  "location_name": "Jakarta Warehouse Truck 007",
  "timestamp_utc": "2026-04-23T10:30:18.000Z",
  "rfid_epc": "LOG-04A1B2C3",
  "scan_context": "in_transit",
  "signal_strength_dbm": -62,
  "read_count": 1,
  "device_gps": {
    "lat": -6.2101,
    "lng": 106.8462
  }
}
```

Dashboard usage:

- append package event to timeline
- show pickup or transit event
- refresh package location from last known device position
- trigger scan activity indicator

`scan_context` values in current firmware:

- `pickup`
- `in_transit`

### 5.3 Heartbeat

Topic: `logistics/mobile/{device_id}/heartbeat`

Example payload:

```json
{
  "schema_version": "2.0",
  "device_id": "DEV-TRUCK-001",
  "device_type": "mobile",
  "device_role": "truck",
  "facility_id": "jkt-wh-01",
  "timestamp_utc": "2026-04-23T10:31:00.000Z",
  "uptime_sec": 360,
  "status": "online",
  "rfid_reader_status": "healthy",
  "gps_fix": true,
  "packages_scanned_today": 7,
  "wifi_rssi": -61
}
```

Dashboard usage:

- online/offline badge
- uptime display
- health panel
- daily scan counter

### 5.4 Command

Topic: `logistics/mobile/{device_id}/cmd`

Payload is JSON.

Example:

```json
{
  "command": "update_role",
  "command_id": "CMD-001",
  "payload": {
    "new_role": "truck",
    "new_facility_id": "jkt-wh-01",
    "new_location_name": "Jakarta Warehouse Truck 007"
  }
}
```

Supported commands in current firmware:

- `update_role`
- `force_scan`
- `set_cooldown`
- `reboot`

---

## 6. Dashboard Integration Rules

### 6.1 Live Map

Use telemetry payloads as the map source.

- plot marker from `gps.lat` and `gps.lng`
- use `heading_deg` for rotation if supported
- use `speed_kmh` for motion state
- use `gps_fix` to fade or flag uncertain positions

### 6.2 Package Timeline

Use scan payloads as package events.

- `event_id` becomes the unique timeline item key
- `rfid_epc` identifies the tag read by the truck
- `scan_context` describes business meaning
- `timestamp_utc` is the event time

### 6.3 Device Status Card

Use heartbeat payloads for the device status card.

- `status`
- `uptime_sec`
- `wifi_rssi`
- `gps_fix`
- `packages_scanned_today`

### 6.4 Remote Control Panel

Use the command topic only through privileged backend actions.

- `update_role` for reassignment
- `force_scan` for operator test flow
- `reboot` for recovery actions

Do not expose raw MQTT command publishing to unauthenticated dashboard clients.

---

## 7. Offline Behaviour

Firmware buffers up to 50 events when MQTT is unavailable.

Buffer rules:

- telemetry and scan events are queued in memory
- oldest event is dropped when buffer is full
- buffered events are flushed after MQTT reconnect

Dashboard implication:

- expect delayed scan delivery after reconnect
- use `timestamp_utc` and `sequence_no` to order events
- do not assume arrival order equals event order

---

## 8. State and Status Model

Firmware state reflected in the dashboard:

- WiFi connected
- MQTT connected
- GPS fix valid
- RFID reader healthy
- device role
- facility binding

LED mapping in firmware:

- blue: WiFi
- green: MQTT
- yellow: RFID scan
- red: GPS fix or error

The dashboard can mirror this state for quick health inspection.

---

## 9. Data Handling Notes

### 9.1 Identity

Identity comes from build flags in `platformio.ini` and runtime defaults in `src/main.cpp`.

Current fields:

- `DEVICE_ID`
- `FACILITY_ID`
- `DEVICE_ROLE`
- `LOCATION_NAME`
- `SCHEMA_VERSION`

### 9.2 Timestamp

Firmware prefers GPS time.

- if GPS date and time are valid, timestamp is real UTC
- otherwise firmware emits a fallback placeholder timestamp

Dashboard should treat fallback timestamps as low-confidence device time.

### 9.3 RFID Tag Format

Current firmware converts the PN532 UID into:

- `LOG-{HEX_UID}`

This is a simulation format, not a production EPC encoding.

---

## 10. Alignment With PRD And Tech Doc

This firmware supports the product and technical direction in two ways:

- PRD goal: live operational visibility in the dashboard
- tech doc goal: device-centric IoT model with RFID scan events and live GPS telemetry

Relevant alignment points:

- operator dashboard gets live position updates
- warehouse and customer timelines can consume scan events
- heartbeat supports online/offline visibility
- command channel supports remote device control

The current firmware is a mobile-device implementation, so it maps to the truck or delivery van role in the technical design.

---

## 11. Known Gaps

Current code is firmware-first. The dashboard contract still needs backend normalization for a few items:

- no backend event schema file is present in this repo
- no dashboard consumer implementation is present here
- retained telemetry behavior may need review in the backend
- `scan_context` is currently limited to firmware logic

Also note:

- `src/main.cpp` uses a `logistics/mobile/...` topic namespace
- the technical doc also describes fixed-device topics in addition to mobile-device topics

---

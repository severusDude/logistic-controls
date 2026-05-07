# IoT Frontend Implementation Technical Documentation

**Project:** Logistic Controls
**Document date:** May 7, 2026
**Source basis:** Current repository scan, `PRD_GPS_Logistic_Package_Tracking_MVP.md`, `IoT_Device_Implementation_Technical_Documentation.md`, and Next.js 16 local docs under `node_modules/next/dist/docs/`.
**Frontend scope in this document:** Next.js App Router UI, SimCon dashboard, client-side command forms, realtime SSE consumption, and UI requirement coverage.

---

## 1. Executive Summary

The current frontend is an operational control dashboard focused on IoT device monitoring and remote command dispatch. It is not yet the full PRD shipment tracking dashboard. The implemented UI centers on a SimCon device command console rather than package map tracking.

Current implemented frontend capabilities:

- Next.js App Router pages for `/` and `/simcon`.
- Responsive dashboard shell with top bar, side navigation, device table, command panel, and MQTT-style terminal feed.
- `/simcon` uses a server-side database snapshot, then subscribes to `/api/realtime/stream` through Server-Sent Events (SSE).
- Client-side device selection, offline filtering, selected-device filtering, terminal feed filtering, and pause state.
- Remote command forms for mobile devices: `update-role`, `set-cooldown`, `force-scan`, and `reboot`.
- Form validation shared with backend Zod schemas for command payloads.
- Fixed-device command controls are intentionally disabled in the UI because backend command publishing currently supports mobile devices only.

Major frontend gaps against the PRD:

- No live package map is implemented.
- No marker clustering, geofence polygon rendering, or visual geofence breach state exists.
- No package management CRUD UI exists.
- No public tracking page exists.
- No login, RBAC-aware layouts, operator view, warehouse view, or customer view exists.
- No alert center behavior exists beyond static notification/settings icons.
- No package timeline UI exists, though a backend timeline API exists.

---

## 2. Runtime and Framework Notes

This project uses Next.js 16.2.4 in `package.json`. The local Next.js documentation confirms these relevant conventions:

- `app` is the App Router directory.
- `page.tsx` files expose UI routes.
- `route.ts` files expose API route handlers.
- Pages and layouts are Server Components by default.
- Components using state, effects, browser APIs, event handlers, or `EventSource` must be Client Components with `"use client"`.
- Route handlers live inside `app` and use Web `Request` and `Response` APIs.

Current frontend follows this split:

- Server route entrypoints: `app/page.tsx`, `app/simcon/page.tsx`.
- Client dashboard shell: `components/simcon/simcon-dashboard.tsx`.
- Client command forms: command panel card components under `components/simcon/command-panel/`.
- Shared UI components: `components/ui/`.

---

## 3. Frontend Stack

| Area | Current implementation |
|---|---|
| Framework | Next.js 16.2.4 App Router |
| React | React 19.2.4 |
| Styling | Tailwind CSS 4, app-level CSS variables, shadcn/base-ui style primitives |
| Icons | `lucide-react` |
| Forms | `react-hook-form` with `@hookform/resolvers/zod` |
| Validation | Shared Zod schemas from `lib/backend/schemas/cmd.ts` |
| Realtime transport | Browser `EventSource` consuming SSE endpoint `/api/realtime/stream` |
| Data source for `/` | Static mock data from `lib/simcon/mock-data.ts` |
| Data source for `/simcon` | Server snapshot from `lib/backend/realtime/snapshot.ts`, then SSE updates |

---

## 4. Route Inventory

| Route | File | Current behavior | Status |
|---|---|---|---|
| `/` | `app/page.tsx` | Renders `SimconDashboard` with static mock device and terminal data. | Implemented as mock/demo dashboard |
| `/simcon` | `app/simcon/page.tsx` | Server-fetches realtime snapshot from DB and renders `SimconDashboard`. Page is force dynamic. | Implemented as DB-backed dashboard |
| `/api/realtime/stream` | `app/api/realtime/stream/route.ts` | SSE endpoint polled by dashboard client. Emits `snapshot` events when backend watermarks change. | Implemented |
| `/api/devices/:deviceId/commands/:command` | `app/api/devices/[deviceId]/commands/[command]/route.ts` | Command POST target used by command forms. | Implemented backend endpoint, consumed by UI |

Routes required by PRD but not present:

| Required UI | PRD source | Current state |
|---|---|---|
| Login | FR-RBAC-05, UX inventory | Not implemented |
| Operator Dashboard with live map | FR-MAP, UX inventory | Not implemented |
| Package Detail Modal | FR-MAP-03, FR-TL | Not implemented |
| Package Management | FR-PKG | Not implemented |
| Warehouse View | FR-RBAC-03, UX inventory | Not implemented |
| Alert Center | FR-ALT | Not implemented |
| Public Tracking Page | FR-PKG-05, End Customer stories | Not implemented |
| Simulation Control Panel for packages/routes | UX inventory, FR-SIM | Not implemented |

---

## 5. Component Inventory

### 5.1 Dashboard Composition

| Component | File | Responsibility | Status |
|---|---|---|---|
| `SimconDashboard` | `components/simcon/simcon-dashboard.tsx` | Main client dashboard state, SSE subscription, filtering, layout composition. | Implemented |
| `AppShell` | `components/layout/app-shell.tsx` | Bounded dashboard shell with header, sidebar, content area. | Implemented |
| `TopBar` | `components/layout/top-bar.tsx` | Product identity, search input, static status pills, icons, halt button. | Implemented UI only |
| `SideNav` | `components/layout/side-nav.tsx` | Dashboard navigation. Current links are hash links from mock data. | Implemented static nav |
| `HeroStrip` | Inline in `simcon-dashboard.tsx` | Device status stats. Uses live device list for online/warning/offline counts; throughput stat is static text. | Partially implemented |

### 5.2 Device Monitoring

| Component | File | Responsibility | Status |
|---|---|---|---|
| `DeviceTable` | `components/simcon/device-table/device-table.tsx` | Device list table with scroll area. | Implemented |
| `DeviceTableToolbar` | `components/simcon/device-table/device-table-toolbar.tsx` | Toggle controls for offline devices and selected-device filtering. | Implemented |
| `DeviceTableHeader` | `components/simcon/device-table/device-table-header.tsx` | Table column headers. | Implemented |
| `DeviceTableRow` | `components/simcon/device-table/device-table-row.tsx` | Selectable device row with status, role/type/GPS, facility/zone, throughput, heartbeat age. | Implemented |
| `StatusDot`, `Badge`, `NumericText` | `components/ui/` | Visual status and numeric primitives. | Implemented |

### 5.3 Command Panel

| Component | File | Responsibility | Status |
|---|---|---|---|
| `DeviceCommandPanel` | `components/simcon/command-panel/device-command-panel.tsx` | Displays selected-device command cards and disables commands for non-mobile devices. | Implemented |
| `UpdateConfigurationCard` | `components/simcon/command-panel/update-configuration-card.tsx` | Publishes `update-role` command with role, facility, and location form fields. | Implemented |
| `TimingParamsCard` | `components/simcon/command-panel/timing-params-card.tsx` | Publishes `set-cooldown` command. | Implemented |
| `ImmediateExecutionCard` | `components/simcon/command-panel/immediate-execution-card.tsx` | Publishes `force-scan`; publishes `reboot` after two-step confirmation. | Implemented |
| `ConnectionBadge` | `components/simcon/command-panel/connection-badge.tsx` | Displays connection status. | Implemented |
| `CommandCard` | `components/simcon/command-panel/command-card.tsx` | Shared command module card frame. | Implemented |

### 5.4 Terminal Feed

| Component | File | Responsibility | Status |
|---|---|---|---|
| `MqttTerminalFeed` | `components/simcon/terminal/mqtt-terminal-feed.tsx` | Terminal panel wrapper with toolbar and log list. | Implemented |
| `TerminalToolbar` | `components/simcon/terminal/terminal-toolbar.tsx` | Pause and filtering controls. | Implemented UI state only |
| `TerminalLogList` | `components/simcon/terminal/terminal-log-list.tsx` | Renders log entries. | Implemented |
| `TerminalLogLine` | `components/simcon/terminal/terminal-log-line.tsx` | Renders individual event line. | Implemented |

---

## 6. Data Flow

### 6.1 Static Demo Flow (`/`)

```text
app/page.tsx
  -> imports devices/navItems/terminalEntries from lib/simcon/mock-data.ts
  -> renders SimconDashboard
  -> client dashboard manages only local UI state
```

This route does not touch the database, MQTT worker, or API routes.

### 6.2 Realtime Dashboard Flow (`/simcon`)

```text
app/simcon/page.tsx
  -> await getRealtimeSnapshot()
  -> render SimconDashboard with DB-backed initial props
  -> browser opens EventSource('/api/realtime/stream')
  -> SSE snapshot event updates liveDevices and liveTerminalEntries
```

The dashboard updates are not true WebSocket pushes. They are SSE snapshots generated by a server route that polls backend watermarks every 2 seconds.

### 6.3 Command Publishing Flow

```text
User edits command form
  -> react-hook-form validates through Zod schema
  -> submitDeviceCommand()
  -> POST /api/devices/{deviceId}/commands/{command}
  -> backend persists DeviceCommand and publishes MQTT cmd message
  -> UI shows success/error inline message
```

Supported frontend command route segments:

- `update-role`
- `set-cooldown`
- `force-scan`
- `reboot`

Command controls are disabled when selected device type is `fixed`.

---

## 7. Current UI Behavior

Implemented:

- Device row selection.
- Offline device visibility toggle.
- Selected-device-only table and terminal filtering.
- SSE snapshot refresh on `/simcon`.
- Terminal feed pause state in UI.
- Mobile command submission states and inline errors.
- Two-step reboot confirmation.
- Responsive navigation drawer for small screens.

Partially implemented:

- Search input exists in the top bar, but no search behavior is connected.
- Notification bell exists, but no notification center is connected.
- Settings icon exists, but no settings panel is connected.
- `Halt noncritical` button exists, but no action is connected.
- Side navigation labels exist, but links are static `#` links.
- Hero strip calculates online/warning/offline counts from live devices, but `Lane throughput` is static.
- Terminal pause flag affects toolbar state but incoming SSE updates still replace `liveTerminalEntries`; there is no buffering or suppression in `SimconDashboard`.

Not implemented:

- Map canvas or map library integration.
- Package marker display.
- Marker clustering.
- Geofence drawing.
- Package timeline UI.
- Public package tracking form/page.
- CRUD package forms.
- Operator/warehouse/customer role-based layout switching.
- Authentication pages or session-aware navigation.
- Alert list, unread count, acknowledgement, dismissal.

---

## 8. Frontend Data Contracts

### 8.1 Device UI Contract

Defined in `lib/simcon/types.ts`:

| Field | Meaning |
|---|---|
| `id` | Device identifier shown in table and command panel. |
| `status` | `online`, `warning`, `offline`, or `idle`. |
| `type` | `mobile` or `fixed`. |
| `role` | Normalized UI role: `truck`, `scanner`, or `gateway`. |
| `facility` | Facility code or fallback label. |
| `zone` | Device location or zone label. |
| `hasGps` | Whether UI should label device as GPS-capable. |
| `throughput` | Preformatted throughput string. |
| `lastBeat` | Preformatted relative heartbeat/seen time. |
| `battery` | Preformatted battery/wired string. |
| `connectionStatus` | `connected`, `offline`, `rebuilding`, or `degraded`. |
| `scanCooldown` | Current displayed cooldown seconds. Currently fixed to 30 in DB snapshot mapping. |

### 8.2 Terminal Entry Contract

Defined in `lib/simcon/types.ts`:

| Field | Meaning |
|---|---|
| `id` | Log entry identifier. |
| `timestamp` | Display timestamp string. |
| `category` | `HEARTBEAT`, `TELEMETRY`, `SCAN_EVT`, or `SYS`. |
| `level` | `neutral`, `info`, `success`, `warning`, or `error`. |
| `message` | Display message generated from raw MQTT payload. |
| `deviceId` | Device filter key. |
| `badge` | Optional short badge. |

### 8.3 Realtime Snapshot Contract

Defined in `lib/backend/realtime/contracts.ts`:

| Field | Meaning | Frontend usage |
|---|---|---|
| `devices` | Device UI rows. | Used by table, hero stats, command panel. |
| `terminalEntries` | Recent MQTT/raw event log lines. | Used by terminal feed. |
| `packageEvents` | Recent package events. | Not currently rendered. |
| `watermarks` | Backend change timestamps. | Internal to SSE route, not directly used in UI. |
| `emittedAt` | Snapshot emission timestamp. | Not currently rendered. |

---

## 9. PRD Functional Requirement Coverage - Frontend

### 9.1 GPS Simulation Engine Requirements

| ID | Frontend state | Coverage |
|---|---|---|
| FR-SIM-01 | No package simulation control UI. Device telemetry display exists through backend snapshot. | Not fulfilled |
| FR-SIM-02 | No waypoint/route UI. | Not fulfilled |
| FR-SIM-03 | UI table can render multiple devices, but no package fleet simulation UI exists. | Not fulfilled |
| FR-SIM-04 | No speed profile controls. | Not fulfilled |
| FR-SIM-05 | Frontend consumes REST/SSE APIs, not WebSocket. No package simulation API consumption. | Partially fulfilled |

### 9.2 Real-Time Map Requirements

| ID | Frontend state | Coverage |
|---|---|---|
| FR-MAP-01 | No map component. | Not fulfilled |
| FR-MAP-02 | SSE refresh is 2 seconds, but applies to device dashboard, not map markers. | Not fulfilled for map |
| FR-MAP-03 | Device row selection exists; package marker detail panel does not. | Not fulfilled |
| FR-MAP-04 | No map zoom/pan/cluster support. | Not fulfilled |
| FR-MAP-05 | No geofence polygon UI. | Not fulfilled |
| FR-MAP-06 | No geofence breach visual state. | Not fulfilled |

### 9.3 Status Timeline Requirements

| ID | Frontend state | Coverage |
|---|---|---|
| FR-TL-01 | Backend has package timeline API; no frontend timeline component. | Not fulfilled in frontend |
| FR-TL-02 | Status values exist in Prisma and package API; not rendered in UI. | Not fulfilled in frontend |
| FR-TL-03 | No package current-status detail UI. | Not fulfilled |
| FR-TL-04 | No timeline location/GPS UI. | Not fulfilled |

### 9.4 Alert and Notification Requirements

| ID | Frontend state | Coverage |
|---|---|---|
| FR-ALT-01 | No alert center or alert trigger UI. | Not fulfilled |
| FR-ALT-02 | Bell icon exists only as static UI. | Not fulfilled |
| FR-ALT-03 | No role-filtered alert UI. | Not fulfilled |
| FR-ALT-04 | No unread badge/read state UI. | Not fulfilled |
| FR-ALT-05 | No email stub UI expected; backend planning item. | Not applicable to frontend now |
| FR-ALT-06 | No acknowledge/dismiss controls. | Not fulfilled |

### 9.5 Package Management Requirements

| ID | Frontend state | Coverage |
|---|---|---|
| FR-PKG-01 | No package creation form. | Not fulfilled |
| FR-PKG-02 | No route assignment UI. | Not fulfilled |
| FR-PKG-03 | No status override UI. | Not fulfilled |
| FR-PKG-04 | No package search/filter UI. Top search is not wired. | Not fulfilled |
| FR-PKG-05 | No public tracking page. | Not fulfilled |

### 9.6 RBAC Requirements

| ID | Frontend state | Coverage |
|---|---|---|
| FR-RBAC-01 | No role-specific routes/layouts. | Not fulfilled |
| FR-RBAC-02 | Current dashboard resembles operator/device console, but lacks package/map/alert management. | Partially fulfilled as UI direction only |
| FR-RBAC-03 | No warehouse-scoped UI. | Not fulfilled |
| FR-RBAC-04 | No customer tracking UI. | Not fulfilled |
| FR-RBAC-05 | No login UI or session handling. | Not fulfilled |

---

## 10. Non-Functional Coverage - Frontend

| ID | Requirement | Frontend state | Coverage |
|---|---|---|---|
| NFR-01 | Map/timeline load within 3 seconds | Map/timeline not implemented. Current dashboard server snapshot may depend on DB latency. | Not measurable for PRD screens |
| NFR-02 | Scale toward 200+ packages | Current UI renders device rows and recent logs. No virtualized package fleet/map. | Not fulfilled |
| NFR-03 | Reconnecting state | SSE logs errors to console only. No visible reconnecting UI. | Not fulfilled |
| NFR-04 | Security | No authenticated frontend session or protected navigation. | Not fulfilled |
| NFR-05 | Responsive for >=1024px | Current dashboard is responsive and includes mobile drawer. | Partially fulfilled |
| NFR-06 | Maintainability | Component split is modular; command schemas are shared with backend. | Partially fulfilled |
| NFR-07 | Browser support | Not explicitly verified. | Needs verification |

---

## 11. Planning Gaps

Frontend areas that need product/technical planning before implementation:

1. **Primary product route structure**
   - Decide whether `/simcon` remains an internal IoT control console and new PRD routes are added separately, or whether the main dashboard evolves into the operator dashboard.

2. **Map implementation**
   - Choose Leaflet, Mapbox GL JS, or another map provider.
   - Define package marker schema, clustering threshold, marker states, and geofence rendering.

3. **Realtime transport**
   - Current UI uses SSE snapshots every 2 seconds. PRD references REST/WebSocket. Decide whether SSE is acceptable for MVP or whether WebSocket is required for package updates and alerts.

4. **Role-aware navigation**
   - Define separate navigation trees for operator, warehouse staff, and public customer flow.
   - Determine how warehouse facility scope is displayed and enforced.

5. **Package management UX**
   - Define package create/edit forms, status override workflow, search/filter behavior, and shipment detail modal/page.

6. **Alert center UX**
   - Define bell badge behavior, unread/read state, acknowledgement/dismissal, role filtering, severity styles, and alert history retention.

7. **Public tracking page**
   - Decide whether tracking by ID alone is sufficient or whether extra verification is needed.
   - Define customer-safe payload that excludes internal device/facility data and PII.

8. **IoT console boundaries**
   - Current command console is useful for operations and demos but is not listed as the main PRD dashboard. Decide whether it is admin-only, operator-only, or hidden behind a feature flag.

---

## 12. Recommended Frontend Roadmap

### Phase F1 - Product Navigation and Auth Shell

- Add login page.
- Add authenticated app shell.
- Add route groups for operator and warehouse sections.
- Add public tracking route outside authenticated shell.
- Wire current user/role into navigation.

### Phase F2 - Package Tracking UI

- Add package list and package detail view.
- Render package timeline using `/api/packages/[trackingId]/timeline`.
- Add package filters: tracking ID, status, origin/facility, destination, date.

### Phase F3 - Realtime Map

- Add map library.
- Render package positions from backend snapshot/API.
- Add selected package detail panel.
- Add marker status colors and clustering.

### Phase F4 - Alerts and Notifications

- Add alert center route/panel.
- Add unread badge and severity grouping.
- Add acknowledge/dismiss actions.
- Add role-filtered alert display.

### Phase F5 - Warehouse and Customer Views

- Add warehouse-scoped package view.
- Add checkpoint status update controls.
- Add public tracking form/page with ETA and timeline.

### Phase F6 - SimCon Hardening

- Keep SimCon command console as an operator/admin tool.
- Show SSE connection status visibly.
- Respect terminal pause by buffering or suppressing incoming terminal updates while paused.
- Replace static top bar/status labels with live backend values.

---

## 13. Current Frontend Completion Snapshot

| Product area | Status |
|---|---|
| IoT device console | Implemented, DB-backed on `/simcon`, mock-backed on `/` |
| Remote command forms | Implemented for mobile devices |
| Live package map | Not started |
| Package timeline UI | Not started |
| Package CRUD UI | Not started |
| Alert center | Not started |
| RBAC/auth UI | Not started |
| Warehouse UI | Not started |
| Public tracking UI | Not started |
| Geofence UI | Not started |
| Simulation package control UI | Not started |

---

## 14. Key Risks

- The current UI can look like an operational dashboard, but it does not yet prove PRD package tracking requirements.
- `/` uses static mock data and can be mistaken for live system state.
- `/simcon` depends on database and SSE, but lacks visible connection/reconnect feedback.
- Command controls publish to real MQTT when configured; this should be protected by auth before shared/demo use.
- The frontend imports backend schemas into client command forms. This is useful for consistency, but future schemas must avoid server-only dependencies if they remain client-imported.

---

## 15. Definition of Done for Frontend MVP

Frontend can be considered MVP-complete only when these are true:

- Operator can log in and see all active packages on a live map.
- Package markers update at the target refresh rate.
- Operator can open a package detail timeline from map/list.
- Warehouse staff can log in and see only facility-scoped packages.
- Warehouse staff can register/update packages at checkpoints.
- Customer can track a package by tracking number without login.
- Alert center shows role-filtered unread/read alerts and supports operator acknowledgement.
- Geofences are visible on the map and breached packages are visually distinguished.
- Responsive behavior is verified on supported desktop widths.
- `/simcon` command console is intentionally positioned as admin/operator tooling, not confused with customer tracking product UI.

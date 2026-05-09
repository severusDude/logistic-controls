# IoT Frontend Implementation Technical Documentation

**Project:** Logistic Controls
**Document date:** May 7, 2026
**Source basis:** Current repository scan, `PRD_GPS_Logistic_Package_Tracking_MVP.md`, `IoT_Device_Implementation_Technical_Documentation.md`, and Next.js 16 local docs under `node_modules/next/dist/docs/`.
**Frontend scope in this document:** Next.js App Router UI, SimCon dashboard, client-side command forms, realtime SSE consumption, and UI requirement coverage.
**Research scope note:** This document follows `PRD_GPS_Logistic_Package_Tracking_MVP.md` v2.0 research scope.

---

## 1. Executive Summary

The current frontend is a research SimCon dashboard for device/event observation and optional remote command dispatch. It supports the PRD v2.0 proof path:

```text
RFID/GPS device event -> MQTT -> worker/backend -> database -> API/dashboard
```

Current implemented frontend capabilities:

- Next.js App Router pages for `/` and `/simcon`.
- Full-viewport responsive dashboard shell with full-height collapsible shadcn-style sidebar navigation, top bar, device table, package event evidence pane, right-side item inspectors, and bottom terminal sheet.
- `/simcon` uses a server-side database snapshot, then subscribes to `/api/realtime/stream` through Server-Sent Events (SSE).
- Client-side device selection, offline filtering, selected-device filtering, terminal feed filtering, and pause state.
- Right-side item sheet for selected device details/commands and selected package-event evidence.
- Toggleable bottom terminal sheet opened from the header and stretched across the viewport width minus the sidebar.
- Remote command forms for mobile devices: `update-role`, `set-cooldown`, `force-scan`, and `reboot`.
- Form validation shared with backend Zod schemas for command payloads.
- Fixed-device command controls are intentionally disabled in the UI because backend command publishing currently supports mobile devices only.

Current frontend gaps for research completion:

- Final `/simcon` screenshot and scenario evidence still need to be collected.
- SSE update behavior needs final proof or explicit partial-status note.
- Command panel API result is optional and needs evidence only if included in the report.
- Recent package events are visible as an evidence pane; full package timeline UI remains optional because API evidence is enough for PRD v2.0.
- Package map, geofence UI, alert center, auth/RBAC views, and public tracking remain future work. Internal package CRUD is in PRD v2.0 scope but not implemented yet.

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
| `/simcon` | `app/simcon/page.tsx` | Server-fetches realtime snapshot from DB and renders `SimconDashboard` with devices, terminal entries, and package events. Page is force dynamic. | Implemented as DB-backed dashboard |
| `/api/realtime/stream` | `app/api/realtime/stream/route.ts` | SSE endpoint polled by dashboard client. Emits `snapshot` events when backend watermarks change. | Implemented |
| `/api/devices/:deviceId/commands/:command` | `app/api/devices/[deviceId]/commands/[command]/route.ts` | Command POST target used by command forms. | Implemented backend endpoint, consumed by UI |

Pending or deferred UI routes:

| Deferred UI | Reason |
|---|---|
| Login/auth shell | Auth/RBAC is out of research implementation scope. |
| Operator live package map | Live map is future work; coordinates/API evidence are sufficient. |
| Package detail modal | Optional; package timeline API is enough for report verification. |
| Package management | Internal package CRUD/search/status override is in scope but not implemented yet. |
| Warehouse/customer views | Multi-role and public tracking flows are out of scope. |
| Alert center | Alert workflow is future work. |
| Simulation package/route panel | Route/ETA/geofence simulation is out of scope. |

---

## 5. Component Inventory

### 5.1 Dashboard Composition

| Component | File | Responsibility | Status |
|---|---|---|---|
| `SimconDashboard` | `components/simcon/simcon-dashboard.tsx` | Main client dashboard state, SSE subscription, filtering, sheet state, package evidence pane, layout composition. | Implemented |
| `AppShell` | `components/layout/app-shell.tsx` | Full-viewport dashboard shell with header, sidebar, and content area. | Implemented |
| `TopBar` | `components/layout/top-bar.tsx` | Product identity, search input, static status pills, bottom terminal sheet trigger, icons, halt button. | Implemented UI only |
| `SideNav` | `components/layout/side-nav.tsx` | Full-height shadcn-style sidebar navigation with lucide icons and collapse rail. | Implemented |
| `HeroStrip` | Inline in `simcon-dashboard.tsx` | Device status stats. Uses live device list for online/warning/offline counts; throughput stat is static text. | Partially implemented |
| `Sidebar` primitives | `components/ui/sidebar.tsx` | Local shadcn-style sidebar provider, content, menu, rail, and trigger primitives. | Implemented |
| `Sheet` primitives | `components/ui/sheet.tsx` | shadcn-style sheet used for right-side item inspector and bottom terminal feed. | Implemented |

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

### 5.4 Package Evidence and Item Sheets

| Component | File | Responsibility | Status |
|---|---|---|---|
| `PackageEventPane` | Inline in `components/simcon/simcon-dashboard.tsx` | Lists recent package events from realtime snapshot. | Implemented |
| `DeviceInspector` | Inline in `components/simcon/simcon-dashboard.tsx` | Right-side sheet for selected device metadata and command cards. | Implemented |
| `PackageEventInspector` | Inline in `components/simcon/simcon-dashboard.tsx` | Right-side sheet for selected package event fields. | Implemented |

### 5.5 Terminal Feed

| Component | File | Responsibility | Status |
|---|---|---|---|
| `MqttTerminalFeed` | `components/simcon/terminal/mqtt-terminal-feed.tsx` | Terminal panel wrapper with toolbar and log list, now rendered inside toggleable bottom sheet. | Implemented |
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
  -> render SimconDashboard with DB-backed device, terminal, and package-event props
  -> browser opens EventSource('/api/realtime/stream')
  -> SSE snapshot event updates liveDevices, liveTerminalEntries, and livePackageEvents
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
- Device row opens a right-side item sheet with metadata and command cards.
- Recent package-event list and package-event detail sheet.
- Offline device visibility toggle.
- Selected-device-only table and terminal filtering.
- SSE snapshot refresh on `/simcon`.
- Bottom terminal sheet trigger in the header and terminal feed pause state in UI.
- Full-height sidebar navigation with collapse rail.
- Mobile command submission states and inline errors.
- Two-step reboot confirmation.
- Responsive sidebar rail for small screens.

Partially implemented:

- Search input exists in the top bar, but no search behavior is connected.
- Notification bell exists, but no notification center is connected.
- Settings icon exists, but no settings panel is connected.
- `Halt noncritical` button exists, but no action is connected.
- Side navigation labels exist, but links are static `#` links.
- Hero strip calculates online/warning/offline counts from live devices, but `Lane throughput` is static.
- Terminal pause flag affects toolbar state but incoming SSE updates still replace `liveTerminalEntries`; there is no buffering or suppression in `SimconDashboard`.

Pending or future UI work:

- Map canvas or map library integration.
- Package marker display.
- Marker clustering.
- Geofence drawing.
- Full package timeline UI beyond recent package-event evidence pane.
- Public package tracking form/page.
- Package CRUD forms, table/search, detail, assignment, and status override.
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
| `packageEvents` | Recent package events. | Used by package evidence pane and package-event sheet. |
| `watermarks` | Backend change timestamps. | Internal to SSE route, not directly used in UI. |
| `emittedAt` | Snapshot emission timestamp. | Not currently rendered. |

---

## 9. PRD v2 Functional Requirement Coverage - Frontend

| ID | Frontend state | Coverage |
|---|---|---|
| FR-UI-01 | `/simcon` renders DB-backed device rows with status, role/type/GPS, facility/zone, heartbeat age, and connection state. | Implemented |
| FR-UI-02 | Terminal feed renders recent raw MQTT events mapped from backend snapshot. | Implemented |
| FR-UI-03 | `/simcon` consumes `/api/realtime/stream` through `EventSource`; backend sends polling SSE snapshots. | Partial; needs final evidence |
| FR-UI-04 | Package timeline API exists on backend; frontend renders recent package-event evidence from realtime snapshot. | Partial UI evidence; full timeline still API-backed |
| FR-UI-05 | Command forms post optional mobile commands to backend. | Partial/optional |
| FR-UI-06 | Internal package management screens are planned for package table/search, create/edit, detail, device/facility assignment, and status override. | In scope, pending UI |

Out-of-scope frontend items for PRD v2.0:

- Live package map, marker clustering, geofence drawing, and breach visuals.
- Route assignment beyond device/facility assignment.
- Login, RBAC-aware routes, warehouse view, customer/public tracking page.
- Alert center, unread badge, acknowledgement, dismissal, and notification workflow.
- ETA, route optimization, and large-fleet simulation controls.

---

## 10. Non-Functional Coverage - Frontend

| ID | Requirement | Frontend state | Coverage |
|---|---|---|---|
| NFR-01 | Prioritize clear data flow over feature breadth | UI focuses on device state, raw event feed, command controls, and research observation. | Implemented direction |
| NFR-02 | Raw events/logs inspectable | Terminal feed displays recent MQTT/raw events from backend. | Implemented |
| NFR-03 | Modular UI | SimCon shell, device table, command panel, terminal feed, and primitives are split into components. | Implemented |
| NFR-04 | Reliability during local tests | SSE consumption exists, but visible reconnecting state is limited. | Partial |
| NFR-05 | Dashboard refresh around 5 seconds | SSE snapshot path exists; final run evidence needed. | Partial |
| NFR-06 | Security limitations documented | No auth/session by design for research; production security is out of scope. | Implemented docs |
| NFR-07 | Scalability beyond prototype out of scope | No large package/map UI planned for PRD v2.0. | Deferred |

---

## 11. Research UI Completion Gaps

Non-disruptive UI evidence was captured on May 9, 2026 with Next Devtools MCP:

- Dashboard screenshot: `logs/tc-08-simcon-dashboard-2026-05-09.png`
- Terminal/feed screenshot: `logs/tc-07-tc-08-terminal-feed-2026-05-09.png`
- Next Devtools output: `logs/tc-nondisruptive-2026-05-09-next-devtools-output.txt`
- Test result summary: `logs/tc-nondisruptive-2026-05-09-results.md`

The capture confirmed `/simcon` rendered without Next.js runtime errors or browser console errors. The dashboard showed the DB-backed device table and the terminal sheet showed telemetry events. Package evidence remained empty because no known package event existed in the captured backend state. SSE live update without manual reload remains partial because no before/after event update was captured during this non-disruptive run.

Frontend areas needed before final report evidence:

1. **Dashboard screenshot**
   - Completed on May 9, 2026.
   - Screenshot includes device table and terminal feed.

2. **SSE update proof**
   - Show before/after evidence that event feed or device state changes without manual reload.
   - Not captured in the May 9 evidence set; keep SSE as partial.

3. **Command panel proof**
   - Optional. Capture API/UI success for force-scan or configuration command only if used in the report.

4. **Package evidence presentation**
   - Recent package event pane is visible in `/simcon`.
   - May 9 screenshot showed no package events in current snapshot.
   - Use timeline API if full package history is required for report evidence.

5. **Visible limitations**
   - Document mock `/` route, limited reconnect feedback, static top bar actions, and no production auth.

---

## 12. Recommended Frontend Research Roadmap

### Phase F1 - Evidence Baseline

- Run `/simcon` with seeded database snapshot.
- Capture screenshot showing device rows and terminal panel.
- Verify `/` remains mock/demo and does not get used as live evidence.

### Phase F2 - Event Observation Proof

- Run backend/device scenario and confirm terminal feed changes.
- Capture SSE refresh evidence or mark UI realtime as partial.

### Phase F3 - Optional Command Proof

- Submit mobile command from command panel.
- Capture success/error state and matching backend raw command event.

### Phase F4 - Report Support

- Use backend package timeline API evidence when full package history is needed beyond visible recent package events.
- Implement internal package CRUD UI when package management evidence is needed.
- Keep package map, auth/RBAC, alert center, public tracking, geofence, ETA, and route optimization as future work.

---

## 13. Current Frontend Completion Snapshot

| Research frontend area | Status |
|---|---|
| IoT device console | Implemented, DB-backed on `/simcon`, mock-backed on `/` |
| Remote command forms | Implemented for mobile devices |
| Device status table | Implemented |
| Raw event terminal feed | Implemented |
| SSE dashboard refresh | Partial; May 9 render captured, live before/after update not captured |
| Package event evidence display | Implemented partial; May 9 snapshot had no package events |
| Dashboard screenshot evidence | Captured May 9, 2026 |
| Command evidence | Optional/pending |
| Live package map | Out of scope |
| Package CRUD UI | In scope, pending implementation |
| Alert center | Out of scope |
| RBAC/auth UI | Out of scope |
| Warehouse UI | Out of scope |
| Public tracking UI | Out of scope |
| Geofence UI | Out of scope |
| Simulation package/route control UI | Out of scope |

---

## 14. Key Risks

- The current UI can look like a production operations dashboard, but it is research SimCon evidence only.
- `/` uses static mock data and can be mistaken for live system state.
- `/simcon` depends on database and SSE, but lacks visible connection/reconnect feedback.
- Command controls publish to MQTT when configured; use only in controlled local tests.
- The frontend imports backend schemas into client command forms. This is useful for consistency, but future schemas must avoid server-only dependencies if they remain client-imported.
- Full package timeline UI is absent; report should use backend API response when complete package history is needed.

---

## 15. Definition of Done for Frontend Research Scope

Frontend can be considered research-complete when these are true:

- `/simcon` loads a DB-backed snapshot.
- Device table shows current device state.
- Terminal feed shows MQTT/raw event evidence after scenario run.
- SSE refresh behavior is captured or documented as partial.
- Optional command panel evidence is captured if commands are included in the report.
- Package event evidence is visible in `/simcon`; full timeline evidence is supplied by backend API response unless frontend timeline UI is later added.
- Dashboard screenshot is collected for the report.
- Limitations are recorded: mock `/`, no package map, no auth/RBAC, no alert center, no public tracking, package CRUD pending, no geofence/ETA, and no production security.

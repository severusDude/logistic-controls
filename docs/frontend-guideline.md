# SimCon Dashboard — Complete Implementation Plan

## Next.js + shadcn/ui Component Breakdown

This plan translates `simcon.html` into a maintainable Next.js + shadcn/ui application with a clear component hierarchy, reusable primitives, and phased implementation order.

---

## 1. Objectives

The implementation should:

- preserve the visual structure and behavior of the current dashboard
- align the app with the provided industrial precision design system
- convert static HTML into reusable React components
- separate layout, domain components, and shared UI primitives
- make the dashboard ready for real data, interactions, and API wiring
- reduce duplicated Tailwind classes by introducing reusable abstractions

---

## 2. Target Tech Stack

- **Next.js App Router**
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui**
- **Lucide icons** or existing icon system if required
- **react-hook-form + zod** for forms
- **TanStack Table** only if the device table becomes more dynamic later
- optional:
  - **zustand** for lightweight dashboard state
  - **TanStack Query** for server state
  - **clsx / cva** for variants

---

## 3. High-Level Architecture

The screen should be split into three layers:

### 3.1 App shell

Responsible for the overall frame:

- top navigation
- left sidebar
- responsive content region

### 3.2 Feature components

Responsible for SimCon-specific UI:

- device list
- command console
- MQTT terminal feed

### 3.3 Shared UI primitives

Reusable across screens:

- status indicators
- card shells
- labels
- badges
- icon buttons
- search input

---

## 4. Proposed Folder Structure

```txt
app/
  simcon/
    page.tsx
    loading.tsx
    error.tsx

components/
  layout/
    app-shell.tsx
    top-bar.tsx
    side-nav.tsx
    panel-header.tsx

  simcon/
    simcon-dashboard.tsx

    device-table/
      device-table.tsx
      device-table-toolbar.tsx
      device-table-header.tsx
      device-table-row.tsx

    command-panel/
      device-command-panel.tsx
      connection-badge.tsx
      command-card.tsx
      update-configuration-card.tsx
      timing-params-card.tsx
      immediate-execution-card.tsx

    terminal/
      mqtt-terminal-feed.tsx
      terminal-toolbar.tsx
      terminal-log-list.tsx
      terminal-log-line.tsx

  ui/
    icon-button.tsx
    app-search-input.tsx
    status-dot.tsx
    mono-label.tsx
    numeric-text.tsx
    inline-note.tsx
    section-card.tsx

lib/
  simcon/
    types.ts
    constants.ts
    mock-data.ts
    formatters.ts
    validators.ts

hooks/
  use-simcon-selection.ts
  use-terminal-feed.ts

styles/
  tokens.css
```

---

## 5. Route Structure

## `app/simcon/page.tsx`

Keep this file minimal. It should only render the dashboard container.

Example responsibility:

- import and render `SimconDashboard`
- no layout logic
- no domain logic

---

## 6. Main Component Tree

```txt
SimconDashboard
├─ AppShell
│  ├─ TopBar
│  │  ├─ BrandBlock
│  │  ├─ AppSearchInput
│  │  └─ TopBarActions
│  │     ├─ IconButton
│  │     ├─ IconButton
│  │     └─ UserAvatar
│  ├─ SideNav
│  │  ├─ WorkspaceIdentity
│  │  ├─ NavLinks
│  │  ├─ EmergencyStopButton
│  │  └─ UtilityLinks
│  └─ MainContent
│     ├─ SplitContent
│     │  ├─ DeviceTable
│     │  │  ├─ DeviceTableToolbar
│     │  │  ├─ DeviceTableHeader
│     │  │  └─ DeviceTableRow[]
│     │  └─ DeviceCommandPanel
│     │     ├─ PanelHeader
│     │     ├─ ConnectionBadge
│     │     ├─ UpdateConfigurationCard
│     │     ├─ TimingParamsCard
│     │     └─ ImmediateExecutionCard
│     └─ MqttTerminalFeed
│        ├─ TerminalToolbar
│        └─ TerminalLogList
│           └─ TerminalLogLine[]
```

---

## 7. Component Responsibilities

## 7.1 `SimconDashboard`

Primary screen orchestrator.

### Responsibilities

- compose the full dashboard
- provide selected device state
- pass mock or fetched data into child components
- control layout responsiveness

### Should not

- contain heavy inline UI markup
- contain form internals
- contain row-level rendering logic

---

## 7.2 `AppShell`

Reusable application shell.

### Responsibilities

- fixed-height viewport layout
- header region
- sidebar region
- content overflow handling

### Props

```ts
type AppShellProps = {
  header: React.ReactNode;
  sidebar?: React.ReactNode;
  children: React.ReactNode;
};
```

---

## 7.3 `TopBar`

### Responsibilities

- show app identity
- render global search
- render notifications/settings/avatar controls

### Suggested subcomponents

- `BrandBlock`
- `AppSearchInput`
- `TopBarActions`

### Notes

This should be generic enough to reuse in other dashboards.

---

## 7.4 `SideNav`

### Responsibilities

- display workspace metadata
- render primary navigation
- render emergency stop action
- render utility links

### Design notes

- nav items should be config-driven
- emergency action should use destructive styling
- current route should support active state

### Suggested types

```ts
type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
  active?: boolean;
};
```

---

## 7.5 `DeviceTable`

### Responsibilities

- render the left-side device panel
- show device toolbar
- render sticky table header
- render rows from device data
- handle selected row state

### Subcomponents

- `DeviceTableToolbar`
- `DeviceTableHeader`
- `DeviceTableRow`

### Props

```ts
type DeviceTableProps = {
  devices: Device[];
  selectedDeviceId?: string;
  onSelectDevice: (id: string) => void;
};
```

---

## 7.6 `DeviceTableToolbar`

### Responsibilities

- section title
- filter button
- refresh button

### Notes

Use `IconButton` to reduce repeated styles.

---

## 7.7 `DeviceTableRow`

### Responsibilities

- render a single device
- handle selected styling
- show status dot
- display row columns with consistent alignment

### Props

```ts
type DeviceTableRowProps = {
  device: Device;
  selected?: boolean;
  onClick?: () => void;
};
```

### Styling rules

- selected row: accent background and highlighted device ID
- offline rows: muted styling
- status dot color based on device health
- use numeric/mono styling for telemetry-like fields

---

## 7.8 `StatusDot`

### Responsibilities

- standardize status indicator display

### Props

```ts
type StatusDotProps = {
  status: "online" | "warning" | "offline" | "idle";
  pulse?: boolean;
};
```

### Why extract it

This pattern appears in the device list and terminal/header state. It should not be duplicated.

---

## 7.9 `DeviceCommandPanel`

### Responsibilities

- render the selected device header
- show connection state
- stack all command cards
- remain scrollable independently of the table

### Props

```ts
type DeviceCommandPanelProps = {
  device: DeviceDetail;
};
```

### Composition

- `PanelHeader`
- `ConnectionBadge`
- `UpdateConfigurationCard`
- `TimingParamsCard`
- `ImmediateExecutionCard`

---

## 7.10 `ConnectionBadge`

### Responsibilities

- render connection state as a badge

### Props

```ts
type ConnectionBadgeProps = {
  status: "connected" | "offline" | "rebuilding" | "degraded";
};
```

### Styling

Use semantic variants instead of manual class duplication.

---

## 7.11 `CommandCard`

This is the most important reusable abstraction in the feature area.

### Responsibilities

- render the shared card shell
- apply border/background/radius
- display left accent strip
- render title row with icon
- wrap card-specific content

### Props

```ts
type CommandCardProps = {
  title: string;
  icon: React.ReactNode;
  accent: "primary" | "secondary" | "tertiary" | "error";
  children: React.ReactNode;
};
```

### Why this matters

All three right-side cards share the same visual structure. Without this abstraction, the page will accumulate repetitive Tailwind class strings.

---

## 7.12 `UpdateConfigurationCard`

### Responsibilities

- render the editable configuration form
- manage:
  - role assignment
  - facility ID
  - location/zone

- submit configuration updates

### Suggested implementation

- use `react-hook-form`
- validate with `zod`
- wire inputs to shadcn `Input`, `Select`, `Button`, `Label`

### Schema

```ts
const updateConfigurationSchema = z.object({
  role: z.enum(["truck", "scanner", "gateway"]),
  facilityId: z.string().min(1),
  locationZone: z.string().min(1),
});
```

---

## 7.13 `TimingParamsCard`

### Responsibilities

- render numeric timing parameter controls
- validate cooldown input
- submit update
- show inline informational note

### Suggested schema

```ts
const timingParamsSchema = z.object({
  scanCooldown: z.coerce.number().min(1).max(999),
});
```

### Supporting subcomponent

- `InlineNote`

---

## 7.14 `ImmediateExecutionCard`

### Responsibilities

- render action buttons for instant commands
- trigger immediate device actions
- optionally open confirmations for risky actions

### Actions

- force manual scan
- initiate reboot sequence

### Implementation notes

- use standard and destructive button variants
- destructive actions should be wrapped in confirmation dialog later

---

## 7.15 `MqttTerminalFeed`

### Responsibilities

- render terminal area
- show stream metadata
- show filter toggles
- show pause/resume feed action
- render log list

### Layout

- fixed-height bottom panel
- sticky toolbar/header
- vertically scrollable log area

---

## 7.16 `TerminalToolbar`

### Responsibilities

- stream title and endpoint
- filter checkboxes/toggles
- pause feed button

### Notes

This can become a reusable toolbar pattern for future monitoring panels.

---

## 7.17 `TerminalLogList`

### Responsibilities

- map log entries into rows
- handle empty state
- optionally auto-scroll to newest logs

### Future behavior

- preserve scroll position if user scrolls up
- optionally support virtualized rendering

---

## 7.18 `TerminalLogLine`

### Responsibilities

- render a single terminal message
- style by category/severity
- show optional badge like `FORCED`

### Props

```ts
type TerminalLogLineProps = {
  entry: TerminalLog;
};
```

### Log data shape

```ts
type TerminalLog = {
  id: string;
  timestamp: string;
  category: "HEARTBEAT" | "TELEMETRY" | "SCAN_EVT";
  level: "neutral" | "info" | "success" | "warning" | "error";
  message: string;
  badge?: string;
};
```

---

## 8. Shared UI Primitives

These should live in `components/ui` if they can be reused beyond SimCon.

## `IconButton`

Reusable wrapper for icon-only actions.

## `AppSearchInput`

Styled top-bar search field.

## `MonoLabel`

Consistent uppercase technical label treatment.

## `NumericText`

Consistent telemetry number styling.

## `InlineNote`

Compact note with tone variants:

- info
- warning
- error
- success

## `SectionCard`

Generic card container if needed outside command cards.

## `StatusDot`

Reusable status signal indicator.

---

## 9. Type Definitions

Create shared types in `lib/simcon/types.ts`.

```ts
export type DeviceStatus = "online" | "warning" | "offline" | "idle";

export type DeviceRole = "truck" | "scanner" | "gateway";

export type DeviceType = "mobile" | "fixed";

export type Device = {
  id: string;
  status: DeviceStatus;
  type: DeviceType;
  role: DeviceRole;
  facility: string;
  hasGps: boolean;
  lastBeat: string;
};

export type DeviceDetail = Device & {
  locationZone: string;
  connectionStatus: "connected" | "offline" | "rebuilding" | "degraded";
  scanCooldown: number;
};

export type TerminalLog = {
  id: string;
  timestamp: string;
  category: "HEARTBEAT" | "TELEMETRY" | "SCAN_EVT";
  level: "neutral" | "info" | "success" | "warning" | "error";
  message: string;
  badge?: string;
};
```

---

## 10. Design Token Integration

The current HTML includes page-local Tailwind theme values. These should be moved into the app’s real design-token system.

## 10.1 Convert tokens into CSS variables

In `globals.css` or `styles/tokens.css`:

```css
:root {
  --background: 11 19 38;
  --foreground: 218 226 253;

  --card: 23 31 51;
  --card-foreground: 218 226 253;

  --muted: 19 27 46;
  --muted-foreground: 189 200 209;

  --border: 62 72 79;
  --input: 62 72 79;

  --primary: 56 189 248;
  --primary-foreground: 0 53 74;

  --secondary: 0 165 114;
  --secondary-foreground: 0 49 31;

  --accent: 245 158 11;
  --accent-foreground: 97 59 0;

  --destructive: 147 0 10;
  --destructive-foreground: 255 218 214;

  --radius: 0.25rem;
}
```

## 10.2 Extend Tailwind/shadcn

- map semantic values to `background`, `foreground`, `card`, `border`, etc.
- keep app-specific values like terminal black or telemetry tones as extended tokens

## 10.3 Typography setup

- body: `Inter`
- technical labels and data: `Space Grotesk`
- add utility classes for mono labels and numeric telemetry

---

## 11. shadcn/ui Customization Plan

Use shadcn for structure, not only appearance.

## Base shadcn components to use

- `Button`
- `Input`
- `Select`
- `Label`
- `Card`
- `Badge`
- `Checkbox`
- `Dialog`
- `Sheet` for future mobile nav

## Extend component variants

Use `cva` to add:

- monitoring button variants
- connection badge variants
- destructive nav action variant
- terminal row tone variants

---

## 12. State Management Plan

## 12.1 Local UI state

Use local state first for:

- selected device
- filter toggles
- paused terminal state
- form state

## 12.2 Shared dashboard state

If multiple parts of the dashboard need synchronized state, introduce a small store:

Possible store fields:

```ts
type SimconUiState = {
  selectedDeviceId: string | null;
  terminalPaused: boolean;
  showOnlySelectedDevice: boolean;
  showAllTypes: boolean;
};
```

Use `zustand` only if state starts crossing many sibling components.

## 12.3 Server state

Use TanStack Query when live APIs are added for:

- device list
- selected device detail
- terminal log stream history
- command mutations

---

## 13. Data Layer Plan

## Phase 1 — mock data

Create `mock-data.ts` with:

- devices array
- selected device detail
- terminal logs array

## Phase 2 — API contracts

Add service functions:

- `getDevices()`
- `getDeviceById(id)`
- `updateDeviceConfiguration(payload)`
- `updateTimingParams(payload)`
- `executeDeviceCommand(payload)`
- `getTerminalLogs()`

## Phase 3 — live stream integration

Support:

- websocket or SSE connection for MQTT log stream
- optimistic UI updates for device actions where appropriate

---

## 14. Accessibility Plan

Every component should be implemented with basic accessibility from the start.

## Required checks

- all buttons need visible labels or `aria-label`
- selected device row must expose state
- focus rings must remain visible in dark mode
- form controls need labels
- table semantics should remain correct
- destructive actions should confirm intent
- terminal area should avoid noisy live-region behavior unless intentionally enabled

---

## 15. Responsive Behavior Plan

The current layout is desktop-first. The React implementation should account for smaller screens.

## Desktop

- top bar fixed
- left nav visible
- table + command panel side by side
- terminal anchored bottom

## Tablet

- sidebar may collapse
- command panel can stack below the device table
- terminal remains bottom

## Mobile

- sidebar becomes sheet/drawer
- table becomes card list or horizontally scrollable table
- command panel cards stack vertically
- terminal may become a tab or collapsible drawer

### Recommendation

Implement desktop first, then add tablet/mobile support in a second pass.

---

## 16. Implementation Phases

## Phase 1 — foundation

### Tasks

- initialize Next.js route
- install shadcn/ui
- add fonts
- set up CSS variables and theme tokens
- create app shell
- create top bar
- create side nav

### Deliverable

Static shell with correct overall layout

---

## Phase 2 — device table

### Tasks

- define device types
- add mock device data
- build `DeviceTable`
- build `DeviceTableToolbar`
- build `DeviceTableRow`
- add row selection behavior
- build `StatusDot`

### Deliverable

Functional left panel with selectable rows

---

## Phase 3 — command panel

### Tasks

- build `ConnectionBadge`
- build `CommandCard`
- build `DeviceCommandPanel`
- build `UpdateConfigurationCard`
- build `TimingParamsCard`
- build `ImmediateExecutionCard`
- add local form validation

### Deliverable

Functional right panel using reusable card shell

---

## Phase 4 — terminal feed

### Tasks

- define terminal log type
- add mock log data
- build `MqttTerminalFeed`
- build `TerminalToolbar`
- build `TerminalLogList`
- build `TerminalLogLine`
- add pause/filter UI state

### Deliverable

Working terminal panel with structured logs

---

## Phase 5 — polish

### Tasks

- reduce repeated classes into variants
- add hover/active/focus states
- improve spacing consistency
- validate dark theme fidelity
- test keyboard accessibility
- add loading and empty states

### Deliverable

Production-quality UI pass

---

## Phase 6 — data integration

### Tasks

- connect devices to API
- connect selected device detail to API
- connect command actions to mutations
- connect terminal feed to stream
- add toasts and error states

### Deliverable

Live dashboard behavior

---

## 17. Implementation Order Recommendation

Build in this exact order:

1. tokens and theme
2. app shell
3. top bar
4. side nav
5. status dot and icon button primitives
6. device table
7. connection badge
8. command card
9. update configuration card
10. timing params card
11. immediate execution card
12. terminal feed
13. mock state wiring
14. responsive refinements
15. API integration

This order minimizes rework and keeps the screen usable early.

---

## 18. Risks and Mitigations

## Risk: too many tiny components

### Mitigation

Only extract pieces that have:

- repeated structure
- repeated styling
- separate state/logic
- clear domain meaning

## Risk: duplicated Tailwind classes

### Mitigation

Use:

- `cva`
- shared wrapper components
- token-based classes

## Risk: over-generalizing too early

### Mitigation

Keep SimCon-specific components in `components/simcon`, not `components/ui`

## Risk: terminal performance with many logs

### Mitigation

Start simple, then add:

- capped log history
- virtualization if needed

## Risk: table becoming hard to manage

### Mitigation

Start with plain table markup, adopt TanStack Table only if sorting/filtering grows significantly

---

## 19. Definition of Done

The implementation is complete when:

- the dashboard is fully rendered in Next.js
- static HTML is fully replaced with React components
- theme tokens are centralized
- component boundaries are clean and maintainable
- left device panel is selectable
- right command cards are functional and validated
- terminal feed is data-driven
- major repeated UI patterns are abstracted
- code is ready for API integration
- desktop layout matches the original design closely

---

## 20. Final Recommended Component List

### Layout

- `AppShell`
- `TopBar`
- `SideNav`
- `PanelHeader`

### SimCon feature components

- `SimconDashboard`
- `DeviceTable`
- `DeviceTableToolbar`
- `DeviceTableHeader`
- `DeviceTableRow`
- `DeviceCommandPanel`
- `CommandCard`
- `UpdateConfigurationCard`
- `TimingParamsCard`
- `ImmediateExecutionCard`
- `MqttTerminalFeed`
- `TerminalToolbar`
- `TerminalLogList`
- `TerminalLogLine`

### Shared UI

- `StatusDot`
- `ConnectionBadge`
- `IconButton`
- `AppSearchInput`
- `MonoLabel`
- `NumericText`
- `InlineNote`
- `SectionCard`

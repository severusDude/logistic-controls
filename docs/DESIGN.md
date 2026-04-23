---
name: Industrial Precision
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#bdc8d1'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#87929a'
  outline-variant: '#3e484f'
  surface-tint: '#7bd0ff'
  primary: '#8ed5ff'
  on-primary: '#00354a'
  primary-container: '#38bdf8'
  on-primary-container: '#004965'
  inverse-primary: '#00668a'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#ffc174'
  on-tertiary: '#472a00'
  tertiary-container: '#f59e0b'
  on-tertiary-container: '#613b00'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#c4e7ff'
  primary-fixed-dim: '#7bd0ff'
  on-primary-fixed: '#001e2c'
  on-primary-fixed-variant: '#004c69'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  h1:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  h2:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  mono-label:
    fontFamily: Space Grotesk
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  data-numeric:
    fontFamily: Space Grotesk
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.02em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  grid-gutter: 12px
  container-margin: 24px
---

## Brand & Style

This design system is engineered for mission-critical logistics and IoT infrastructure management. The brand personality is authoritative, resilient, and precise, designed to evoke a sense of absolute control and high trust in high-stakes environments. 

The aesthetic leverages a **Modern Industrial** style—a hybrid of high-density functionalism and sleek, dark-mode sophistication. It avoids unnecessary decoration in favor of structural clarity and data prominence. The visual language utilizes subtle tectonic layering and sharp definition to create a digital "control room" experience that remains performant and legible during extended monitoring sessions.

## Colors

The palette is anchored by a deep slate and charcoal foundation to minimize eye strain and maximize the "pop" of critical status data. 

- **Foundation:** The background utilizes a near-black slate (`#020617`), while component surfaces use a slightly lighter charcoal (`#0F172A`) to create subtle depth.
- **Telemetry & Action:** Electric Blue (`#38BDF8`) is reserved for primary actions, active telemetry streams, and focus states.
- **Status Indicators:** These use high-chroma "signal" colors for immediate cognitive recognition:
    - **Emerald Green:** System online, healthy throughput, or successful validation.
    - **Ruby Red:** Critical failure, offline status, or hardware danger.
    - **Amber:** Latency warnings, maintenance required, or throttled states.
- **Borders:** Low-contrast slate borders define the structure without creating visual noise.

## Typography

This design system prioritizes data density and rapid scanning. **Inter** is the primary typeface for its exceptional legibility in UI contexts. For technical readouts and labels, **Space Grotesk** is utilized to provide a subtly "technical" or "engineered" feel that distinguishes telemetry data from UI instructions.

- **Scale:** Small font sizes (13px/14px) are the standard for body and data to allow for complex dashboards.
- **Case:** Use ALL CAPS for `mono-label` elements to denote metadata, sensor IDs, and technical headers.
- **Numerics:** All sensor data and timestamps should utilize tabular lining (mono-spacing for numbers) to ensure columns of data remain aligned during live updates.

## Layout & Spacing

The layout utilizes a **12-column fluid grid** designed to adapt from widescreen monitoring stations to ruggedized tablets. 

- **Density:** A strict 4px baseline grid ensures tight alignment. Padding in data tables and command cards is compressed to maximize "information above the fold."
- **Rhythm:** Gutters are kept narrow (12px) to maintain a cohesive "dashboard" feel, preventing widgets from feeling disconnected.
- **Terminal Area:** The live feed area should be anchored to the bottom or right-hand sidebar, occupying a fixed-height container with internal scrolling to preserve main-screen stability.

## Elevation & Depth

Depth is communicated through **Tonal Layering** rather than traditional shadows. In an industrial context, shadows can muddy the interface and reduce contrast.

- **Base Layer:** The darkest slate (`#020617`) for the application background.
- **Surface Layer:** Secondary slate (`#0F172A`) for cards and containers, appearing "raised" through contrast.
- **Stroke Definition:** Elements are separated by 1px solid borders (`#1E293B`). 
- **Interactive Depth:** On hover, buttons and interactive cards utilize a subtle "inner glow" or a slightly brighter border stroke rather than a drop shadow.
- **Active Overlay:** Modals use a backdrop blur (12px) with a 60% opacity dark overlay to isolate critical interactions.

## Shapes

The shape language is **Soft (0.25rem)**. This provides a modern touch that slightly softens the "brutalist" nature of a dark dashboard while maintaining a professional, rigid structure.

- **Standard Radius:** 4px for buttons, inputs, and small cards.
- **Large Radius:** 8px (rounded-lg) for main dashboard widgets and primary containers.
- **Interactive Elements:** Checkboxes and radio buttons maintain sharp, 2px rounded corners to emphasize precision.

## Components

- **Data Tables:** High-density rows (32px height). Header cells use `mono-label` typography with a subtle bottom border. Use alternating "zebra" stripes only on hover to maintain clarity.
- **Command Cards:** Compact containers for device control. Must include a "Validation Strip" on the left edge—a 4px vertical color bar indicating current status (Emerald, Ruby, etc.).
- **Buttons:**
    - **Primary:** Solid Electric Blue with white text.
    - **Ghost:** 1px Slate border with transparent background, turning Electric Blue on hover.
    - **Danger:** Ruby Red outline with Red text, solid Red on hover.
- **Terminal Feed:** A dedicated area with a black background, featuring monospaced text. Success logs in Emerald, errors in Ruby, and timestamps in low-opacity Slate.
- **Input Fields:** Dark background with a 1px border. The border glows Electric Blue on focus. Error states trigger a Ruby Red border and a small warning icon.
- **Telemetry Chips:** Small, pill-shaped indicators for "Live" status, featuring a pulsing 6px dot next to the label.
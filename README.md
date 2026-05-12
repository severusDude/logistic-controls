# Logistic Controls

Research prototype for IoT-based package tracking. Scope is intentionally small: 1 mobile device, 1 facility, and 2-3 deterministic RFID package tags. This repo is not a production logistics platform.

Core workflow:

```text
RFID package scan + GPS telemetry
  -> ESP32/Wokwi simulated device
  -> Mosquitto MQTT broker
  -> backend worker
  -> PostgreSQL/Prisma
  -> Next.js API and dashboard
```

## Scope

In scope:

- Simulated ESP32 mobile device with RFID and GPS behavior
- Local MQTT broker for telemetry, scan, heartbeat, and command topics
- Backend validation, raw event persistence, device state updates, package event updates
- PostgreSQL/Prisma data model for research evidence
- Operator/research dashboard and API verification routes

Out of scope:

- Customer portal
- Production RBAC
- Live map
- Geofence
- Notifications or email
- ETA or route optimization
- Multi-tenant deployment
- Production security hardening
- Large fleet or large package-scale tests

## Stack

- Next.js 16
- React 19
- Prisma 7
- PostgreSQL
- MQTT.js
- Mosquitto
- ESP32/Wokwi simulation
- PlatformIO

## Key Routes

- `/simcon` - research dashboard
- `/api/health` - health check
- `/api/devices` - device list
- `/api/devices/{deviceId}` - device detail
- `/api/internal/raw-events` - raw MQTT event evidence
- `/api/packages/{trackingId}/timeline` - package timeline
- `/api/realtime/stream` - SSE snapshot feed

## Local Setup

1. Install dependencies:

```bash
pnpm install
```

2. Copy `.env.example` to `.env`.

3. Ensure PostgreSQL is running and `DATABASE_URL` points to a valid database.

4. Start local Mosquitto:

```bash
pnpm broker:up
```

5. Generate Prisma client:

```bash
pnpm db:generate
```

6. Seed research data:

```bash
pnpm db:seed
```

7. Run backend worker in one terminal:

```bash
pnpm worker:dev
```

8. Run Next.js app in another terminal:

```bash
pnpm dev
```

9. Open `http://localhost:3000/simcon`.

## Environment

Expected local variables are documented in `.env.example`:

- `DATABASE_URL`
- `MQTT_URL`
- `MQTT_USERNAME`
- `MQTT_PASSWORD`
- `MQTT_CLIENT_ID`
- `JWT_SECRET`
- `BCRYPT_ROUNDS`

Seed credentials are also documented in `.env.example`.

## Verification

Basic checks:

```bash
pnpm lint
pnpm build
```

Optional end-to-end checks:

- Confirm broker, database, worker, and app are running
- Visit `/simcon`
- Check `/api/health`
- Check `/api/devices`
- Check `/api/internal/raw-events`
- Check `/api/packages/{trackingId}/timeline`
- Check `/api/realtime/stream`

## Scripts

- `pnpm dev` - start Next.js dev server
- `pnpm build` - build app
- `pnpm start` - start production build locally
- `pnpm lint` - run ESLint
- `pnpm db:generate` - generate Prisma client
- `pnpm db:migrate` - run Prisma migration in dev mode
- `pnpm db:seed` - seed research data
- `pnpm worker:dev` - start MQTT/backend worker
- `pnpm broker:up` - start Mosquitto container
- `pnpm broker:down` - stop compose services

## Documentation

- [Product Requirement Documentation](docs/PRD_GPS_Logistic_Package_Tracking_MVP.md)
- [Backend Documentation](docs/IoT_Backend_Implementation_Technical_Documentation.md)
- [Frontend Documentation](docs/IoT_Frontend_Implementation_Technical_Documentation.md)
- [IoT Documentation](docs/IoT_Device_Implementation_Technical_Documentation.md)
- [Design Documentation](docs/DESIGN.md)

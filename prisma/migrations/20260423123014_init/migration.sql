-- CreateEnum
CREATE TYPE "DeviceType" AS ENUM ('mobile', 'fixed');

-- CreateEnum
CREATE TYPE "DeviceStatus" AS ENUM ('online', 'offline', 'warning', 'idle');

-- CreateEnum
CREATE TYPE "PackageStatus" AS ENUM ('registered', 'picked_up', 'in_transit', 'at_hub', 'out_for_delivery', 'delivered', 'exception');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('operator', 'warehouse_staff');

-- CreateEnum
CREATE TYPE "CommandStatus" AS ENUM ('queued', 'published', 'acked', 'failed');

-- CreateEnum
CREATE TYPE "AlertSeverity" AS ENUM ('info', 'warning', 'critical');

-- CreateEnum
CREATE TYPE "RawEventType" AS ENUM ('telemetry', 'scan', 'heartbeat', 'cmd');

-- CreateTable
CREATE TABLE "Facility" (
    "id" TEXT NOT NULL,
    "facilityCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "locationName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Facility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "displayName" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserFacilityScope" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "facilityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserFacilityScope_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Device" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "deviceType" "DeviceType" NOT NULL,
    "deviceRole" TEXT NOT NULL,
    "facilityId" TEXT,
    "locationName" TEXT,
    "status" "DeviceStatus" NOT NULL DEFAULT 'idle',
    "lastSeenAt" TIMESTAMP(3),
    "lastHeartbeatAt" TIMESTAMP(3),
    "lastTelemetryAt" TIMESTAMP(3),
    "lastLat" DECIMAL(9,6),
    "lastLng" DECIMAL(9,6),
    "gpsFix" BOOLEAN,
    "batteryPct" INTEGER,
    "wifiRssi" INTEGER,
    "signalStrength" TEXT,
    "uptimeSec" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Package" (
    "id" TEXT NOT NULL,
    "trackingId" TEXT NOT NULL,
    "rfidEpc" TEXT NOT NULL,
    "status" "PackageStatus" NOT NULL DEFAULT 'registered',
    "currentDeviceId" TEXT,
    "currentFacilityId" TEXT,
    "lastKnownLat" DECIMAL(9,6),
    "lastKnownLng" DECIMAL(9,6),
    "lastEventAt" TIMESTAMP(3),
    "eta" TIMESTAMP(3),
    "senderName" TEXT NOT NULL,
    "senderAddress" TEXT NOT NULL,
    "recipientName" TEXT NOT NULL,
    "recipientAddress" TEXT NOT NULL,
    "recipientEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Package_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PackageEvent" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "status" "PackageStatus",
    "scanContext" TEXT,
    "deviceId" TEXT,
    "facilityId" TEXT,
    "locationName" TEXT,
    "lat" DECIMAL(9,6),
    "lng" DECIMAL(9,6),
    "timestampUtc" TIMESTAMP(3) NOT NULL,
    "rawPayload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PackageEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeviceTelemetry" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "sequenceNo" INTEGER,
    "timestampUtc" TIMESTAMP(3) NOT NULL,
    "lat" DECIMAL(9,6) NOT NULL,
    "lng" DECIMAL(9,6) NOT NULL,
    "altitudeM" DOUBLE PRECISION,
    "accuracyM" DOUBLE PRECISION,
    "headingDeg" DOUBLE PRECISION,
    "speedKmh" DOUBLE PRECISION,
    "activePackageCount" INTEGER,
    "batteryPct" INTEGER,
    "signalStrength" TEXT,
    "gpsFix" BOOLEAN NOT NULL,
    "rawPayload" JSONB NOT NULL,
    "ingestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeviceTelemetry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeviceHeartbeat" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "timestampUtc" TIMESTAMP(3) NOT NULL,
    "uptimeSec" INTEGER,
    "statusText" TEXT,
    "rfidReaderStatus" TEXT,
    "gpsFix" BOOLEAN,
    "packagesScannedToday" INTEGER,
    "wifiRssi" INTEGER,
    "rawPayload" JSONB NOT NULL,
    "ingestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeviceHeartbeat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL,
    "alertId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "severity" "AlertSeverity" NOT NULL,
    "deviceId" TEXT,
    "packageId" TEXT,
    "message" TEXT NOT NULL,
    "targetRoles" JSONB NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "acknowledgedByUserId" TEXT,
    "triggeredAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeviceCommand" (
    "id" TEXT NOT NULL,
    "commandId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "command" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "requestedByUserId" TEXT,
    "status" "CommandStatus" NOT NULL DEFAULT 'queued',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeviceCommand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RawMqttEvent" (
    "id" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "deviceId" TEXT,
    "eventType" "RawEventType" NOT NULL,
    "qos" INTEGER,
    "retain" BOOLEAN,
    "payload" JSONB NOT NULL,
    "schemaVersion" TEXT,
    "ingestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RawMqttEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Facility_facilityCode_key" ON "Facility"("facilityCode");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserFacilityScope_userId_facilityId_key" ON "UserFacilityScope"("userId", "facilityId");

-- CreateIndex
CREATE UNIQUE INDEX "Device_deviceId_key" ON "Device"("deviceId");

-- CreateIndex
CREATE UNIQUE INDEX "Package_trackingId_key" ON "Package"("trackingId");

-- CreateIndex
CREATE UNIQUE INDEX "Package_rfidEpc_key" ON "Package"("rfidEpc");

-- CreateIndex
CREATE UNIQUE INDEX "PackageEvent_eventId_key" ON "PackageEvent"("eventId");

-- CreateIndex
CREATE INDEX "PackageEvent_packageId_timestampUtc_idx" ON "PackageEvent"("packageId", "timestampUtc" DESC);

-- CreateIndex
CREATE INDEX "DeviceTelemetry_deviceId_timestampUtc_idx" ON "DeviceTelemetry"("deviceId", "timestampUtc" DESC);

-- CreateIndex
CREATE INDEX "DeviceTelemetry_deviceId_sequenceNo_idx" ON "DeviceTelemetry"("deviceId", "sequenceNo");

-- CreateIndex
CREATE INDEX "DeviceHeartbeat_deviceId_timestampUtc_idx" ON "DeviceHeartbeat"("deviceId", "timestampUtc" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "Alert_alertId_key" ON "Alert"("alertId");

-- CreateIndex
CREATE UNIQUE INDEX "DeviceCommand_commandId_key" ON "DeviceCommand"("commandId");

-- CreateIndex
CREATE INDEX "RawMqttEvent_deviceId_ingestedAt_idx" ON "RawMqttEvent"("deviceId", "ingestedAt" DESC);

-- AddForeignKey
ALTER TABLE "UserFacilityScope" ADD CONSTRAINT "UserFacilityScope_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFacilityScope" ADD CONSTRAINT "UserFacilityScope_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Package" ADD CONSTRAINT "Package_currentDeviceId_fkey" FOREIGN KEY ("currentDeviceId") REFERENCES "Device"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Package" ADD CONSTRAINT "Package_currentFacilityId_fkey" FOREIGN KEY ("currentFacilityId") REFERENCES "Facility"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageEvent" ADD CONSTRAINT "PackageEvent_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageEvent" ADD CONSTRAINT "PackageEvent_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageEvent" ADD CONSTRAINT "PackageEvent_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceTelemetry" ADD CONSTRAINT "DeviceTelemetry_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceHeartbeat" ADD CONSTRAINT "DeviceHeartbeat_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_acknowledgedByUserId_fkey" FOREIGN KEY ("acknowledgedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceCommand" ADD CONSTRAINT "DeviceCommand_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceCommand" ADD CONSTRAINT "DeviceCommand_requestedByUserId_fkey" FOREIGN KEY ("requestedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

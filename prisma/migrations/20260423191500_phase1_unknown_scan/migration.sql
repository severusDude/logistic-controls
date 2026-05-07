-- CreateTable
CREATE TABLE "UnknownScan" (
    "id" TEXT NOT NULL,
    "eventId" TEXT,
    "deviceId" TEXT,
    "facilityId" TEXT,
    "rfidEpc" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "timestampUtc" TIMESTAMP(3) NOT NULL,
    "rawPayload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UnknownScan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UnknownScan_eventId_key" ON "UnknownScan"("eventId");

-- CreateIndex
CREATE INDEX "UnknownScan_rfidEpc_timestampUtc_idx" ON "UnknownScan"("rfidEpc", "timestampUtc" DESC);

-- AddForeignKey
ALTER TABLE "UnknownScan" ADD CONSTRAINT "UnknownScan_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnknownScan" ADD CONSTRAINT "UnknownScan_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE SET NULL ON UPDATE CASCADE;

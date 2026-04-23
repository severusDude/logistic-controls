import bcrypt from "bcryptjs";
import { parseArgs } from "util";

import "dotenv/config";
import { env } from "prisma/config";
import { loadEnvConfig } from "@next/env";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  DeviceStatus,
  DeviceType,
  PackageStatus,
  PrismaClient,
  UserRole,
} from "@/generated/prisma/client";

const projectDir = process.cwd();
loadEnvConfig(projectDir);

// Create separate Prisma Client instance for seeding
const adapter = new PrismaPg({ connectionString: env("DATABASE_URL") });
const prisma = new PrismaClient({ adapter });

const options = {
  environment: { type: "string" as const },
};

async function seedDevelopment(prisma: PrismaClient) {
  const facility = await prisma.facility.upsert({
    where: { facilityCode: "jkt-wh-01" },
    update: {
      name: "Jakarta Warehouse 01",
      locationName: "Jakarta Warehouse Truck 007",
    },
    create: {
      facilityCode: "jkt-wh-01",
      name: "Jakarta Warehouse 01",
      locationName: "Jakarta Warehouse Truck 007",
    },
  });

  const [operatorPasswordHash, warehousePasswordHash] = await Promise.all([
    bcrypt.hash("operator123!", process.env.BCRYPT_ROUNDS!),
    bcrypt.hash("warehouse123!", process.env.BCRYPT_ROUNDS!),
  ]);

  const operator = await prisma.user.upsert({
    where: { email: "operator@logistics.local" },
    update: {
      displayName: "Local Operator",
      passwordHash: operatorPasswordHash,
      role: UserRole.operator,
      isActive: true,
    },
    create: {
      email: "operator@logistics.local",
      displayName: "Local Operator",
      passwordHash: operatorPasswordHash,
      role: UserRole.operator,
      isActive: true,
    },
  });

  const warehouseUser = await prisma.user.upsert({
    where: { email: "warehouse.jkt@logistics.local" },
    update: {
      displayName: "Jakarta Warehouse Staff",
      passwordHash: warehousePasswordHash,
      role: UserRole.warehouse_staff,
      isActive: true,
    },
    create: {
      email: "warehouse.jkt@logistics.local",
      displayName: "Jakarta Warehouse Staff",
      passwordHash: warehousePasswordHash,
      role: UserRole.warehouse_staff,
      isActive: true,
    },
  });

  await prisma.userFacilityScope.upsert({
    where: {
      userId_facilityId: {
        userId: warehouseUser.id,
        facilityId: facility.id,
      },
    },
    update: {},
    create: {
      userId: warehouseUser.id,
      facilityId: facility.id,
    },
  });

  const device = await prisma.device.upsert({
    where: { deviceId: "DEV-TRUCK-001" },
    update: {
      deviceType: DeviceType.mobile,
      deviceRole: "truck",
      facilityId: facility.id,
      locationName: "Jakarta Warehouse Truck 007",
      status: DeviceStatus.idle,
      gpsFix: false,
      signalStrength: "unknown",
    },
    create: {
      deviceId: "DEV-TRUCK-001",
      deviceType: DeviceType.mobile,
      deviceRole: "truck",
      facilityId: facility.id,
      locationName: "Jakarta Warehouse Truck 007",
      status: DeviceStatus.idle,
      gpsFix: false,
      signalStrength: "unknown",
    },
  });

  const packages = [
    {
      trackingId: "PKG-20260423-001",
      rfidEpc: "LOG-04A1B2C3",
      senderName: "Jakarta Fulfillment",
      senderAddress: "Jl. Sudirman No. 10, Jakarta",
      recipientName: "PT Nusantara Retail",
      recipientAddress: "Jl. Pemuda No. 15, Bekasi",
      recipientEmail: "ops-bekasi@example.local",
    },
    {
      trackingId: "PKG-20260423-002",
      rfidEpc: "LOG-07D4E5F6",
      senderName: "Jakarta Fulfillment",
      senderAddress: "Jl. Sudirman No. 10, Jakarta",
      recipientName: "CV Sinar Logistik",
      recipientAddress: "Jl. Margonda Raya No. 3, Depok",
      recipientEmail: "receiving-depok@example.local",
    },
    {
      trackingId: "PKG-20260423-003",
      rfidEpc: "LOG-09A7C8D1",
      senderName: "Jakarta Fulfillment",
      senderAddress: "Jl. Sudirman No. 10, Jakarta",
      recipientName: "Budi Santoso",
      recipientAddress: "Jl. Asia Afrika No. 8, Bandung",
      recipientEmail: "budi@example.local",
    },
  ] as const;

  for (const pkg of packages) {
    await prisma.package.upsert({
      where: { trackingId: pkg.trackingId },
      update: {
        rfidEpc: pkg.rfidEpc,
        status: PackageStatus.registered,
        currentFacilityId: facility.id,
        currentDeviceId: null,
        senderName: pkg.senderName,
        senderAddress: pkg.senderAddress,
        recipientName: pkg.recipientName,
        recipientAddress: pkg.recipientAddress,
        recipientEmail: pkg.recipientEmail,
      },
      create: {
        trackingId: pkg.trackingId,
        rfidEpc: pkg.rfidEpc,
        status: PackageStatus.registered,
        currentFacilityId: facility.id,
        currentDeviceId: null,
        senderName: pkg.senderName,
        senderAddress: pkg.senderAddress,
        recipientName: pkg.recipientName,
        recipientAddress: pkg.recipientAddress,
        recipientEmail: pkg.recipientEmail,
      },
    });
  }

  console.log(
    JSON.stringify(
      {
        seeded: true,
        facility: facility.facilityCode,
        operator: operator.email,
        warehouseUser: warehouseUser.email,
        device: device.deviceId,
        packageCount: packages.length,
      },
      null,
      2,
    ),
  );
}

async function seedProduction(prisma: PrismaClient) {
  // Production seeding is intentionally minimal (no test users/packages/devices).
  // Add any essential reference data here if needed (e.g. default roles, system settings).
  console.log("Production environment seeded (minimal configuration)");
}

async function main() {
  const {
    values: { environment },
  } = parseArgs({ options });

  switch (environment) {
    case "development":
      await seedDevelopment(prisma);
      break;
    case "production":
      await seedProduction(prisma);
      break;
    default:
      throw new Error(
        "Please specify environment: --environment=development or --environment=production",
      );
  }

  console.log("Seeding complete");

  return;
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("Seeding failed: ", e);
    await prisma.$disconnect();
    process.exit(1);
  });

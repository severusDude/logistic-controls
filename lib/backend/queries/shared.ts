import { Prisma } from "@/generated/prisma/client";

export function decimalToNumber(value: Prisma.Decimal | null | undefined) {
  return value ? value.toNumber() : null;
}

export function decimalPoint(
  lat: Prisma.Decimal | null | undefined,
  lng: Prisma.Decimal | null | undefined,
) {
  const latValue = decimalToNumber(lat);
  const lngValue = decimalToNumber(lng);

  if (latValue === null || lngValue === null) {
    return null;
  }

  return {
    lat: latValue,
    lng: lngValue,
  };
}

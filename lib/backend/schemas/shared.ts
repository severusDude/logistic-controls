import { z } from "zod";

export const schemaVersionLiteral = z.literal("2.0");

export const timestampString = z
  .string()
  .datetime({ offset: true })
  .transform((value, ctx) => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid timestamp",
      });

      return z.NEVER;
    }

    return date;
  });

export const latLngSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

export function parseTimestamp(value: string) {
  const result = timestampString.safeParse(value);
  return result.success ? result.data : null;
}

import { z } from "zod";

export const locationSearchSchema = z.object({
  query: z.string().trim().min(2).max(100),
});

export const forecastQuerySchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  name: z.string().trim().min(1).max(100),
  country: z.string().trim().max(100).optional().default(""),
  country_code: z.string().trim().max(2).optional().default(""),
  timezone: z.string().trim().max(100).optional().default("auto"),
});

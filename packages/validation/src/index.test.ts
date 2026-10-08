import { describe, expect, it } from "vitest";
import { forecastQuerySchema, locationSearchSchema } from "./index";

describe("weather request validation", () => {
  it("normalizes valid city searches and rejects too-short input", () => {
    expect(locationSearchSchema.parse({ query: "  Manila  " }).query).toBe(
      "Manila",
    );
    expect(locationSearchSchema.safeParse({ query: "a" }).success).toBe(false);
  });

  it("coerces and bounds coordinates", () => {
    expect(
      forecastQuerySchema.parse({
        latitude: "14.6",
        longitude: "120.9",
        name: "Manila",
      }).latitude,
    ).toBe(14.6);
    expect(
      forecastQuerySchema.safeParse({
        latitude: "100",
        longitude: "120",
        name: "Invalid",
      }).success,
    ).toBe(false);
  });
});

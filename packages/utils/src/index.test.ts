import { describe, expect, it } from "vitest";
import { formatDate, weatherDescription, weatherIcon } from "./index";

describe("formatDate", () => {
  it("returns a non-empty localized date", () =>
    expect(formatDate("2025-01-15T00:00:00.000Z").length).toBeGreaterThan(0));
});

describe("weather presentation helpers", () => {
  it("maps weather codes into shared plain-language summaries", () => {
    expect(weatherDescription(61)).toBe("Rain");
    expect(weatherDescription(0)).toBe("Clear sky");
  });

  it("accounts for day and night when showing clear conditions", () => {
    expect(weatherIcon(0, true)).toBe("☀️");
    expect(weatherIcon(0, false)).toBe("🌙");
  });
});

import { locationSearchSchema } from "@demo/validation";
import type { WeatherLocation } from "@demo/types";
import { fail, ok, openMeteo } from "../../../../lib/weather-api";

type GeocodingResponse = {
  results?: Array<{
    id: number;
    name: string;
    admin1?: string;
    country?: string;
    country_code?: string;
    latitude: number;
    longitude: number;
    timezone?: string;
  }>;
};

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q");
  const parsed = locationSearchSchema.safeParse({ query });
  if (!parsed.success) {
    return fail(
      400,
      "INVALID_LOCATION_QUERY",
      "Enter at least two characters to search",
    );
  }

  try {
    const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
    url.search = new URLSearchParams({
      name: parsed.data.query,
      count: "6",
      language: "en",
      format: "json",
    }).toString();
    const result = await openMeteo<GeocodingResponse>(url);
    const locations: WeatherLocation[] = (result.results ?? []).map(
      (place) => ({
        id: place.id,
        name: place.name,
        ...(place.admin1 ? { admin1: place.admin1 } : {}),
        country: place.country ?? "",
        country_code: place.country_code ?? "",
        latitude: place.latitude,
        longitude: place.longitude,
        timezone: place.timezone ?? "auto",
      }),
    );
    return ok(locations);
  } catch (error) {
    console.error("Location search failed", error);
    return fail(
      502,
      "WEATHER_PROVIDER_UNAVAILABLE",
      "Location search is temporarily unavailable",
    );
  }
}

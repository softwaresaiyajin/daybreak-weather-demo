import type {
  ApiErrorBody,
  WeatherForecast,
  WeatherLocation,
} from "@demo/types";

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
    public details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export type ApiClientOptions = { baseUrl: string };

export function createWeatherApi({ baseUrl }: ApiClientOptions) {
  async function request<T>(path: string): Promise<T> {
    let response: Response;
    try {
      response = await fetch(`${baseUrl.replace(/\/$/, "")}${path}`);
    } catch {
      throw new ApiError(
        "NETWORK_ERROR",
        "Unable to reach the weather service",
        0,
      );
    }

    if (!response.ok) {
      const body = (await response
        .json()
        .catch(() => null)) as ApiErrorBody | null;
      throw new ApiError(
        body?.error.code ?? "REQUEST_FAILED",
        body?.error.message ?? "The weather request failed",
        response.status,
        body?.error.details,
      );
    }

    const body = (await response.json()) as { data: T };
    return body.data;
  }

  return {
    searchLocations: (query: string) =>
      request<WeatherLocation[]>(
        `/api/weather/locations?q=${encodeURIComponent(query)}`,
      ),
    forecast: (location: WeatherLocation) => {
      const params = new URLSearchParams({
        latitude: String(location.latitude),
        longitude: String(location.longitude),
        name: location.name,
        country: location.country,
        country_code: location.country_code,
        timezone: location.timezone,
      });
      return request<WeatherForecast>(`/api/weather/forecast?${params}`);
    },
  };
}

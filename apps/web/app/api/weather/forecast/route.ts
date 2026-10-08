import { forecastQuerySchema } from "@demo/validation";
import type { WeatherForecast, WeatherLocation } from "@demo/types";
import { fail, ok, openMeteo } from "../../../../lib/weather-api";

type ForecastResponse = {
  current: {
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    weather_code: number;
    is_day: number;
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
    sunrise: string[];
    sunset: string[];
  };
};

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const parsed = forecastQuerySchema.safeParse(Object.fromEntries(params));
  if (!parsed.success)
    return fail(400, "INVALID_COORDINATES", "A valid location is required");

  const { latitude, longitude, name, country, country_code, timezone } =
    parsed.data;
  const location: WeatherLocation = {
    id: 0,
    name,
    country,
    country_code,
    latitude,
    longitude,
    timezone,
  };
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.search = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current:
      "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m",
    daily:
      "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset",
    forecast_days: "7",
    timezone: timezone || "auto",
  }).toString();

  try {
    const result = await openMeteo<ForecastResponse>(url);
    const forecast: WeatherForecast = {
      location,
      current: {
        time: result.current.time,
        temperature: result.current.temperature_2m,
        feels_like: result.current.apparent_temperature,
        humidity: result.current.relative_humidity_2m,
        wind_speed: result.current.wind_speed_10m,
        weather_code: result.current.weather_code,
        is_day: result.current.is_day === 1,
      },
      days: result.daily.time.map((date, index) => ({
        date,
        weather_code: result.daily.weather_code[index] ?? 0,
        temperature_max: result.daily.temperature_2m_max[index] ?? 0,
        temperature_min: result.daily.temperature_2m_min[index] ?? 0,
        precipitation_probability:
          result.daily.precipitation_probability_max[index] ?? 0,
        sunrise: result.daily.sunrise[index] ?? "",
        sunset: result.daily.sunset[index] ?? "",
      })),
      updated_at: new Date().toISOString(),
    };
    return ok(forecast);
  } catch (error) {
    console.error("Weather forecast failed", error);
    return fail(
      502,
      "WEATHER_PROVIDER_UNAVAILABLE",
      "Forecast data is temporarily unavailable",
    );
  }
}

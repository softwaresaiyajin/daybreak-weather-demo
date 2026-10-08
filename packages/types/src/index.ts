export type WeatherLocation = {
  id: number;
  name: string;
  admin1?: string;
  country: string;
  country_code: string;
  latitude: number;
  longitude: number;
  timezone: string;
};

export type CurrentWeather = {
  time: string;
  temperature: number;
  feels_like: number;
  humidity: number;
  wind_speed: number;
  weather_code: number;
  is_day: boolean;
};

export type ForecastDay = {
  date: string;
  weather_code: number;
  temperature_max: number;
  temperature_min: number;
  precipitation_probability: number;
  sunrise: string;
  sunset: string;
};

export type WeatherForecast = {
  location: WeatherLocation;
  current: CurrentWeather;
  days: ForecastDay[];
  updated_at: string;
};

export type ApiErrorBody = {
  error: { code: string; message: string; details?: unknown };
};

import { createWeatherApi } from "@demo/api";
export const api = createWeatherApi({
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "",
});

import { createWeatherApi } from "@demo/api";
declare const process: { env: { EXPO_PUBLIC_API_URL?: string } };
export const api = createWeatherApi({
  baseUrl: process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000",
});

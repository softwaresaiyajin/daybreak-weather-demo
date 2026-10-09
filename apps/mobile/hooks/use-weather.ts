import { useCallback, useEffect, useState } from "react";
import type { WeatherForecast, WeatherLocation } from "@demo/types";
import { api } from "../lib/api";

const homeLocation: WeatherLocation = {
  id: 0,
  name: "Manila",
  admin1: "Metro Manila",
  country: "Philippines",
  country_code: "PH",
  latitude: 14.5995,
  longitude: 120.9842,
  timezone: "Asia/Manila",
};

export function useWeather() {
  const [location, setLocation] = useState(homeLocation);
  const [forecast, setForecast] = useState<WeatherForecast | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<WeatherLocation[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const loadForecast = useCallback(async (place: WeatherLocation) => {
    setBusy(true);
    setError("");
    try {
      setForecast(await api.forecast(place));
    } catch (cause) {
      setError((cause as Error).message);
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    void loadForecast(homeLocation);
  }, [loadForecast]);

  const search = useCallback(async () => {
    const term = query.trim();
    if (term.length < 2) return;

    setBusy(true);
    setError("");
    try {
      const matches = await api.searchLocations(term);
      setResults(matches);
      setShowResults(true);
      if (!matches.length) setError("No places found. Try another city.");
    } catch (cause) {
      setError((cause as Error).message);
    } finally {
      setBusy(false);
    }
  }, [query]);

  const chooseLocation = useCallback(
    (place: WeatherLocation) => {
      setLocation(place);
      setQuery(place.name);
      setShowResults(false);
      void loadForecast(place);
    },
    [loadForecast],
  );

  return {
    busy,
    chooseLocation,
    error,
    forecast,
    loadForecast: () => loadForecast(location),
    query,
    results,
    search,
    setQuery,
    showResults,
  };
}

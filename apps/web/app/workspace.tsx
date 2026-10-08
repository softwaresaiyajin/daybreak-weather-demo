"use client";

import { FormEvent, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { WeatherLocation } from "@demo/types";
import { weatherDescription, weatherIcon } from "@demo/utils";
import { api } from "../lib/api";

export function Workspace() {
  const [query, setQuery] = useState("Manila");
  const [locations, setLocations] = useState<WeatherLocation[]>([]);
  const [selected, setSelected] = useState<WeatherLocation | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [showResults, setShowResults] = useState(false);

  async function search(term: string) {
    setSearching(true);
    setSearchError("");
    try {
      const results = await api.searchLocations(term);
      setLocations(results);
      setShowResults(true);
      if (!results.length)
        setSearchError("No places found. Try a nearby city.");
    } catch (error) {
      setSearchError((error as Error).message);
    } finally {
      setSearching(false);
    }
  }

  useEffect(() => {
    void api
      .searchLocations("Manila")
      .then((results) => {
        setLocations(results);
        setSelected(results[0] ?? null);
      })
      .catch((error: Error) => setSearchError(error.message));
  }, []);

  const forecast = useQuery({
    queryKey: ["weather", selected?.id],
    queryFn: () => api.forecast(selected!),
    enabled: !!selected,
    staleTime: 5 * 60 * 1000,
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    if (query.trim().length >= 2) void search(query.trim());
  }

  return (
    <main className="weather-app">
      <header className="weather-nav">
        <a className="weather-brand" href="/">
          <span className="weather-brand-icon">✳</span> daybreak
        </a>
        <div className="shared-badge">
          <span /> One forecast, every screen
        </div>
        <span className="provider-label">SHARED WEATHER API</span>
      </header>

      <section className="weather-content">
        <div className="weather-intro">
          <p className="eyebrow">YOUR LITTLE WINDOW TO THE WORLD</p>
          <h1>Weather, wherever you are.</h1>
          <p>Clear skies or not, know what the day has in store.</p>
        </div>

        <div className="weather-search-wrap">
          <form className="weather-search" onSubmit={submit}>
            <span aria-hidden="true">⌕</span>
            <input
              aria-label="Search a city"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search a city or place"
            />
            <button disabled={searching || query.trim().length < 2}>
              {searching ? "Searching…" : "Find weather"}
            </button>
          </form>
          {showResults && locations.length > 0 && (
            <div
              className="location-results"
              role="listbox"
              aria-label="Matching places"
            >
              {locations.map((location) => (
                <button
                  key={location.id}
                  role="option"
                  aria-selected={selected?.id === location.id}
                  onClick={() => {
                    setSelected(location);
                    setQuery(location.name);
                    setShowResults(false);
                  }}
                >
                  <span>
                    {location.name}
                    {location.admin1 ? `, ${location.admin1}` : ""}
                  </span>
                  <small>{location.country}</small>
                </button>
              ))}
            </div>
          )}
        </div>
        {searchError && <p className="weather-error">{searchError}</p>}

        {forecast.isLoading && (
          <div className="weather-loading">
            <span className="weather-spinner" /> Gathering the forecast…
          </div>
        )}
        {forecast.isError && (
          <div className="weather-error forecast-error">
            {(forecast.error as Error).message}
            <button onClick={() => forecast.refetch()}>Try again</button>
          </div>
        )}
        {forecast.data && (
          <>
            <section className="current-weather">
              <div className="current-copy">
                <p className="eyebrow">
                  CURRENT CONDITIONS <span>·</span>{" "}
                  {new Intl.DateTimeFormat(undefined, {
                    weekday: "long",
                    hour: "numeric",
                    minute: "2-digit",
                  }).format(new Date(forecast.data.current.time))}
                </p>
                <h2>{forecast.data.location.name}</h2>
                <p className="current-place">
                  {[
                    forecast.data.location.admin1,
                    forecast.data.location.country,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
                <div className="current-temp">
                  {Math.round(forecast.data.current.temperature)}
                  <span>°</span>
                </div>
                <p className="current-condition">
                  {weatherDescription(forecast.data.current.weather_code)}
                </p>
              </div>
              <div className="current-art" aria-hidden="true">
                {weatherIcon(
                  forecast.data.current.weather_code,
                  forecast.data.current.is_day,
                )}
              </div>
              <div className="weather-metrics">
                <div>
                  <span>FEELS LIKE</span>
                  <strong>
                    {Math.round(forecast.data.current.feels_like)}°
                  </strong>
                </div>
                <div>
                  <span>HUMIDITY</span>
                  <strong>{forecast.data.current.humidity}%</strong>
                </div>
                <div>
                  <span>WIND</span>
                  <strong>
                    {Math.round(forecast.data.current.wind_speed)}{" "}
                    <small>km/h</small>
                  </strong>
                </div>
              </div>
            </section>

            <section className="forecast-section">
              <div className="forecast-heading">
                <div>
                  <p className="eyebrow">AHEAD OF YOU</p>
                  <h2>7-day forecast</h2>
                </div>
                <span className="forecast-unit">
                  °C <i>·</i> KM/H
                </span>
              </div>
              <div className="forecast-grid">
                {forecast.data.days.map((day, index) => (
                  <article
                    className={`forecast-day ${index === 0 ? "today" : ""}`}
                    key={day.date}
                  >
                    <p>
                      {index === 0
                        ? "Today"
                        : new Intl.DateTimeFormat(undefined, {
                            weekday: "short",
                          }).format(new Date(`${day.date}T12:00:00`))}
                    </p>
                    <span
                      className="day-icon"
                      aria-label={weatherDescription(day.weather_code)}
                    >
                      {weatherIcon(day.weather_code)}
                    </span>
                    <strong>{Math.round(day.temperature_max)}°</strong>
                    <span className="day-low">
                      {Math.round(day.temperature_min)}°
                    </span>
                    <small className="rain-chance">
                      {day.precipitation_probability}% <span>rain</span>
                    </small>
                  </article>
                ))}
              </div>
            </section>
          </>
        )}

        <footer className="weather-footer">
          <span>
            Weather data by{" "}
            <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">
              Open-Meteo
            </a>
          </span>
          <span>Shared types · shared API · platform-native UI</span>
        </footer>
      </section>
    </main>
  );
}

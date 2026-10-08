/** Human-readable date formatting shared by web and native presentations. */
export function formatDate(isoDate: string): string {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
    new Date(isoDate),
  );
}

export function weatherDescription(code: number): string {
  if (code === 0) return "Clear sky";
  if (code === 1) return "Mainly clear";
  if (code === 2) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if (code === 45 || code === 48) return "Foggy";
  if ([51, 53, 55, 56, 57].includes(code)) return "Drizzle";
  if ([61, 63, 65, 66, 67].includes(code)) return "Rain";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "Snow";
  if ([80, 81, 82].includes(code)) return "Rain showers";
  if ([95, 96, 97, 99].includes(code)) return "Thunderstorms";
  return "Variable conditions";
}

export function weatherIcon(code: number, isDay = true): string {
  if (code === 0) return isDay ? "☀️" : "🌙";
  if (code === 1 || code === 2) return isDay ? "🌤️" : "☁️";
  if (code === 3) return "☁️";
  if (code === 45 || code === 48) return "🌫️";
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code))
    return "🌧️";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "❄️";
  if ([95, 96, 97, 99].includes(code)) return "⛈️";
  return "🌡️";
}

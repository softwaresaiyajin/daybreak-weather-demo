# Daybreak — shared weather data for web and native

A weather demo showing how a Next.js web client and an Expo app for iOS and Android can use the same data layer while keeping their UI and navigation platform-specific. The apps share weather types, a fetch client, weather-code utilities, and request schemas. The Next.js REST API adapts Open-Meteo's location and forecast responses into one stable app contract.

## Architecture

```text
 Open-Meteo Geocoding + Forecast APIs
                 │
         Next.js REST routes
     normalize · validate · cache
                 │
       packages/api + types
      validation + utilities
          ┌──────┴──────┐
          │             │
     Next.js web    Expo native
       App Router   iOS + Android
       HTML/CSS     React Native UI
```

## What is shared?

| Concern                    | Shared?     | Location                   | Reason                                                   |
| -------------------------- | ----------- | -------------------------- | -------------------------------------------------------- |
| Weather/location models    | Yes         | `packages/types`           | One contract for results on every platform               |
| HTTP API client            | Yes         | `packages/api`             | Same routes, success envelope, and error handling        |
| Query validation           | Yes         | `packages/validation`      | The API validates the same search/coordinate constraints |
| Weather descriptions/icons | Yes         | `packages/utils`           | Pure mapping from WMO code to presentation labels        |
| Provider integration       | One backend | `apps/web/app/api/weather` | Keeps provider response shape out of the clients         |
| UI, navigation, styling    | No          | `apps/web`, `apps/mobile`  | Browser layout and native interaction patterns differ    |

The Expo app is one React Native codebase for iOS and Android. The data layer is shared TypeScript; screens, safe areas, keyboard behavior, and styling remain platform-appropriate.

## Data flow

1. A screen calls `searchLocations()` or `forecast()` from `packages/api`.
2. The shared client sends a request to the same REST endpoint on every platform.
3. Next.js validates parameters and calls Open-Meteo from the server.
4. The route maps the provider payload to `WeatherLocation` or `WeatherForecast` and returns `{ data }`.
5. The shared client converts errors to `ApiError`; each UI controls loading, selection, refresh, and empty/error states.

Open-Meteo documents the [forecast endpoint](https://open-meteo.com/en/docs) and [geocoding endpoint](https://open-meteo.com/en/docs/geocoding-api). The forecast API provides hourly/daily model variables; this app requests current conditions and seven daily values. The API returns numeric WMO weather codes, which `packages/utils` maps to shared descriptions/icons. Weather and geocoding data are attributed in both app interfaces.

## Run it

Requirements: Node.js 20+ and pnpm 10. For mobile, install Expo Go or use an iOS/Android simulator.

```bash
pnpm install
pnpm dev:web       # Next.js at http://localhost:3000
pnpm dev:mobile    # Expo development server
```

The web app uses same-origin API requests. To test on a physical phone, copy `apps/mobile/.env.example` to `apps/mobile/.env`, then set `EXPO_PUBLIC_API_URL` to `http://<computer-lan-ip>:3000`; `localhost` on the phone points to the phone itself.

```bash
pnpm typecheck
pnpm lint
pnpm test
```

## Repository map

```text
apps/web/              Next.js UI and weather REST API routes
apps/mobile/           Expo Router app for iOS and Android
packages/api/          Shared fetch client and weather endpoints
packages/types/        Shared weather domain contracts
packages/validation/   Shared Zod request schemas
packages/utils/        Platform-independent weather-code helpers
```

## Architecture decisions

- **Why a REST boundary?** Both clients depend on our normalized `WeatherForecast` contract rather than Open-Meteo's raw fields. A provider change or response transformation happens once in the API.
- **Why call the provider on the server?** It keeps external-provider behavior behind one boundary, gives one place for caching and error translation, and avoids coupling native and web screens to provider-specific payloads.
- **State management:** web uses TanStack Query for cached forecast data and refetch states. Mobile uses local screen state and pull-to-refresh. The API functions and contracts are shared; each platform's cache and interaction policy stays near its UI.
- **Platform separation:** Next components, browser styling, Expo navigation, React Native controls, keyboard handling, and safe areas stay in their respective apps.

## Limitations

The demo has no user accounts or saved locations. Forecast requests use the public Open-Meteo endpoints and cache responses for a short period. Check the provider's [terms and service information](https://open-meteo.com/en/terms) before using it commercially or at production scale; the API provider can change quotas or access terms.

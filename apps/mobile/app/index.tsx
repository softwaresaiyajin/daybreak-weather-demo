import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { weatherDescription, weatherIcon } from "@demo/utils";
import { useWeather } from "../hooks/use-weather";

export default function Home() {
  const {
    busy,
    chooseLocation,
    error,
    forecast,
    loadForecast,
    query,
    results,
    search,
    setQuery,
    showResults,
  } = useWeather();

  return (
    <SafeAreaView style={s.safe}>
      <FlatList
        data={forecast?.days ?? []}
        keyExtractor={(day) => day.date}
        refreshControl={
          <RefreshControl
            refreshing={busy}
            onRefresh={() => loadForecast()}
            tintColor="#34766c"
          />
        }
        ListHeaderComponent={
          <>
            <View style={s.header}>
              <View>
                <Text style={s.kicker}>DAYBREAK / WEATHER</Text>
                <Text style={s.title}>Your forecast</Text>
              </View>
              <View style={s.apiBadge}>
                <Text style={s.apiBadgeText}>LIVE</Text>
              </View>
            </View>
            <Text style={s.subtitle}>A little clarity for the day ahead.</Text>

            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
              <View style={s.searchRow}>
                <TextInput
                  style={s.searchInput}
                  placeholder="Search a city"
                  value={query}
                  onChangeText={setQuery}
                  onSubmitEditing={search}
                  returnKeyType="search"
                />
                <Pressable
                  style={s.searchButton}
                  onPress={search}
                  disabled={busy}
                >
                  <Text style={s.searchButtonText}>⌕</Text>
                </Pressable>
              </View>
            </KeyboardAvoidingView>
            {showResults &&
              results.map((place) => (
                <Pressable
                  key={place.id}
                  style={s.resultRow}
                  onPress={() => chooseLocation(place)}
                >
                  <Text style={s.resultName}>
                    {place.name}
                    {place.admin1 ? `, ${place.admin1}` : ""}
                  </Text>
                  <Text style={s.resultCountry}>{place.country}</Text>
                </Pressable>
              ))}
            {error ? <Text style={s.error}>{error}</Text> : null}
            {forecast ? (
              <>
                <View style={s.currentCard}>
                  <View style={s.currentTop}>
                    <View style={s.currentText}>
                      <Text style={s.locationName}>
                        {forecast.location.name}
                      </Text>
                      <Text style={s.locationDetail}>
                        {forecast.location.admin1
                          ? `${forecast.location.admin1}, `
                          : ""}
                        {forecast.location.country}
                      </Text>
                      <Text style={s.condition}>
                        {weatherDescription(forecast.current.weather_code)}
                      </Text>
                    </View>
                    <Text style={s.weatherGlyph}>
                      {weatherIcon(
                        forecast.current.weather_code,
                        forecast.current.is_day,
                      )}
                    </Text>
                  </View>
                  <Text style={s.temperature}>
                    {Math.round(forecast.current.temperature)}°
                  </Text>
                  <Text style={s.feelsLike}>
                    Feels like {Math.round(forecast.current.feels_like)}°
                  </Text>
                  <View style={s.metrics}>
                    <View style={s.metric}>
                      <Text style={s.metricLabel}>HUMIDITY</Text>
                      <Text style={s.metricValue}>
                        {forecast.current.humidity}%
                      </Text>
                    </View>
                    <View style={s.metric}>
                      <Text style={s.metricLabel}>WIND</Text>
                      <Text style={s.metricValue}>
                        {Math.round(forecast.current.wind_speed)} km/h
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={s.forecastHeader}>
                  <View>
                    <Text style={s.sectionEyebrow}>PLAN AHEAD</Text>
                    <Text style={s.sectionTitle}>Next 7 days</Text>
                  </View>
                  {busy && <ActivityIndicator color="#34766c" />}
                </View>
              </>
            ) : busy ? (
              <View style={s.loading}>
                <ActivityIndicator size="large" color="#34766c" />
                <Text style={s.loadingText}>Finding your forecast…</Text>
              </View>
            ) : null}
          </>
        }
        renderItem={({ item, index }) => (
          <View style={s.dayRow}>
            <View style={s.dayName}>
              <Text style={s.dayLabel}>
                {index === 0
                  ? "Today"
                  : new Intl.DateTimeFormat(undefined, {
                      weekday: "short",
                    }).format(new Date(`${item.date}T12:00:00`))}
              </Text>
              <Text style={s.dayDate}>
                {new Intl.DateTimeFormat(undefined, {
                  month: "short",
                  day: "numeric",
                }).format(new Date(`${item.date}T12:00:00`))}
              </Text>
            </View>
            <Text style={s.dayIcon}>{weatherIcon(item.weather_code)}</Text>
            <View style={s.dayTemps}>
              <Text style={s.dayHigh}>{Math.round(item.temperature_max)}°</Text>
              <Text style={s.dayLow}>{Math.round(item.temperature_min)}°</Text>
            </View>
            <Text style={s.rain}>{item.precipitation_probability}%</Text>
          </View>
        )}
        ListEmptyComponent={
          !busy && forecast ? (
            <Text style={s.empty}>Forecast isn’t available right now.</Text>
          ) : null
        }
        ListFooterComponent={
          <Text style={s.attribution}>Weather data by Open-Meteo</Text>
        }
        contentContainerStyle={s.list}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f5f8f5", paddingHorizontal: 21 },
  list: { paddingBottom: 26 },
  header: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  kicker: {
    fontSize: 9,
    letterSpacing: 1.6,
    fontWeight: "700",
    color: "#82948a",
  },
  title: {
    fontSize: 29,
    fontWeight: "700",
    letterSpacing: -0.8,
    color: "#24332f",
    marginTop: 8,
  },
  apiBadge: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#e3f0e9",
  },
  apiBadgeText: {
    fontSize: 9,
    letterSpacing: 0.8,
    fontWeight: "700",
    color: "#3d7964",
  },
  subtitle: { color: "#839089", fontSize: 13, marginTop: 8, marginBottom: 21 },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderColor: "#e3eae3",
    borderWidth: 1,
    borderRadius: 11,
    padding: 5,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
    color: "#24332f",
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#397a6c",
    alignItems: "center",
    justifyContent: "center",
  },
  searchButtonText: { color: "#fff", fontSize: 23 },
  resultRow: {
    padding: 13,
    marginBottom: 5,
    backgroundColor: "#fff",
    borderRadius: 8,
  },
  resultName: { color: "#263630", fontWeight: "600", fontSize: 13 },
  resultCountry: { color: "#8b978f", fontSize: 11, marginTop: 3 },
  error: { color: "#a45543", fontSize: 12, marginVertical: 8 },
  currentCard: {
    backgroundColor: "#e9f2e9",
    borderRadius: 19,
    padding: 21,
    marginTop: 5,
    overflow: "hidden",
  },
  currentTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  currentText: { flex: 1 },
  locationName: { fontSize: 20, fontWeight: "700", color: "#253b33" },
  locationDetail: { fontSize: 11, color: "#71867c", marginTop: 4 },
  condition: { fontSize: 13, color: "#59796b", marginTop: 13 },
  weatherGlyph: { fontSize: 53, marginTop: -6 },
  temperature: {
    fontSize: 66,
    lineHeight: 77,
    fontWeight: "300",
    letterSpacing: -4,
    color: "#273e35",
    marginTop: 3,
  },
  feelsLike: { fontSize: 11, color: "#6f857a", marginTop: -1 },
  metrics: {
    borderTopWidth: 1,
    borderTopColor: "#d4e2d5",
    marginTop: 20,
    paddingTop: 15,
    flexDirection: "row",
    gap: 33,
  },
  metric: { gap: 5 },
  metricLabel: {
    color: "#83958a",
    fontSize: 8,
    letterSpacing: 1.1,
    fontWeight: "700",
  },
  metricValue: { color: "#344b40", fontSize: 13, fontWeight: "600" },
  forecastHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 27,
    marginBottom: 12,
  },
  sectionEyebrow: {
    color: "#8c9a90",
    fontSize: 8,
    letterSpacing: 1.4,
    fontWeight: "700",
  },
  sectionTitle: {
    color: "#263630",
    fontSize: 17,
    fontWeight: "700",
    marginTop: 4,
  },
  dayRow: {
    minHeight: 65,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderColor: "#e9eee8",
    borderWidth: 1,
    borderRadius: 11,
    paddingHorizontal: 13,
    marginBottom: 7,
  },
  dayName: { flex: 1 },
  dayLabel: { color: "#304239", fontSize: 12, fontWeight: "600" },
  dayDate: { color: "#9aa49d", fontSize: 10, marginTop: 4 },
  dayIcon: { fontSize: 21, marginHorizontal: 12 },
  dayTemps: {
    flexDirection: "row",
    gap: 10,
    width: 71,
    justifyContent: "flex-end",
  },
  dayHigh: { color: "#33473d", fontSize: 12, fontWeight: "600" },
  dayLow: { color: "#9aa49d", fontSize: 12 },
  rain: { width: 35, textAlign: "right", color: "#5c91a0", fontSize: 10 },
  loading: { alignItems: "center", padding: 45 },
  loadingText: { color: "#7b8d83", marginTop: 12, fontSize: 12 },
  empty: { textAlign: "center", color: "#839089", paddingVertical: 20 },
  attribution: {
    color: "#9aa49d",
    fontSize: 10,
    textAlign: "center",
    marginTop: 18,
  },
});

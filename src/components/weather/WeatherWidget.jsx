import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cloud,
  CloudRain,
  Wind,
  Droplets,
  Thermometer,
  AlertTriangle,
  Flame,
  Sun,
  CloudDrizzle,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const getWeatherIcon = (conditions) => {
  const lower = conditions?.toLowerCase() || "";
  if (lower.includes("rain")) return CloudRain;
  if (lower.includes("cloud")) return Cloud;
  if (lower.includes("drizzle")) return CloudDrizzle;
  if (lower.includes("clear") || lower.includes("sunny")) return Sun;
  return Cloud;
};

const getFireRiskColor = (index) => {
  if (index >= 75)
    return {
      bg: "bg-red-500",
      text: "text-red-700",
      label: "Extreme",
      border: "border-red-300",
    };
  if (index >= 50)
    return {
      bg: "bg-orange-500",
      text: "text-orange-700",
      label: "High",
      border: "border-orange-300",
    };
  if (index >= 25)
    return {
      bg: "bg-yellow-500",
      text: "text-yellow-700",
      label: "Moderate",
      border: "border-yellow-300",
    };
  return {
    bg: "bg-green-500",
    text: "text-green-700",
    label: "Low",
    border: "border-green-300",
  };
};

export default function WeatherWidget({ zoneId, zoneName, coordinates }) {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [error, setError] = useState(null);

  const fetchWeatherData = async () => {
    if (!coordinates || !coordinates.lat || !coordinates.lng) {
      setError("No coordinates available");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get real-time weather data using LLM with internet access
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Get current real-time weather data for coordinates ${coordinates.lat}, ${coordinates.lng}. Search for the exact location's current weather conditions. Provide accurate numbers for: temperature (°F), humidity (%), wind speed (mph), precipitation today (inches), weather condition description, calculate a fire weather index (0-100 where higher means more fire risk based on heat, low humidity, wind), list any weather alerts as strings, and 24-hour forecast with high/low temps and other details.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            temperature: { type: "number" },
            humidity: { type: "number" },
            wind_speed: { type: "number" },
            precipitation: { type: "number" },
            conditions: { type: "string" },
            fire_weather_index: { type: "number" },
            alerts: { type: "array", items: { type: "string" } },
            forecast_24h: {
              type: "object",
              properties: {
                high_temp: { type: "number" },
                low_temp: { type: "number" },
                precipitation_chance: { type: "number" },
                wind_gust: { type: "number" },
              },
            },
          },
        },
      });

      if (!result || typeof result.temperature !== "number") {
        throw new Error("Invalid weather data received");
      }

      // Save to database
      if (zoneId) {
        try {
          await base44.entities.WeatherData.create({
            zone_id: zoneId,
            timestamp: new Date().toISOString(),
            ...result,
          });
        } catch (dbError) {
          console.warn("Could not save to database:", dbError);
        }
      }

      setWeatherData(result);
      setLastUpdate(new Date());
      setError(null);
    } catch (error) {
      console.error("Weather fetch error:", error);
      setError("Unable to fetch weather data. Please try again.");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (coordinates) {
      fetchWeatherData();
    }
  }, [zoneId]);

  useEffect(() => {
    if (autoRefresh && coordinates && weatherData) {
      const interval = setInterval(fetchWeatherData, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, weatherData]);

  const WeatherIcon = weatherData
    ? getWeatherIcon(weatherData.conditions)
    : Cloud;
  const fireRisk = weatherData
    ? getFireRiskColor(weatherData.fire_weather_index)
    : getFireRiskColor(0);

  return (
    <Card className="border-[#40916C]/20 overflow-hidden">
      <CardHeader className="pb-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Live Weather</CardTitle>
            <p className="text-xs text-gray-500">{zoneName || "Loading..."}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchWeatherData}
            disabled={loading}
            className="rounded-xl"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#40916C]" />
            ) : (
              <RefreshCw className="w-4 h-4 text-[#40916C]" />
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <AnimatePresence mode="wait">
          {error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8"
            >
              <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-3">{error}</p>
              <Button
                onClick={fetchWeatherData}
                size="sm"
                className="bg-[#40916C] hover:bg-[#2D6A4F] rounded-xl"
              >
                Try Again
              </Button>
            </motion.div>
          ) : loading && !weatherData ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8"
            >
              <Loader2 className="w-8 h-8 animate-spin text-[#40916C] mx-auto mb-2" />
              <p className="text-sm text-gray-500">
                Fetching live weather data...
              </p>
            </motion.div>
          ) : weatherData ? (
            <motion.div
              key="data"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* Current Conditions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#40916C]/20 to-[#52B788]/20 flex items-center justify-center">
                    <WeatherIcon className="w-8 h-8 text-[#2D6A4F]" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-[#0F2E1D]">
                      {weatherData.temperature}°F
                    </div>
                    <div className="text-sm text-gray-500 capitalize">
                      {weatherData.conditions}
                    </div>
                  </div>
                </div>
              </div>

              {/* Weather Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Droplets className="w-4 h-4 text-[#40916C]" />
                    <span className="text-xs text-gray-600">Humidity</span>
                  </div>
                  <div className="text-xl font-bold text-[#0F2E1D]">
                    {weatherData.humidity}%
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Wind className="w-4 h-4 text-[#40916C]" />
                    <span className="text-xs text-gray-600">Wind</span>
                  </div>
                  <div className="text-xl font-bold text-[#0F2E1D]">
                    {weatherData.wind_speed} mph
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <CloudRain className="w-4 h-4 text-[#40916C]" />
                    <span className="text-xs text-gray-600">Precip</span>
                  </div>
                  <div className="text-xl font-bold text-[#0F2E1D]">
                    {weatherData.precipitation}"
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Thermometer className="w-4 h-4 text-[#40916C]" />
                    <span className="text-xs text-gray-600">24h Range</span>
                  </div>
                  <div className="text-sm font-bold text-[#0F2E1D]">
                    {weatherData.forecast_24h?.low_temp}° -{" "}
                    {weatherData.forecast_24h?.high_temp}°
                  </div>
                </div>
              </div>

              {/* Fire Weather Index */}
              <div
                className={`bg-gradient-to-br from-${fireRisk.bg}/10 to-${fireRisk.bg}/5 rounded-xl p-4 border ${fireRisk.border}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Flame className={`w-5 h-5 ${fireRisk.text}`} />
                    <span className="font-semibold text-[#0F2E1D]">
                      Fire Risk Index
                    </span>
                  </div>
                  <Badge
                    className={`${fireRisk.text} bg-white border ${fireRisk.border}`}
                  >
                    {fireRisk.label}
                  </Badge>
                </div>
                <Progress
                  value={weatherData.fire_weather_index}
                  className="h-2 mb-1"
                />
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Index: {weatherData.fire_weather_index}/100</span>
                  <span>
                    Updated{" "}
                    {lastUpdate
                      ? new Date(lastUpdate).toLocaleTimeString()
                      : "now"}
                  </span>
                </div>
              </div>

              {/* Weather Alerts */}
              {weatherData.alerts && weatherData.alerts.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-amber-900 text-sm mb-1">
                        Weather Alerts
                      </p>
                      {weatherData.alerts.map((alert, idx) => (
                        <p key={idx} className="text-xs text-amber-700">
                          {alert}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Auto-refresh Toggle */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="text-xs text-gray-500">
                  Auto-refresh every 5 min
                </span>
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`text-xs px-3 py-1 rounded-lg transition-colors ${
                    autoRefresh
                      ? "bg-[#40916C] text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {autoRefresh ? "ON" : "OFF"}
                </button>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

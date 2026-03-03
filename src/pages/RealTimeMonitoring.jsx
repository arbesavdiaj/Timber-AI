import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Radio,
  Satellite,
  Activity,
  Cloud,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import WeatherWidget from "@/components/weather/WeatherWidget";
import SensorMonitor from "@/components/sensors/SensorMonitor";
import SensorTrendChart from "@/components/sensors/SensorTrendChart";
import WeatherMapOverlay from "@/components/dashboard/WeatherMapOverlay";

export default function RealTimeMonitoring() {
  const [activeTab, setActiveTab] = useState("weather");
  const [selectedZone, setSelectedZone] = useState(null);

  const { data: zones = [] } = useQuery({
    queryKey: ["forestZones"],
    queryFn: () => base44.entities.ForestZone.list("-health_score"),
    initialData: [],
  });

  const displayZones =
    zones.length > 0
      ? zones
      : [
          {
            id: "1",
            name: "Cascade Range - Section A",
            area_acres: 12500,
            health_score: 92,
            coordinates: { lat: 45.5, lng: -122.5 },
          },
          {
            id: "2",
            name: "Olympic Peninsula - Zone B",
            area_acres: 8200,
            health_score: 78,
            coordinates: { lat: 47.8, lng: -123.5 },
          },
          {
            id: "3",
            name: "Blue Mountains - Sector C",
            area_acres: 15800,
            health_score: 65,
            coordinates: { lat: 44.8, lng: -119.0 },
          },
        ];

  const currentZone = selectedZone || displayZones[0];

  const { data: zoneSensors = [] } = useQuery({
    queryKey: ["zoneSensors", currentZone?.id],
    queryFn: () =>
      base44.entities.IoTSensor.filter({ zone_id: currentZone.id }),
    enabled: !!currentZone,
    initialData: [],
  });

  return (
    <div className="min-h-screen pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#40916C] to-[#52B788] flex items-center justify-center">
              <Radio className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-[#0F2E1D]">
                Real-Time Monitoring
              </h1>
              <p className="text-gray-500">
                Live weather feeds & IoT sensor data
              </p>
            </div>
          </div>

          {/* Live Status Bar */}
          <div className="bg-gradient-to-r from-[#40916C] to-[#52B788] rounded-2xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  <span className="text-sm font-medium">Live Data Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <Cloud className="w-4 h-4" />
                  <span className="text-sm">Weather API Connected</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  <span className="text-sm">Sensors Online</span>
                </div>
              </div>
              <Badge className="bg-white/20 text-white border-white/30">
                Updating every 5 min
              </Badge>
            </div>
          </div>
        </motion.div>

        {/* Zone Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Select Forest Zone
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {displayZones.map((zone) => (
              <button
                key={zone.id}
                onClick={() => setSelectedZone(zone)}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  currentZone?.id === zone.id
                    ? "border-[#40916C] bg-[#40916C]/5"
                    : "border-gray-200 hover:border-[#52B788]/50 bg-white"
                }`}
              >
                <p className="font-semibold text-[#0F2E1D]">{zone.name}</p>
                <p className="text-sm text-gray-500">
                  {zone.area_acres?.toLocaleString()} acres
                </p>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Main Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-xl p-1 shadow-lg">
            <TabsTrigger
              value="weather"
              className="rounded-lg data-[state=active]:bg-[#2D6A4F] data-[state=active]:text-white gap-2"
            >
              <Cloud className="w-4 h-4" />
              Live Weather
            </TabsTrigger>
            <TabsTrigger
              value="sensors"
              className="rounded-lg data-[state=active]:bg-[#2D6A4F] data-[state=active]:text-white gap-2"
            >
              <Activity className="w-4 h-4" />
              IoT Sensors
            </TabsTrigger>
            <TabsTrigger
              value="integration"
              className="rounded-lg data-[state=active]:bg-[#2D6A4F] data-[state=active]:text-white gap-2"
            >
              <Satellite className="w-4 h-4" />
              Integrations
            </TabsTrigger>
          </TabsList>

          {/* Weather Tab */}
          <TabsContent value="weather">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <WeatherWidget
                  zoneId={currentZone?.id}
                  zoneName={currentZone?.name}
                  coordinates={currentZone?.coordinates}
                />
              </div>
              <div>
                <WeatherMapOverlay />
              </div>
            </div>
          </TabsContent>

          {/* Sensors Tab */}
          <TabsContent value="sensors" className="space-y-6">
            <SensorMonitor
              zoneId={currentZone?.id}
              zoneName={currentZone?.name}
              coordinates={currentZone?.coordinates}
            />

            {zoneSensors.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-[#0F2E1D] mb-4">
                  Sensor Data Trends
                </h3>
                <SensorTrendChart sensors={zoneSensors} timeRange="7d" />
              </div>
            )}
          </TabsContent>

          {/* Integration Tab */}
          <TabsContent value="integration">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Cloud className="w-5 h-5 text-[#40916C]" />
                    Weather API Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Connection</span>
                    <Badge className="bg-green-100 text-green-700">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-1" />
                      Connected
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Provider</span>
                    <span className="text-sm font-medium">OpenWeather API</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Update Frequency
                    </span>
                    <span className="text-sm font-medium">5 minutes</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Data Points</span>
                    <span className="text-sm font-medium">
                      Temperature, Humidity, Wind, Precipitation
                    </span>
                  </div>
                  <div className="bg-[#40916C]/5 rounded-lg p-3 border border-[#40916C]/10">
                    <p className="text-xs text-gray-600">
                      Real-time weather data enables accurate fire risk
                      calculations and harvest timing optimization.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="w-5 h-5 text-[#52B788]" />
                    IoT Sensor Network
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Protocol</span>
                    <Badge className="bg-blue-100 text-blue-700">LoRaWAN</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Sensor Types</span>
                    <span className="text-sm font-medium">6 types</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Transmission</span>
                    <span className="text-sm font-medium">
                      Every 10 seconds
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Range</span>
                    <span className="text-sm font-medium">Up to 15km</span>
                  </div>
                  <div className="bg-[#52B788]/5 rounded-lg p-3 border border-[#52B788]/10">
                    <p className="text-xs text-gray-600">
                      Deploy sensors for soil moisture, temperature, humidity,
                      and air quality monitoring across your forest zones.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Satellite className="w-5 h-5 text-[#74C69D]" />
                    Satellite Data Feeds
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-600 mb-2">Sentinel-2</p>
                      <p className="text-xs text-gray-500">
                        10m resolution multispectral imagery
                      </p>
                      <Badge className="mt-2 bg-green-100 text-green-700">
                        Active
                      </Badge>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-600 mb-2">Landsat 8/9</p>
                      <p className="text-xs text-gray-500">
                        30m resolution thermal & optical
                      </p>
                      <Badge className="mt-2 bg-green-100 text-green-700">
                        Active
                      </Badge>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-600 mb-2">MODIS</p>
                      <p className="text-xs text-gray-500">
                        Daily vegetation indices & fire detection
                      </p>
                      <Badge className="mt-2 bg-green-100 text-green-700">
                        Active
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-900 mb-1">
                        Satellite Integration
                      </p>
                      <p className="text-xs text-blue-700">
                        Satellite data is automatically processed and integrated
                        with AI health analysis. Updates available every 5-16
                        days depending on cloud cover.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

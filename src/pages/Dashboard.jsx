import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Map, BarChart3, List, RefreshCw, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import MapView from "@/components/dashboard/MapView";
import AnalyticsPanel from "@/components/dashboard/AnalyticsPanel";
import ZonesList from "@/components/dashboard/ZonesList";
import WeatherWidget from "@/components/weather/WeatherWidget";
import AlertsPanel from "@/components/alerts/AlertsPanel";
import AlertMonitor from "@/components/alerts/AlertMonitor";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("map");
  const [selectedZone, setSelectedZone] = useState(null);

  const {
    data: zones = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["forestZones"],
    queryFn: () => base44.entities.ForestZone.list("-health_score"),
    refetchInterval: 30000, // Auto-refresh every 30 seconds
    initialData: [],
  });

  const { data: weatherData = [] } = useQuery({
    queryKey: ["allWeatherData"],
    queryFn: async () => {
      const weather = [];
      for (const zone of zones.length > 0 ? zones : displaySampleZones) {
        const zoneWeather = await base44.entities.WeatherData.filter(
          { zone_id: zone.id },
          "-timestamp",
          1,
        );
        if (zoneWeather.length > 0) {
          weather.push(zoneWeather[0]);
        }
      }
      return weather;
    },
    refetchInterval: 60000, // Refresh weather every minute
    enabled: zones.length > 0,
  });

  // Expanded sample data covering all US regions
  const displaySampleZones = [
    // Pacific Northwest
    {
      id: "1",
      name: "Cascade Range - Oregon",
      area_acres: 12500,
      health_score: 92,
      canopy_density: 78,
      drought_stress: "low",
      pest_risk: "minimal",
      fire_risk: "low",
      recommended_action:
        "Continue current management. Schedule routine monitoring for Q2.",
      timber_yield_estimate: 4200000,
      carbon_sequestration: 18500,
      coordinates: { lat: 45.5, lng: -122.5 },
    },
    {
      id: "2",
      name: "Olympic Peninsula - Washington",
      area_acres: 8200,
      health_score: 78,
      canopy_density: 82,
      drought_stress: "moderate",
      pest_risk: "low",
      fire_risk: "moderate",
      recommended_action:
        "Increase irrigation monitoring. Consider selective thinning in dense areas.",
      timber_yield_estimate: 2800000,
      carbon_sequestration: 12200,
      coordinates: { lat: 47.8, lng: -123.5 },
    },
    // Northern Rockies
    {
      id: "3",
      name: "Bitterroot Valley - Montana",
      area_acres: 15800,
      health_score: 65,
      canopy_density: 62,
      drought_stress: "high",
      pest_risk: "moderate",
      fire_risk: "high",
      recommended_action:
        "Priority: Implement fire breaks. Conduct bark beetle assessment.",
      timber_yield_estimate: 5100000,
      carbon_sequestration: 22800,
      coordinates: { lat: 46.2, lng: -114.1 },
    },
    // Southwest
    {
      id: "4",
      name: "Coconino Forest - Arizona",
      area_acres: 9800,
      health_score: 54,
      canopy_density: 55,
      drought_stress: "severe",
      pest_risk: "high",
      fire_risk: "extreme",
      recommended_action:
        "URGENT: Deploy fire prevention measures. Pest treatment required.",
      timber_yield_estimate: 3200000,
      carbon_sequestration: 14200,
      coordinates: { lat: 35.1, lng: -111.6 },
    },
    // Great Lakes
    {
      id: "5",
      name: "Superior National Forest - Minnesota",
      area_acres: 11200,
      health_score: 85,
      canopy_density: 76,
      drought_stress: "low",
      pest_risk: "low",
      fire_risk: "low",
      recommended_action:
        "Maintain current practices. Monitor for invasive species.",
      timber_yield_estimate: 3800000,
      carbon_sequestration: 16500,
      coordinates: { lat: 47.9, lng: -90.5 },
    },
    // Northeast
    {
      id: "6",
      name: "Green Mountains - Vermont",
      area_acres: 7600,
      health_score: 88,
      canopy_density: 81,
      drought_stress: "low",
      pest_risk: "minimal",
      fire_risk: "low",
      recommended_action:
        "Optimal conditions. Consider selective harvesting in mature stands.",
      timber_yield_estimate: 2500000,
      carbon_sequestration: 11800,
      coordinates: { lat: 44.0, lng: -72.7 },
    },
    {
      id: "7",
      name: "White Mountains - New Hampshire",
      area_acres: 9400,
      health_score: 79,
      canopy_density: 74,
      drought_stress: "low",
      pest_risk: "moderate",
      fire_risk: "low",
      recommended_action:
        "Monitor for emerald ash borer. Continue sustainable practices.",
      timber_yield_estimate: 3100000,
      carbon_sequestration: 13900,
      coordinates: { lat: 44.3, lng: -71.3 },
    },
    // Southeast
    {
      id: "8",
      name: "Chattahoochee Forest - Georgia",
      area_acres: 8900,
      health_score: 81,
      canopy_density: 77,
      drought_stress: "moderate",
      pest_risk: "moderate",
      fire_risk: "moderate",
      recommended_action:
        "Monitor drought conditions. Implement controlled burns as planned.",
      timber_yield_estimate: 2900000,
      carbon_sequestration: 13200,
      coordinates: { lat: 34.7, lng: -84.0 },
    },
    {
      id: "9",
      name: "Pisgah National Forest - North Carolina",
      area_acres: 10500,
      health_score: 86,
      canopy_density: 79,
      drought_stress: "low",
      pest_risk: "low",
      fire_risk: "low",
      recommended_action:
        "Excellent health. Continue biodiversity conservation efforts.",
      timber_yield_estimate: 3500000,
      carbon_sequestration: 15600,
      coordinates: { lat: 35.4, lng: -82.7 },
    },
    // Mid-Atlantic
    {
      id: "10",
      name: "Allegheny Forest - Pennsylvania",
      area_acres: 13200,
      health_score: 76,
      canopy_density: 73,
      drought_stress: "low",
      pest_risk: "moderate",
      fire_risk: "low",
      recommended_action:
        "Address oak decline. Implement forest health improvement cuts.",
      timber_yield_estimate: 4400000,
      carbon_sequestration: 19200,
      coordinates: { lat: 41.7, lng: -78.9 },
    },
    // South
    {
      id: "11",
      name: "Ozark National Forest - Arkansas",
      area_acres: 8700,
      health_score: 83,
      canopy_density: 75,
      drought_stress: "moderate",
      pest_risk: "low",
      fire_risk: "moderate",
      recommended_action:
        "Good overall health. Monitor for southern pine beetle activity.",
      timber_yield_estimate: 2800000,
      carbon_sequestration: 12800,
      coordinates: { lat: 35.8, lng: -93.4 },
    },
    // Texas
    {
      id: "12",
      name: "Sam Houston Forest - Texas",
      area_acres: 14600,
      health_score: 71,
      canopy_density: 68,
      drought_stress: "high",
      pest_risk: "moderate",
      fire_risk: "high",
      recommended_action:
        "Drought mitigation priority. Enhance fire suppression readiness.",
      timber_yield_estimate: 4800000,
      carbon_sequestration: 20500,
      coordinates: { lat: 30.5, lng: -95.3 },
    },
  ];

  const displayZones = zones.length > 0 ? zones : displaySampleZones;

  return (
    <div className="min-h-screen pb-8">
      <AlertMonitor />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"
        >
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-[#0F2E1D]">
              Forest Dashboard
            </h1>
            <p className="text-gray-500">
              Real-time monitoring and AI-powered insights
            </p>
          </div>
          <div className="flex gap-2">
            <Link to={createPageUrl("RealTimeMonitoring")}>
              <Button
                variant="outline"
                className="border-[#40916C]/30 text-[#2D6A4F] hover:bg-[#40916C]/10 rounded-xl gap-2"
              >
                <Radio className="w-4 h-4" />
                Live Data
              </Button>
            </Link>
            <Button
              onClick={() => refetch()}
              variant="outline"
              className="border-[#40916C]/30 text-[#2D6A4F] hover:bg-[#40916C]/10 rounded-xl gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
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
              value="map"
              className="rounded-lg data-[state=active]:bg-[#2D6A4F] data-[state=active]:text-white gap-2 px-4"
            >
              <Map className="w-4 h-4" />
              Map View
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="rounded-lg data-[state=active]:bg-[#2D6A4F] data-[state=active]:text-white gap-2 px-4"
            >
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger
              value="zones"
              className="rounded-lg data-[state=active]:bg-[#2D6A4F] data-[state=active]:text-white gap-2 px-4"
            >
              <List className="w-4 h-4" />
              Zones
            </TabsTrigger>
          </TabsList>

          {/* Map Tab */}
          <TabsContent value="map" className="mt-6">
            <div className="space-y-4">
              {/* Live Updates Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm text-gray-600">
                    Live Data • Updates every 30s
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  {displayZones.length} Zones Monitored
                </div>
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-[600px] lg:h-[700px] rounded-2xl overflow-hidden shadow-xl shadow-gray-200/50"
                  >
                    <MapView zones={displayZones} />
                  </motion.div>
                </div>
                <div className="space-y-4">
                  <WeatherWidget
                    zoneId={displayZones[0]?.id}
                    zoneName={displayZones[0]?.name}
                    coordinates={displayZones[0]?.coordinates}
                  />

                  {/* Quick Stats */}
                  <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">
                      National Overview
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Avg Health Score</span>
                        <span className="font-bold text-[#40916C]">
                          {Math.round(
                            displayZones.reduce(
                              (sum, z) => sum + z.health_score,
                              0,
                            ) / displayZones.length,
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total Area</span>
                        <span className="font-bold">
                          {(
                            displayZones.reduce(
                              (sum, z) => sum + z.area_acres,
                              0,
                            ) / 1000
                          ).toFixed(1)}
                          K ac
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">High Risk Zones</span>
                        <span className="font-bold text-red-600">
                          {
                            displayZones.filter(
                              (z) =>
                                z.fire_risk === "high" ||
                                z.fire_risk === "extreme",
                            ).length
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="mt-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <AlertsPanel compact={true} />
              <AnalyticsPanel zones={displayZones} />
            </motion.div>
          </TabsContent>

          {/* Zones Tab */}
          <TabsContent value="zones" className="mt-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <AlertsPanel />

              <div className="grid lg:grid-cols-2 gap-6">
                <ZonesList
                  zones={displayZones}
                  onSelectZone={setSelectedZone}
                />

                {/* Zone Details */}
                <div className="bg-white rounded-2xl p-6 shadow-lg shadow-gray-200/50 border border-gray-100">
                  {selectedZone ? (
                    <div>
                      <h3 className="text-xl font-bold text-[#0F2E1D] mb-4">
                        {selectedZone.name}
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-xl p-4">
                          <p className="text-sm text-gray-500">Area</p>
                          <p className="text-xl font-bold text-[#0F2E1D]">
                            {selectedZone.area_acres?.toLocaleString()} acres
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                          <p className="text-sm text-gray-500">Health Score</p>
                          <p className="text-xl font-bold text-[#52B788]">
                            {selectedZone.health_score}/100
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                          <p className="text-sm text-gray-500">
                            Canopy Density
                          </p>
                          <p className="text-xl font-bold text-[#40916C]">
                            {selectedZone.canopy_density}%
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                          <p className="text-sm text-gray-500">Fire Risk</p>
                          <p className="text-xl font-bold capitalize">
                            {selectedZone.fire_risk}
                          </p>
                        </div>
                        <div className="col-span-2 bg-gray-50 rounded-xl p-4">
                          <p className="text-sm text-gray-500">
                            Timber Yield Estimate
                          </p>
                          <p className="text-xl font-bold text-[#2D6A4F]">
                            {(
                              selectedZone.timber_yield_estimate / 1000000
                            ).toFixed(1)}
                            M board feet
                          </p>
                        </div>
                        <div className="col-span-2 bg-[#40916C]/10 rounded-xl p-4 border border-[#40916C]/20">
                          <p className="text-sm text-[#2D6A4F] font-medium mb-1">
                            AI Recommendation
                          </p>
                          <p className="text-[#0F2E1D]">
                            {selectedZone.recommended_action}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-center">
                      <div>
                        <List className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">
                          Select a zone to view details
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

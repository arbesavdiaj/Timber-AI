import React, { useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers,
  TreePine,
  Droplets,
  Bug,
  Flame,
  Target,
  ChevronDown,
  Info,
  AlertTriangle,
} from "lucide-react";
import RiskHeatmapLayer from "./RiskHeatmapLayer";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import "leaflet/dist/leaflet.css";

const layerOptions = [
  { id: "health", label: "Forest Health", icon: TreePine, color: "#52B788" },
  { id: "canopy", label: "Canopy Density", icon: Target, color: "#40916C" },
  { id: "drought", label: "Drought Stress", icon: Droplets, color: "#E07A5F" },
  { id: "pest", label: "Pest/Disease", icon: Bug, color: "#8B5A2B" },
  { id: "harvest", label: "Harvest Zones", icon: Flame, color: "#74C69D" },
];

const heatmapOptions = [
  { id: "fire", label: "Fire Risk", icon: Flame, color: "#EF4444" },
  { id: "drought", label: "Drought Risk", icon: Droplets, color: "#3B82F6" },
  { id: "pest", label: "Pest Risk", icon: Bug, color: "#F59E0B" },
  { id: "health", label: "Health Risk", icon: AlertTriangle, color: "#8B5CF6" },
];

const getHealthColor = (score) => {
  if (score >= 80) return "#52B788";
  if (score >= 60) return "#74C69D";
  if (score >= 40) return "#E9C46A";
  return "#E07A5F";
};

const getDroughtColor = (level) => {
  const colors = {
    low: "#52B788",
    moderate: "#E9C46A",
    high: "#E07A5F",
    severe: "#C44536",
  };
  return colors[level] || "#52B788";
};

function MapUpdater({ zones }) {
  const map = useMap();

  React.useEffect(() => {
    if (zones.length > 1) {
      const bounds = zones
        .filter((z) => z.coordinates)
        .map((z) => [z.coordinates.lat, z.coordinates.lng]);
      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [80, 80], maxZoom: 6 });
      }
    }
  }, [zones, map]);

  return null;
}

export default function MapView({ zones = [] }) {
  const [activeLayers, setActiveLayers] = useState({
    health: true,
    canopy: false,
    drought: false,
    pest: false,
    harvest: false,
  });
  const [timeSlider, setTimeSlider] = useState([2024]);
  const [layerPanelOpen, setLayerPanelOpen] = useState(true);
  const [activeHeatmap, setActiveHeatmap] = useState(null);

  const toggleLayer = (layerId) => {
    setActiveLayers((prev) => ({ ...prev, [layerId]: !prev[layerId] }));
  };

  // Center on USA to show all regions
  const defaultCenter = [39.8, -98.5];
  const defaultZoom = 4;

  return (
    <div className="relative h-full rounded-2xl overflow-hidden bg-[#0F2E1D]">
      {/* Map */}
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        className="h-full w-full z-0"
        style={{ background: "#0F2E1D" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <MapUpdater zones={zones} />

        {/* Heatmap Layer */}
        {activeHeatmap && (
          <RiskHeatmapLayer zones={zones} riskType={activeHeatmap} />
        )}

        {/* Zone Markers */}
        {zones.map((zone, index) => {
          if (!zone.coordinates) return null;
          return (
            <CircleMarker
              key={zone.id || index}
              center={[zone.coordinates.lat, zone.coordinates.lng]}
              radius={Math.sqrt(zone.area_acres || 1000) / 5}
              pathOptions={{
                color: activeLayers.health
                  ? getHealthColor(zone.health_score)
                  : activeLayers.drought
                    ? getDroughtColor(zone.drought_stress)
                    : "#52B788",
                fillColor: activeLayers.health
                  ? getHealthColor(zone.health_score)
                  : activeLayers.drought
                    ? getDroughtColor(zone.drought_stress)
                    : "#52B788",
                fillOpacity: 0.4,
                weight: 2,
              }}
            >
              <Popup className="timber-popup">
                <div className="p-3 min-w-[200px]">
                  <h3 className="font-bold text-[#0F2E1D] text-lg mb-2">
                    {zone.name}
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Health Score</span>
                      <span
                        className="font-semibold"
                        style={{ color: getHealthColor(zone.health_score) }}
                      >
                        {zone.health_score}/100
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Area</span>
                      <span className="font-semibold">
                        {zone.area_acres?.toLocaleString()} acres
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Canopy Density</span>
                      <span className="font-semibold">
                        {zone.canopy_density}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fire Risk</span>
                      <Badge
                        variant="outline"
                        className={`capitalize ${zone.fire_risk === "low" ? "border-green-500 text-green-600" : zone.fire_risk === "moderate" ? "border-yellow-500 text-yellow-600" : "border-red-500 text-red-600"}`}
                      >
                        {zone.fire_risk}
                      </Badge>
                    </div>
                    {zone.recommended_action && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-xs text-gray-500 mb-1">
                          AI Recommendation
                        </p>
                        <p className="text-[#2D6A4F] font-medium text-xs">
                          {zone.recommended_action}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Layer Controls Panel */}
      <div className="absolute top-4 right-4 z-[1000]">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden"
        >
          {/* Panel Header */}
          <button
            onClick={() => setLayerPanelOpen(!layerPanelOpen)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#2D6A4F]" />
              <span className="font-semibold text-[#0F2E1D]">Map Layers</span>
            </div>
            <ChevronDown
              className={`w-5 h-5 text-gray-400 transition-transform ${layerPanelOpen ? "rotate-180" : ""}`}
            />
          </button>

          {/* Panel Content */}
          <AnimatePresence>
            {layerPanelOpen && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                exit={{ height: 0 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 space-y-3">
                  {/* Base Layers */}
                  {layerOptions.map((layer) => {
                    const Icon = layer.icon;
                    return (
                      <div
                        key={layer.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${layer.color}20` }}
                          >
                            <Icon
                              className="w-4 h-4"
                              style={{ color: layer.color }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            {layer.label}
                          </span>
                        </div>
                        <Switch
                          checked={activeLayers[layer.id]}
                          onCheckedChange={() => toggleLayer(layer.id)}
                          className="data-[state=checked]:bg-[#40916C]"
                        />
                      </div>
                    );
                  })}

                  {/* Heatmap Overlays */}
                  <div className="pt-3 border-t">
                    <div className="text-xs font-semibold text-gray-500 mb-2">
                      Risk Heatmaps
                    </div>
                    {heatmapOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <button
                          key={option.id}
                          onClick={() =>
                            setActiveHeatmap(
                              activeHeatmap === option.id ? null : option.id,
                            )
                          }
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all mb-1 ${
                            activeHeatmap === option.id
                              ? "bg-[#40916C] text-white"
                              : "hover:bg-gray-50 text-gray-700"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            <span>{option.label}</span>
                          </div>
                          {activeHeatmap === option.id && (
                            <Badge
                              variant="secondary"
                              className="text-[10px] px-2"
                            >
                              ON
                            </Badge>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Time Slider */}
                  <div className="pt-4 border-t">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Time Period</span>
                      <span className="font-semibold text-[#2D6A4F]">
                        {timeSlider[0]}
                      </span>
                    </div>
                    <Slider
                      value={timeSlider}
                      onValueChange={setTimeSlider}
                      min={2020}
                      max={2030}
                      step={1}
                      className="[&_[role=slider]]:bg-[#40916C]"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>2020</span>
                      <span>2030</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 z-[1000]">
        <div className="bg-white/95 backdrop-blur-xl rounded-xl shadow-xl border border-gray-200/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-4 h-4 text-[#2D6A4F]" />
            <span className="text-sm font-semibold text-[#0F2E1D]">
              Health Score
            </span>
          </div>
          <div className="flex gap-1">
            {[
              { label: "Excellent", color: "#52B788" },
              { label: "Good", color: "#74C69D" },
              { label: "Fair", color: "#E9C46A" },
              { label: "Poor", color: "#E07A5F" },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <div
                  className="w-10 h-2 rounded-full mb-1"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-[10px] text-gray-500">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

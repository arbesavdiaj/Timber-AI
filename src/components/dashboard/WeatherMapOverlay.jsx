import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Cloud,
  Wind,
  Droplets,
  Thermometer,
  Eye,
  EyeOff,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";

const weatherLayers = [
  {
    id: "temperature",
    label: "Temperature",
    icon: Thermometer,
    color: "#E07A5F",
    description: "Surface temperature map",
  },
  {
    id: "precipitation",
    label: "Precipitation",
    icon: Droplets,
    color: "#52B788",
    description: "Rainfall & moisture",
  },
  {
    id: "wind",
    label: "Wind Speed",
    icon: Wind,
    color: "#74C69D",
    description: "Wind patterns & gusts",
  },
  {
    id: "clouds",
    label: "Cloud Cover",
    icon: Cloud,
    color: "#8B949E",
    description: "Cloud coverage & density",
  },
];

export default function WeatherMapOverlay({ onLayerToggle }) {
  const [activeLayers, setActiveLayers] = useState({
    temperature: false,
    precipitation: false,
    wind: false,
    clouds: false,
  });
  const [opacity, setOpacity] = useState([70]);
  const [expanded, setExpanded] = useState(true);

  const toggleLayer = (layerId) => {
    const newLayers = { ...activeLayers, [layerId]: !activeLayers[layerId] };
    setActiveLayers(newLayers);
    if (onLayerToggle) {
      onLayerToggle(layerId, newLayers[layerId]);
    }
  };

  const activeCount = Object.values(activeLayers).filter(Boolean).length;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden max-w-sm"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-[#40916C]/5 to-[#52B788]/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#40916C]/10 flex items-center justify-center">
              <Cloud className="w-4 h-4 text-[#40916C]" />
            </div>
            <div>
              <h3 className="font-semibold text-[#0F2E1D] text-sm">
                Weather Overlays
              </h3>
              <p className="text-xs text-gray-500">
                {activeCount} layer{activeCount !== 1 ? "s" : ""} active
              </p>
            </div>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {expanded ? (
              <EyeOff className="w-4 h-4 text-gray-500" />
            ) : (
              <Eye className="w-4 h-4 text-gray-500" />
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      {expanded && (
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: "auto" }}
          exit={{ height: 0 }}
          className="overflow-hidden"
        >
          <div className="p-4 space-y-3">
            {/* Layer Toggles */}
            {weatherLayers.map((layer) => {
              const Icon = layer.icon;
              const isActive = activeLayers[layer.id];

              return (
                <div
                  key={layer.id}
                  className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-[#40916C]/10 to-[#52B788]/5 border border-[#40916C]/20"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                        isActive ? "scale-110" : ""
                      }`}
                      style={{
                        backgroundColor: isActive
                          ? `${layer.color}20`
                          : "#F5F5F5",
                      }}
                    >
                      <Icon
                        className={`w-5 h-5 transition-all ${isActive ? "animate-pulse" : ""}`}
                        style={{ color: isActive ? layer.color : "#9CA3AF" }}
                      />
                    </div>
                    <div>
                      <p
                        className={`text-sm font-medium ${
                          isActive ? "text-[#0F2E1D]" : "text-gray-600"
                        }`}
                      >
                        {layer.label}
                      </p>
                      <p className="text-xs text-gray-400">
                        {layer.description}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={isActive}
                    onCheckedChange={() => toggleLayer(layer.id)}
                    className="data-[state=checked]:bg-[#40916C]"
                  />
                </div>
              );
            })}

            {/* Opacity Control */}
            {activeCount > 0 && (
              <div className="pt-3 border-t border-gray-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Layer Opacity</span>
                  <span className="text-sm font-semibold text-[#2D6A4F]">
                    {opacity[0]}%
                  </span>
                </div>
                <Slider
                  value={opacity}
                  onValueChange={setOpacity}
                  min={0}
                  max={100}
                  step={5}
                  className="[&_[role=slider]]:bg-[#40916C]"
                />
              </div>
            )}

            {/* Live Data Indicator */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs text-gray-500">Live weather data</span>
              </div>
              <Badge variant="outline" className="text-xs">
                Real-time
              </Badge>
            </div>

            {/* Info Note */}
            <div className="bg-[#40916C]/5 rounded-lg p-3 border border-[#40916C]/10">
              <p className="text-xs text-gray-600">
                Weather data updates every 5 minutes. Layer accuracy: ±2km
                resolution.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

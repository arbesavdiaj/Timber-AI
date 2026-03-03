import React from "react";
import { motion } from "framer-motion";
import {
  TreePine,
  MapPin,
  Bug,
  Flame,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const getHealthColor = (score) => {
  if (score >= 80)
    return {
      bg: "bg-green-100",
      text: "text-green-700",
      border: "border-green-200",
    };
  if (score >= 60)
    return {
      bg: "bg-emerald-100",
      text: "text-emerald-700",
      border: "border-emerald-200",
    };
  if (score >= 40)
    return {
      bg: "bg-yellow-100",
      text: "text-yellow-700",
      border: "border-yellow-200",
    };
  return { bg: "bg-red-100", text: "text-red-700", border: "border-red-200" };
};

const getRiskColor = (level) => {
  const colors = {
    low: { bg: "bg-green-100", text: "text-green-700" },
    minimal: { bg: "bg-green-100", text: "text-green-700" },
    moderate: { bg: "bg-yellow-100", text: "text-yellow-700" },
    high: { bg: "bg-orange-100", text: "text-orange-700" },
    severe: { bg: "bg-red-100", text: "text-red-700" },
    extreme: { bg: "bg-red-100", text: "text-red-700" },
  };
  return colors[level] || colors.low;
};

export default function ZonesList({ zones = [], onSelectZone }) {
  if (zones.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-lg shadow-gray-200/50 border border-gray-100 text-center">
        <TreePine className="w-12 h-12 text-[#52B788]/30 mx-auto mb-4" />
        <h3 className="font-semibold text-[#0F2E1D] mb-2">No Forest Zones</h3>
        <p className="text-sm text-gray-500">
          Upload data to start monitoring forest zones.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="font-semibold text-[#0F2E1D]">Forest Zones</h3>
        <p className="text-sm text-gray-500">{zones.length} zones monitored</p>
      </div>

      <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
        {zones.map((zone, index) => {
          const healthColors = getHealthColor(zone.health_score);
          const fireColors = getRiskColor(zone.fire_risk);
          const pestColors = getRiskColor(zone.pest_risk);

          return (
            <motion.div
              key={zone.id || index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelectZone?.(zone)}
              className="p-4 hover:bg-gray-50 cursor-pointer transition-colors group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl ${healthColors.bg} flex items-center justify-center`}
                  >
                    <TreePine className={`w-5 h-5 ${healthColors.text}`} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#0F2E1D] group-hover:text-[#2D6A4F] transition-colors">
                      {zone.name}
                    </h4>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <MapPin className="w-3 h-3" />
                      <span>{zone.area_acres?.toLocaleString()} acres</span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#52B788] transition-colors" />
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                <Badge
                  className={`${healthColors.bg} ${healthColors.text} ${healthColors.border} border`}
                >
                  Health: {zone.health_score}/100
                </Badge>
                <Badge
                  className={`${fireColors.bg} ${fireColors.text} border border-current/20`}
                >
                  <Flame className="w-3 h-3 mr-1" />
                  {zone.fire_risk}
                </Badge>
                <Badge
                  className={`${pestColors.bg} ${pestColors.text} border border-current/20`}
                >
                  <Bug className="w-3 h-3 mr-1" />
                  {zone.pest_risk}
                </Badge>
              </div>

              {zone.recommended_action && (
                <div className="bg-[#40916C]/5 rounded-lg p-3 border border-[#40916C]/10">
                  <p className="text-xs text-gray-500 mb-1">
                    AI Recommendation
                  </p>
                  <p className="text-sm text-[#2D6A4F] font-medium">
                    {zone.recommended_action}
                  </p>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

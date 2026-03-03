import React from "react";
import { CircleMarker, Tooltip as LeafletTooltip } from "react-leaflet";

export default function RiskHeatmapLayer({ zones, riskType = "fire" }) {
  const getRiskValue = (zone) => {
    switch (riskType) {
      case "fire":
        const fireRiskMap = { low: 0, moderate: 1, high: 2, extreme: 3 };
        return fireRiskMap[zone.fire_risk] || 0;
      case "drought":
        const droughtMap = { low: 0, moderate: 1, high: 2, severe: 3 };
        return droughtMap[zone.drought_stress] || 0;
      case "pest":
        const pestMap = { minimal: 0, low: 1, moderate: 2, high: 3 };
        return pestMap[zone.pest_risk] || 0;
      case "health":
        return 100 - (zone.health_score || 0); // Invert so high risk = high value
      default:
        return 0;
    }
  };

  const getRiskColor = (riskValue) => {
    if (riskValue === 0) return "#10B981"; // Green - Low
    if (riskValue === 1) return "#F59E0B"; // Yellow - Moderate
    if (riskValue === 2) return "#EF4444"; // Red - High
    return "#DC2626"; // Dark Red - Critical
  };

  const getRiskOpacity = (riskValue) => {
    return 0.4 + riskValue * 0.15; // 0.4 to 0.85
  };

  const getRiskRadius = (zone, riskValue) => {
    // Base size on area and risk level
    const baseRadius = Math.sqrt(zone.area_acres || 1000) * 0.3;
    const riskMultiplier = 1 + riskValue * 0.3;
    return baseRadius * riskMultiplier;
  };

  const getRiskLabel = (riskValue) => {
    const labels = ["Low Risk", "Moderate Risk", "High Risk", "Critical Risk"];
    return labels[riskValue] || "Unknown";
  };

  return (
    <>
      {zones
        .filter((z) => z.coordinates)
        .map((zone) => {
          const riskValue = getRiskValue(zone);
          const color = getRiskColor(riskValue);
          const opacity = getRiskOpacity(riskValue);
          const radius = getRiskRadius(zone, riskValue);

          return (
            <CircleMarker
              key={`${zone.id}-${riskType}`}
              center={[zone.coordinates.lat, zone.coordinates.lng]}
              radius={radius}
              pathOptions={{
                fillColor: color,
                fillOpacity: opacity,
                color: color,
                weight: 2,
                opacity: 0.8,
              }}
            >
              <LeafletTooltip direction="top" offset={[0, -10]} opacity={0.95}>
                <div className="text-sm">
                  <div className="font-semibold text-[#0F2E1D] mb-1">
                    {zone.name}
                  </div>
                  <div className="text-gray-600">
                    {riskType.charAt(0).toUpperCase() + riskType.slice(1)} Risk:{" "}
                    <span className="font-semibold" style={{ color }}>
                      {getRiskLabel(riskValue)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {zone.area_acres?.toLocaleString()} acres
                  </div>
                </div>
              </LeafletTooltip>
            </CircleMarker>
          );
        })}
    </>
  );
}

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TrendingUp, Activity, AlertTriangle, Leaf } from "lucide-react";

export default function ReportVisualizations({ zones, reportType }) {
  // Health Score Distribution
  const healthDistribution = [
    {
      range: "90-100",
      count: zones.filter((z) => z.health_score >= 90).length,
      color: "#10B981",
    },
    {
      range: "70-89",
      count: zones.filter((z) => z.health_score >= 70 && z.health_score < 90)
        .length,
      color: "#40916C",
    },
    {
      range: "50-69",
      count: zones.filter((z) => z.health_score >= 50 && z.health_score < 70)
        .length,
      color: "#F59E0B",
    },
    {
      range: "Below 50",
      count: zones.filter((z) => z.health_score < 50).length,
      color: "#EF4444",
    },
  ];

  // Risk Analysis
  const riskData = [
    {
      name: "Fire Risk",
      low: zones.filter((z) => z.fire_risk === "low").length,
      moderate: zones.filter((z) => z.fire_risk === "moderate").length,
      high: zones.filter(
        (z) => z.fire_risk === "high" || z.fire_risk === "extreme",
      ).length,
    },
    {
      name: "Drought",
      low: zones.filter((z) => z.drought_stress === "low").length,
      moderate: zones.filter((z) => z.drought_stress === "moderate").length,
      high: zones.filter(
        (z) => z.drought_stress === "high" || z.drought_stress === "severe",
      ).length,
    },
    {
      name: "Pest Risk",
      low: zones.filter(
        (z) => z.pest_risk === "minimal" || z.pest_risk === "low",
      ).length,
      moderate: zones.filter((z) => z.pest_risk === "moderate").length,
      high: zones.filter((z) => z.pest_risk === "high").length,
    },
  ];

  // Zone Comparison
  const zoneComparison = zones.slice(0, 10).map((z) => ({
    name: z.name.length > 15 ? z.name.substring(0, 15) + "..." : z.name,
    health: z.health_score,
    canopy: z.canopy_density,
    acres: z.area_acres / 1000, // Convert to thousands
  }));

  // Carbon Sequestration
  const carbonData = zones
    .map((z) => ({
      name: z.name.length > 12 ? z.name.substring(0, 12) + "..." : z.name,
      carbon: z.carbon_sequestration || 0,
    }))
    .sort((a, b) => b.carbon - a.carbon)
    .slice(0, 8);

  return (
    <div className="space-y-6">
      {/* Health Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Leaf className="w-5 h-5 text-[#40916C]" />
            Health Score Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={healthDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="range" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="count" fill="#40916C" radius={[8, 8, 0, 0]}>
                {healthDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Risk Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[#F59E0B]" />
            Risk Analysis by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={riskData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="low" stackId="a" fill="#10B981" name="Low" />
              <Bar
                dataKey="moderate"
                stackId="a"
                fill="#F59E0B"
                name="Moderate"
              />
              <Bar
                dataKey="high"
                stackId="a"
                fill="#EF4444"
                name="High/Critical"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Zone Performance Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#40916C]" />
            Top Zones Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={zoneComparison}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="health"
                stroke="#40916C"
                strokeWidth={2}
                name="Health Score"
              />
              <Line
                type="monotone"
                dataKey="canopy"
                stroke="#2D6A4F"
                strokeWidth={2}
                name="Canopy Density"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Carbon Sequestration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#52B788]" />
            Carbon Sequestration Leaders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={carbonData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fontSize: 11 }}
                width={120}
              />
              <Tooltip
                formatter={(value) => [
                  `${value.toLocaleString()} tons/year`,
                  "CO₂ Captured",
                ]}
              />
              <Bar dataKey="carbon" fill="#52B788" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

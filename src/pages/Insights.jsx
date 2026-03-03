import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  Bug,
  AlertTriangle,
  CheckCircle,
  ArrowUpRight,
  Lightbulb,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const healthDistribution = [
  { name: "Excellent (80-100)", value: 45, color: "#52B788" },
  { name: "Good (60-79)", value: 30, color: "#74C69D" },
  { name: "Fair (40-59)", value: 18, color: "#E9C46A" },
  { name: "Poor (<40)", value: 7, color: "#E07A5F" },
];

const riskTrends = [
  { month: "Jan", fire: 12, pest: 8, drought: 15 },
  { month: "Feb", fire: 15, pest: 9, drought: 18 },
  { month: "Mar", fire: 22, pest: 12, drought: 25 },
  { month: "Apr", fire: 35, pest: 15, drought: 32 },
  { month: "May", fire: 48, pest: 18, drought: 40 },
  { month: "Jun", fire: 62, pest: 22, drought: 52 },
  { month: "Jul", fire: 75, pest: 28, drought: 58 },
  { month: "Aug", fire: 70, pest: 32, drought: 55 },
  { month: "Sep", fire: 45, pest: 25, drought: 42 },
  { month: "Oct", fire: 28, pest: 18, drought: 28 },
  { month: "Nov", fire: 15, pest: 12, drought: 18 },
  { month: "Dec", fire: 10, pest: 8, drought: 12 },
];

const carbonProjection = [
  { year: "2020", actual: 42000, target: 40000 },
  { year: "2021", actual: 45000, target: 44000 },
  { year: "2022", actual: 48500, target: 48000 },
  { year: "2023", actual: 52000, target: 52000 },
  { year: "2024", actual: 54800, target: 56000 },
  { year: "2025", projected: 58000, target: 60000 },
  { year: "2026", projected: 62000, target: 64000 },
];

const speciesHealth = [
  { species: "Douglas Fir", health: 88, acres: 18500 },
  { species: "Western Red Cedar", health: 82, acres: 12200 },
  { species: "Sitka Spruce", health: 76, acres: 9800 },
  { species: "Ponderosa Pine", health: 71, acres: 7400 },
  { species: "Western Hemlock", health: 85, acres: 4800 },
];

const aiInsights = [
  {
    type: "alert",
    icon: AlertTriangle,
    color: "#E07A5F",
    title: "High Fire Risk Detected",
    description:
      "Okanogan Highlands showing extreme fire risk indicators. Recommend immediate preventive measures.",
    zone: "Zone E",
  },
  {
    type: "opportunity",
    icon: TrendingUp,
    color: "#52B788",
    title: "Optimal Harvest Window",
    description:
      "Willamette Valley Plot D has reached peak timber maturity. Best harvest window: October-November.",
    zone: "Zone D",
  },
  {
    type: "warning",
    icon: Bug,
    color: "#8B5A2B",
    title: "Pest Activity Increasing",
    description:
      "Bark beetle activity detected in Blue Mountains. Consider targeted treatment in affected areas.",
    zone: "Zone C",
  },
  {
    type: "success",
    icon: CheckCircle,
    color: "#40916C",
    title: "Carbon Goals On Track",
    description:
      "Annual sequestration rate exceeding targets by 8.4%. Continue current management practices.",
    zone: "All Zones",
  },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-xl rounded-xl shadow-xl border border-gray-200/50 p-3">
        <p className="font-semibold text-[#0F2E1D] mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}:{" "}
            {typeof entry.value === "number"
              ? entry.value.toLocaleString()
              : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Insights() {
  const [timeRange, setTimeRange] = useState("year");

  const { data: zones = [] } = useQuery({
    queryKey: ["forestZones"],
    queryFn: () => base44.entities.ForestZone.list("-health_score"),
    initialData: [],
  });

  const totalAcres =
    zones.reduce((sum, z) => sum + (z.area_acres || 0), 0) || 52700;
  const avgHealth =
    zones.length > 0
      ? Math.round(
          zones.reduce((sum, z) => sum + (z.health_score || 0), 0) /
            zones.length,
        )
      : 75;
  const highRiskZones =
    zones.filter((z) => z.fire_risk === "high" || z.fire_risk === "extreme")
      .length || 2;

  return (
    <div className="min-h-screen pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl lg:text-3xl font-bold text-[#0F2E1D] mb-2">
            Insights
          </h1>
          <p className="text-gray-500">
            AI-powered analytics and recommendations
          </p>
        </motion.div>

        {/* AI Insights Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-[#40916C]" />
            <h2 className="font-semibold text-[#0F2E1D]">AI Recommendations</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {aiInsights.map((insight, index) => {
              const Icon = insight.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${insight.color}15` }}
                        >
                          <Icon
                            className="w-5 h-5"
                            style={{ color: insight.color }}
                          />
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {insight.zone}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-[#0F2E1D] text-sm mb-1">
                        {insight.title}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {insight.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Health Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Health Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={healthDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {healthDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {healthDistribution.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-xs text-gray-600">
                        {item.name}: {item.value}%
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Risk Trends */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Risk Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={riskTrends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis
                        dataKey="month"
                        tick={{ fill: "#6B7280", fontSize: 11 }}
                      />
                      <YAxis tick={{ fill: "#6B7280", fontSize: 11 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="fire"
                        stroke="#E07A5F"
                        strokeWidth={2}
                        name="Fire Risk"
                        dot={{ r: 2 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="pest"
                        stroke="#8B5A2B"
                        strokeWidth={2}
                        name="Pest Risk"
                        dot={{ r: 2 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="drought"
                        stroke="#E9C46A"
                        strokeWidth={2}
                        name="Drought"
                        dot={{ r: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Carbon Projection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">
                  Carbon Sequestration Projection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={carbonProjection}>
                      <defs>
                        <linearGradient
                          id="carbonGrad"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#52B788"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#52B788"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis
                        dataKey="year"
                        tick={{ fill: "#6B7280", fontSize: 11 }}
                      />
                      <YAxis tick={{ fill: "#6B7280", fontSize: 11 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="actual"
                        stroke="#52B788"
                        fill="url(#carbonGrad)"
                        strokeWidth={2}
                        name="Actual"
                      />
                      <Area
                        type="monotone"
                        dataKey="projected"
                        stroke="#74C69D"
                        fill="none"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        name="Projected"
                      />
                      <Line
                        type="monotone"
                        dataKey="target"
                        stroke="#2D6A4F"
                        strokeWidth={2}
                        strokeDasharray="3 3"
                        name="Target"
                        dot={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Species Health */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">
                  Species Health Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={speciesHealth} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis
                        type="number"
                        domain={[0, 100]}
                        tick={{ fill: "#6B7280", fontSize: 11 }}
                      />
                      <YAxis
                        dataKey="species"
                        type="category"
                        tick={{ fill: "#6B7280", fontSize: 11 }}
                        width={120}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar
                        dataKey="health"
                        fill="#40916C"
                        radius={[0, 4, 4, 0]}
                        name="Health Score"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Summary Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <Card className="bg-gradient-to-br from-[#40916C] to-[#2D6A4F] text-white">
            <CardContent className="p-6">
              <p className="text-white/70 text-sm mb-1">Total Coverage</p>
              <p className="text-3xl font-bold">
                {(totalAcres / 1000).toFixed(1)}K
              </p>
              <p className="text-white/70 text-sm">acres monitored</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-[#52B788] to-[#40916C] text-white">
            <CardContent className="p-6">
              <p className="text-white/70 text-sm mb-1">Average Health</p>
              <p className="text-3xl font-bold">
                {avgHealth}
                <span className="text-lg">/100</span>
              </p>
              <div className="flex items-center gap-1 text-white/90 text-sm">
                <ArrowUpRight className="w-3 h-3" />
                +3.2% vs last month
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-[#E07A5F] to-[#C44536] text-white">
            <CardContent className="p-6">
              <p className="text-white/70 text-sm mb-1">High Risk Zones</p>
              <p className="text-3xl font-bold">{highRiskZones}</p>
              <p className="text-white/70 text-sm">require attention</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-[#74C69D] to-[#52B788] text-white">
            <CardContent className="p-6">
              <p className="text-white/70 text-sm mb-1">CO₂ Captured</p>
              <p className="text-3xl font-bold">54.8K</p>
              <div className="flex items-center gap-1 text-white/90 text-sm">
                <ArrowUpRight className="w-3 h-3" />
                tons this year
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

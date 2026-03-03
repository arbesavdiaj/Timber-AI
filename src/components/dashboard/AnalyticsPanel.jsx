import React from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  TreePine,
  ShieldAlert,
  Leaf,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

const growthData = [
  { month: "Jan", growth: 2.1, projected: 2.0 },
  { month: "Feb", growth: 2.3, projected: 2.2 },
  { month: "Mar", growth: 3.1, projected: 2.8 },
  { month: "Apr", growth: 4.2, projected: 3.8 },
  { month: "May", growth: 5.8, projected: 5.2 },
  { month: "Jun", growth: 6.4, projected: 6.0 },
  { month: "Jul", growth: 5.9, projected: 5.8 },
  { month: "Aug", growth: 5.2, projected: 5.4 },
  { month: "Sep", growth: 4.1, projected: 4.2 },
  { month: "Oct", growth: 3.2, projected: 3.0 },
  { month: "Nov", growth: 2.4, projected: 2.2 },
  { month: "Dec", growth: 2.0, projected: 1.9 },
];

const yieldData = [
  { year: "2020", actual: 12400, forecast: 12000 },
  { year: "2021", actual: 13200, forecast: 13000 },
  { year: "2022", actual: 14100, forecast: 14500 },
  { year: "2023", actual: 15800, forecast: 15200 },
  { year: "2024", actual: null, forecast: 16500 },
  { year: "2025", actual: null, forecast: 17200 },
];

const riskData = [
  { month: "Jan", fire: 15, pest: 8, drought: 12 },
  { month: "Feb", fire: 18, pest: 10, drought: 15 },
  { month: "Mar", fire: 22, pest: 12, drought: 20 },
  { month: "Apr", fire: 35, pest: 15, drought: 28 },
  { month: "May", fire: 45, pest: 18, drought: 35 },
  { month: "Jun", fire: 62, pest: 22, drought: 48 },
  { month: "Jul", fire: 78, pest: 25, drought: 58 },
  { month: "Aug", fire: 72, pest: 28, drought: 52 },
  { month: "Sep", fire: 48, pest: 20, drought: 38 },
  { month: "Oct", fire: 28, pest: 15, drought: 22 },
  { month: "Nov", fire: 18, pest: 10, drought: 15 },
  { month: "Dec", fire: 12, pest: 8, drought: 10 },
];

const carbonData = [
  { year: "2020", sequestered: 42000 },
  { year: "2021", sequestered: 45000 },
  { year: "2022", sequestered: 48500 },
  { year: "2023", sequestered: 52000 },
  { year: "2024", sequestered: 54800 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-xl rounded-xl shadow-xl border border-gray-200/50 p-3">
        <p className="font-semibold text-[#0F2E1D] mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value?.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsPanel({ zones = [] }) {
  const avgHealthScore =
    zones.length > 0
      ? Math.round(
          zones.reduce((sum, z) => sum + (z.health_score || 0), 0) /
            zones.length,
        )
      : 82;

  const totalCarbonSequestered =
    zones.reduce((sum, z) => sum + (z.carbon_sequestration || 0), 0) || 54800;
  const avgFireRisk = 23;
  const projectedYield = 16500;

  const stats = [
    {
      label: "Health Score",
      value: avgHealthScore,
      suffix: "/100",
      change: "+3.2%",
      positive: true,
      icon: TreePine,
      color: "#52B788",
    },
    {
      label: "Risk Index",
      value: avgFireRisk,
      suffix: "%",
      change: "-5.1%",
      positive: true,
      icon: ShieldAlert,
      color: "#E07A5F",
    },
    {
      label: "Yield Forecast",
      value: (projectedYield / 1000).toFixed(1),
      suffix: "K bf",
      change: "+8.4%",
      positive: true,
      icon: TrendingUp,
      color: "#40916C",
    },
    {
      label: "Carbon Seq.",
      value: (totalCarbonSequestered / 1000).toFixed(1),
      suffix: "K tons",
      change: "+5.8%",
      positive: true,
      icon: Leaf,
      color: "#74C69D",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-5 shadow-lg shadow-gray-200/50 border border-gray-100 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${stat.color}15` }}
                >
                  <Icon className="w-5 h-5" style={{ color: stat.color }} />
                </div>
                <div
                  className={`flex items-center gap-1 text-xs font-medium ${stat.positive ? "text-green-600" : "text-red-500"}`}
                >
                  {stat.positive ? (
                    <ArrowUp className="w-3 h-3" />
                  ) : (
                    <ArrowDown className="w-3 h-3" />
                  )}
                  {stat.change}
                </div>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-[#0F2E1D]">
                  {stat.value}
                </span>
                <span className="text-sm text-gray-500">{stat.suffix}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Growth Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-lg shadow-gray-200/50 border border-gray-100"
        >
          <h3 className="font-semibold text-[#0F2E1D] mb-1">
            Growth Projection
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Monthly biomass increase rate
          </p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData}>
                <defs>
                  <linearGradient
                    id="growthGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#52B788" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#52B788" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "#6B7280", fontSize: 12 }}
                />
                <YAxis tick={{ fill: "#6B7280", fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="growth"
                  stroke="#52B788"
                  fill="url(#growthGradient)"
                  strokeWidth={2}
                  name="Actual"
                />
                <Line
                  type="monotone"
                  dataKey="projected"
                  stroke="#40916C"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Projected"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Timber Yield */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-lg shadow-gray-200/50 border border-gray-100"
        >
          <h3 className="font-semibold text-[#0F2E1D] mb-1">
            Timber Yield Forecast
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Annual board feet production
          </p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={yieldData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="year"
                  tick={{ fill: "#6B7280", fontSize: 12 }}
                />
                <YAxis tick={{ fill: "#6B7280", fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="actual"
                  fill="#40916C"
                  radius={[4, 4, 0, 0]}
                  name="Actual"
                />
                <Bar
                  dataKey="forecast"
                  fill="#74C69D"
                  radius={[4, 4, 0, 0]}
                  name="Forecast"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Risk Over Time */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-lg shadow-gray-200/50 border border-gray-100"
        >
          <h3 className="font-semibold text-[#0F2E1D] mb-1">Risk Analysis</h3>
          <p className="text-sm text-gray-500 mb-4">
            Monthly risk index by category
          </p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={riskData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "#6B7280", fontSize: 12 }}
                />
                <YAxis tick={{ fill: "#6B7280", fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="fire"
                  stroke="#E07A5F"
                  strokeWidth={2}
                  name="Fire Risk"
                  dot={{ fill: "#E07A5F", r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="pest"
                  stroke="#8B5A2B"
                  strokeWidth={2}
                  name="Pest Risk"
                  dot={{ fill: "#8B5A2B", r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="drought"
                  stroke="#E9C46A"
                  strokeWidth={2}
                  name="Drought Risk"
                  dot={{ fill: "#E9C46A", r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Carbon Sequestration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl p-6 shadow-lg shadow-gray-200/50 border border-gray-100"
        >
          <h3 className="font-semibold text-[#0F2E1D] mb-1">
            Carbon Sequestration
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Annual CO₂ captured (metric tons)
          </p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={carbonData}>
                <defs>
                  <linearGradient
                    id="carbonGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#74C69D" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#74C69D" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="year"
                  tick={{ fill: "#6B7280", fontSize: 12 }}
                />
                <YAxis tick={{ fill: "#6B7280", fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="sequestered"
                  stroke="#74C69D"
                  fill="url(#carbonGradient)"
                  strokeWidth={2}
                  name="CO₂ Sequestered"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

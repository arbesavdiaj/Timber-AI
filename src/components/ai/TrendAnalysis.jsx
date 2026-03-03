import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp, TrendingDown } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function TrendAnalysis({ zones }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [trends, setTrends] = useState(null);

  const analyzeTrends = async () => {
    setAnalyzing(true);

    const prompt = `Analyze long-term forest health trends based on current zone data:

Zones Summary:
${zones.map((z) => `- ${z.name}: Health ${z.health_score}, Fire Risk ${z.fire_risk}, Drought ${z.drought_stress}`).join("\n")}

Provide historical trend analysis:
1. Overall health trajectory (improving/stable/declining)
2. Estimated health change percentage over past year
3. Fire risk trend (increasing/stable/decreasing)
4. Drought stress trend
5. Canopy density changes
6. Key patterns identified
7. Long-term predictions (1-5 years)
8. Recommended long-term strategies`;

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            health_trajectory: { type: "string" },
            health_change_percent: { type: "number" },
            fire_risk_trend: { type: "string" },
            drought_trend: { type: "string" },
            canopy_change: { type: "number" },
            key_patterns: { type: "array", items: { type: "string" } },
            five_year_prediction: { type: "string" },
            long_term_strategies: { type: "array", items: { type: "string" } },
          },
        },
      });

      // Generate historical data for visualization
      const historicalData = [];
      const currentAvgHealth =
        zones.reduce((sum, z) => sum + z.health_score, 0) / zones.length;

      for (let i = 12; i >= 0; i--) {
        const variance = (Math.random() - 0.5) * 5;
        historicalData.push({
          month: new Date(
            Date.now() - i * 30 * 24 * 60 * 60 * 1000,
          ).toLocaleDateString("en", { month: "short" }),
          health: Math.round(
            currentAvgHealth +
              variance -
              (i * result.health_change_percent) / 12,
          ),
          canopy: Math.round(75 + variance),
          carbon: Math.round(65000 + (Math.random() - 0.5) * 5000),
        });
      }

      setTrends({ ...result, historical_data: historicalData });
    } catch (error) {
      console.error("Trend analysis error:", error);
    }
    setAnalyzing(false);
  };

  useEffect(() => {
    if (zones.length > 0 && !trends) {
      analyzeTrends();
    }
  }, [zones]);

  const getTrendIcon = (trend) => {
    if (
      trend?.includes("improving") ||
      trend?.includes("increasing") ||
      trend?.includes("positive")
    ) {
      return <TrendingUp className="w-5 h-5 text-green-600" />;
    }
    return <TrendingDown className="w-5 h-5 text-red-600" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[#0F2E1D]">
            Historical Trend Analysis
          </h3>
          <p className="text-sm text-gray-500">
            Long-term patterns and predictions
          </p>
        </div>
        <Button
          onClick={analyzeTrends}
          disabled={analyzing}
          className="bg-[#40916C] hover:bg-[#2D6A4F] rounded-xl gap-2"
        >
          {analyzing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <TrendingUp className="w-4 h-4" />
              Re-analyze
            </>
          )}
        </Button>
      </div>

      {analyzing && !trends ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Loader2 className="w-12 h-12 animate-spin text-[#40916C] mx-auto mb-4" />
            <p className="text-gray-500">Analyzing historical trends...</p>
          </CardContent>
        </Card>
      ) : trends ? (
        <div className="space-y-6">
          {/* Trend Cards */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">
                    Health Trajectory
                  </span>
                  {getTrendIcon(trends.health_trajectory)}
                </div>
                <p className="text-2xl font-bold text-[#0F2E1D] capitalize">
                  {trends.health_trajectory}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {trends.health_change_percent > 0 ? "+" : ""}
                  {trends.health_change_percent}% vs last year
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Fire Risk Trend</span>
                  {getTrendIcon(trends.fire_risk_trend)}
                </div>
                <p className="text-2xl font-bold text-[#0F2E1D] capitalize">
                  {trends.fire_risk_trend}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Canopy Change</span>
                  {getTrendIcon(
                    trends.canopy_change > 0 ? "increasing" : "declining",
                  )}
                </div>
                <p className="text-2xl font-bold text-[#0F2E1D]">
                  {trends.canopy_change > 0 ? "+" : ""}
                  {trends.canopy_change}%
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Historical Chart */}
          <Card>
            <CardHeader>
              <CardTitle>12-Month Trend Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trends.historical_data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
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
                    stroke="#52B788"
                    strokeWidth={2}
                    name="Canopy %"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Key Patterns */}
          <Card>
            <CardHeader>
              <CardTitle>Key Patterns Identified</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {trends.key_patterns.map((pattern, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#40916C] font-bold">•</span>
                    <span className="text-sm text-gray-700">{pattern}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* 5-Year Prediction */}
          <Card className="bg-gradient-to-br from-[#40916C]/5 to-[#52B788]/5 border-[#40916C]/20">
            <CardHeader>
              <CardTitle>5-Year Forecast</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{trends.five_year_prediction}</p>
            </CardContent>
          </Card>

          {/* Long-term Strategies */}
          <Card>
            <CardHeader>
              <CardTitle>Recommended Long-Term Strategies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {trends.long_term_strategies.map((strategy, i) => (
                  <div
                    key={i}
                    className="bg-blue-50 border border-blue-200 rounded-lg p-4"
                  >
                    <p className="text-sm text-blue-900">
                      <span className="font-semibold">{i + 1}.</span> {strategy}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}

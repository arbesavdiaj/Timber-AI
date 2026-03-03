import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Activity } from "lucide-react";
import { format } from "date-fns";

export default function SensorTrendChart({ sensors, timeRange = "7d" }) {
  // Group sensors by type
  const sensorsByType = sensors.reduce((acc, sensor) => {
    if (!acc[sensor.sensor_type]) acc[sensor.sensor_type] = [];
    acc[sensor.sensor_type].push(sensor);
    return acc;
  }, {});

  const chartColors = {
    soil_moisture: "#40916C",
    temperature: "#F59E0B",
    humidity: "#3B82F6",
    ph: "#8B5CF6",
    air_quality: "#10B981",
    light: "#F59E0B",
  };

  const renderTrendChart = (sensorType, sensorsOfType) => {
    // Aggregate historical data from all sensors of this type
    const historicalData = [];
    sensorsOfType.forEach((sensor) => {
      if (sensor.reading_history && sensor.reading_history.length > 0) {
        sensor.reading_history.forEach((reading) => {
          historicalData.push({
            timestamp: reading.timestamp,
            value: reading.value,
            sensor_id: sensor.sensor_id,
          });
        });
      }
    });

    // Sort by timestamp and aggregate by time period
    historicalData.sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
    );

    // Group by date and average values
    const dataByDate = {};
    historicalData.forEach((item) => {
      const date = format(new Date(item.timestamp), "MMM dd");
      if (!dataByDate[date]) {
        dataByDate[date] = { date, values: [], count: 0 };
      }
      dataByDate[date].values.push(item.value);
      dataByDate[date].count++;
    });

    const chartData = Object.values(dataByDate).map((entry) => ({
      date: entry.date,
      average:
        entry.values.reduce((sum, v) => sum + v, 0) / entry.values.length,
      min: Math.min(...entry.values),
      max: Math.max(...entry.values),
    }));

    if (chartData.length === 0) return null;

    return (
      <Card key={sensorType} className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Activity
              className="w-4 h-4"
              style={{ color: chartColors[sensorType] }}
            />
            {sensorType.replace("_", " ").toUpperCase()} Trends
            <span className="text-xs font-normal text-gray-500">
              ({sensorsOfType.length} sensors)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient
                  id={`gradient-${sensorType}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor={chartColors[sensorType]}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor={chartColors[sensorType]}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
              <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                formatter={(value) => [value.toFixed(1), "Value"]}
              />
              <Area
                type="monotone"
                dataKey="average"
                stroke={chartColors[sensorType]}
                strokeWidth={2}
                fill={`url(#gradient-${sensorType})`}
              />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
            <span>Trend over {timeRange}</span>
            <div className="flex gap-3">
              <span>
                Min: {Math.min(...chartData.map((d) => d.min)).toFixed(1)}
              </span>
              <span>
                Max: {Math.max(...chartData.map((d) => d.max)).toFixed(1)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      {Object.entries(sensorsByType).map(([type, sensorsOfType]) =>
        renderTrendChart(type, sensorsOfType),
      )}
    </div>
  );
}

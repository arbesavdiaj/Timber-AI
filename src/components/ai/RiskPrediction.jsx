import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Flame, Cloud, AlertTriangle, TrendingUp } from "lucide-react";

export default function RiskPrediction({ zones, sensors }) {
  const [predicting, setPredicting] = useState(false);
  const [predictions, setPredictions] = useState([]);

  const generatePredictions = async () => {
    setPredicting(true);
    const results = [];

    for (const zone of zones.slice(0, 5)) {
      const weatherData = await base44.entities.WeatherData.filter(
        { zone_id: zone.id },
        "-timestamp",
        30,
      );

      const zoneSensors = sensors.filter((s) => s.zone_id === zone.id);

      const prompt = `Predict environmental risks for this forest zone over the next 30-90 days:

Zone: ${zone.name}
Current Health: ${zone.health_score}/100
Fire Risk: ${zone.fire_risk}
Drought Stress: ${zone.drought_stress}
Pest Risk: ${zone.pest_risk}

Recent Weather Patterns: ${weatherData.length} data points
Sensor Readings: ${zoneSensors.length} active sensors

Provide predictions for:
1. Wildfire risk probability (next 30 days, %)
2. Wildfire spread rate if ignited (acres/day)
3. Disease outbreak probability (next 90 days, %)
4. Disease outbreak timeline (days until critical)
5. Drought severity prediction (low/moderate/high/severe)
6. Risk factors contributing to predictions
7. Critical intervention window (days)`;

      try {
        const result = await base44.integrations.Core.InvokeLLM({
          prompt,
          add_context_from_internet: true,
          response_json_schema: {
            type: "object",
            properties: {
              wildfire_probability: { type: "number" },
              fire_spread_rate: { type: "number" },
              disease_probability: { type: "number" },
              disease_timeline: { type: "number" },
              drought_prediction: { type: "string" },
              risk_factors: { type: "array", items: { type: "string" } },
              intervention_window: { type: "number" },
            },
          },
        });

        results.push({
          zone_id: zone.id,
          zone_name: zone.name,
          ...result,
        });
      } catch (error) {
        console.error(`Error predicting for zone ${zone.name}:`, error);
      }
    }

    setPredictions(results);
    setPredicting(false);
  };

  useEffect(() => {
    if (zones.length > 0 && predictions.length === 0) {
      generatePredictions();
    }
  }, [zones]);

  const getRiskLevel = (probability) => {
    if (probability >= 70)
      return { label: "Critical", color: "bg-red-500", text: "text-red-700" };
    if (probability >= 50)
      return { label: "High", color: "bg-orange-500", text: "text-orange-700" };
    if (probability >= 30)
      return {
        label: "Moderate",
        color: "bg-yellow-500",
        text: "text-yellow-700",
      };
    return { label: "Low", color: "bg-green-500", text: "text-green-700" };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[#0F2E1D]">
            Environmental Risk Prediction
          </h3>
          <p className="text-sm text-gray-500">
            30-90 day forecast of potential threats
          </p>
        </div>
        <Button
          onClick={generatePredictions}
          disabled={predicting}
          className="bg-[#40916C] hover:bg-[#2D6A4F] rounded-xl gap-2"
        >
          {predicting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Predicting...
            </>
          ) : (
            <>
              <TrendingUp className="w-4 h-4" />
              Re-predict
            </>
          )}
        </Button>
      </div>

      {predicting && predictions.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Loader2 className="w-12 h-12 animate-spin text-[#40916C] mx-auto mb-4" />
            <p className="text-gray-500">Generating risk predictions...</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {predictions.map((pred, index) => {
            const fireRisk = getRiskLevel(pred.wildfire_probability);
            const diseaseRisk = getRiskLevel(pred.disease_probability);

            return (
              <motion.div
                key={pred.zone_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{pred.zone_name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Wildfire Risk */}
                    <div className="border-l-4 border-orange-500 pl-4 py-2">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Flame className="w-5 h-5 text-orange-600" />
                          <span className="font-semibold">
                            Wildfire Risk (30 days)
                          </span>
                        </div>
                        <Badge className={`${fireRisk.color} text-white`}>
                          {fireRisk.label}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-3">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-600">Probability</p>
                          <p className="text-xl font-bold text-[#0F2E1D]">
                            {pred.wildfire_probability}%
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-600">Spread Rate</p>
                          <p className="text-xl font-bold text-[#0F2E1D]">
                            {pred.fire_spread_rate} ac/day
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Disease Risk */}
                    <div className="border-l-4 border-purple-500 pl-4 py-2">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-purple-600" />
                          <span className="font-semibold">
                            Disease Outbreak (90 days)
                          </span>
                        </div>
                        <Badge className={`${diseaseRisk.color} text-white`}>
                          {diseaseRisk.label}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-3">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-600">Probability</p>
                          <p className="text-xl font-bold text-[#0F2E1D]">
                            {pred.disease_probability}%
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-600">Critical in</p>
                          <p className="text-xl font-bold text-[#0F2E1D]">
                            {pred.disease_timeline} days
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Drought Prediction */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Cloud className="w-5 h-5 text-blue-600" />
                        <span className="font-semibold text-blue-900">
                          Drought Forecast
                        </span>
                      </div>
                      <p className="text-sm text-blue-700 capitalize">
                        {pred.drought_prediction} severity expected
                      </p>
                    </div>

                    {/* Risk Factors */}
                    {pred.risk_factors && pred.risk_factors.length > 0 && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <p className="font-semibold text-amber-900 mb-2">
                          Contributing Factors
                        </p>
                        <ul className="text-sm text-amber-700 space-y-1">
                          {pred.risk_factors.slice(0, 4).map((factor, i) => (
                            <li key={i}>• {factor}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Intervention Window */}
                    <div className="bg-[#40916C]/10 border border-[#40916C]/20 rounded-lg p-4">
                      <p className="font-semibold text-[#2D6A4F] mb-1">
                        Critical Intervention Window
                      </p>
                      <p className="text-sm text-gray-700">
                        Action must be taken within{" "}
                        <span className="font-bold text-[#2D6A4F]">
                          {pred.intervention_window} days
                        </span>{" "}
                        to prevent escalation
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

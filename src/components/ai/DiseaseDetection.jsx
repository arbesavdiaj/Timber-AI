import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Bug, AlertCircle, Activity } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function DiseaseDetection({ zones, sensors }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState([]);

  const analyzeForDiseases = async () => {
    setAnalyzing(true);
    const results = [];

    for (const zone of zones.slice(0, 5)) {
      const zoneSensors = sensors.filter((s) => s.zone_id === zone.id);

      // Get sensor data patterns
      const sensorData = zoneSensors.map((s) => ({
        type: s.sensor_type,
        reading: s.current_reading,
        history: s.reading_history || [],
      }));

      const prompt = `Analyze this forest zone for early disease and pest infestation signs:
      
Zone: ${zone.name}
Health Score: ${zone.health_score}/100
Canopy Density: ${zone.canopy_density}%
Pest Risk: ${zone.pest_risk}
Drought Stress: ${zone.drought_stress}

Sensor Readings:
${sensorData.map((s) => `- ${s.type}: ${s.reading}`).join("\n")}

Based on sensor patterns, canopy density changes, and environmental conditions, identify:
1. Likelihood of disease presence (0-100%)
2. Specific disease types detected (e.g., bark beetle, root rot, needle blight)
3. Affected area estimate (% of zone)
4. Confidence level
5. Early warning signs observed
6. Recommended immediate actions`;

      try {
        const result = await base44.integrations.Core.InvokeLLM({
          prompt,
          add_context_from_internet: true,
          response_json_schema: {
            type: "object",
            properties: {
              disease_likelihood: { type: "number" },
              detected_diseases: { type: "array", items: { type: "string" } },
              affected_area: { type: "number" },
              confidence: { type: "number" },
              early_signs: { type: "array", items: { type: "string" } },
              immediate_actions: { type: "array", items: { type: "string" } },
            },
          },
        });

        results.push({
          zone_id: zone.id,
          zone_name: zone.name,
          ...result,
        });
      } catch (error) {
        console.error(`Error analyzing zone ${zone.name}:`, error);
      }
    }

    setAnalysis(results);
    setAnalyzing(false);
  };

  useEffect(() => {
    if (zones.length > 0 && sensors.length > 0 && analysis.length === 0) {
      analyzeForDiseases();
    }
  }, [zones, sensors]);

  const getSeverityColor = (likelihood) => {
    if (likelihood >= 70)
      return {
        bg: "bg-red-100",
        text: "text-red-700",
        border: "border-red-300",
      };
    if (likelihood >= 40)
      return {
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        border: "border-yellow-300",
      };
    return {
      bg: "bg-green-100",
      text: "text-green-700",
      border: "border-green-300",
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[#0F2E1D]">
            Early Disease & Pest Detection
          </h3>
          <p className="text-sm text-gray-500">
            AI-powered analysis of sensor and environmental data
          </p>
        </div>
        <Button
          onClick={analyzeForDiseases}
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
              <Activity className="w-4 h-4" />
              Re-analyze
            </>
          )}
        </Button>
      </div>

      {analyzing && analysis.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Loader2 className="w-12 h-12 animate-spin text-[#40916C] mx-auto mb-4" />
            <p className="text-gray-500">
              Analyzing forest zones for disease patterns...
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {analysis.map((item, index) => {
            const severity = getSeverityColor(item.disease_likelihood);

            return (
              <motion.div
                key={item.zone_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`border-2 ${severity.border}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-12 h-12 rounded-xl ${severity.bg} flex items-center justify-center`}
                        >
                          <Bug className={`w-6 h-6 ${severity.text}`} />
                        </div>
                        <div>
                          <CardTitle className="text-base">
                            {item.zone_name}
                          </CardTitle>
                          <p className="text-xs text-gray-500">
                            Disease Risk Assessment
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Likelihood */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          Disease Likelihood
                        </span>
                        <span className={`text-sm font-bold ${severity.text}`}>
                          {item.disease_likelihood}%
                        </span>
                      </div>
                      <Progress
                        value={item.disease_likelihood}
                        className="h-2"
                      />
                    </div>

                    {/* Detected Diseases */}
                    {item.detected_diseases &&
                      item.detected_diseases.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">
                            Detected Threats
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {item.detected_diseases.map((disease, i) => (
                              <Badge
                                key={i}
                                variant="outline"
                                className={`${severity.text}`}
                              >
                                {disease}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Affected Area */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600 mb-1">
                          Affected Area
                        </p>
                        <p className="text-lg font-bold text-[#0F2E1D]">
                          {item.affected_area}%
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600 mb-1">Confidence</p>
                        <p className="text-lg font-bold text-[#0F2E1D]">
                          {item.confidence}%
                        </p>
                      </div>
                    </div>

                    {/* Early Signs */}
                    {item.early_signs && item.early_signs.length > 0 && (
                      <div
                        className={`${severity.bg} rounded-lg p-3 border ${severity.border}`}
                      >
                        <p
                          className={`text-sm font-medium ${severity.text} mb-2`}
                        >
                          Early Warning Signs
                        </p>
                        <ul className={`text-xs ${severity.text} space-y-1`}>
                          {item.early_signs.slice(0, 3).map((sign, i) => (
                            <li key={i}>• {sign}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Actions */}
                    {item.immediate_actions &&
                      item.immediate_actions.length > 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-blue-900 mb-1">
                                Recommended Actions
                              </p>
                              <ul className="text-xs text-blue-700 space-y-1">
                                {item.immediate_actions
                                  .slice(0, 2)
                                  .map((action, i) => (
                                    <li key={i}>• {action}</li>
                                  ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}
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

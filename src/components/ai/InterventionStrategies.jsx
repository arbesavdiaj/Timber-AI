import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Target, Clock, DollarSign, Users } from "lucide-react";

export default function InterventionStrategies({ zones, sensors }) {
  const [generating, setGenerating] = useState(false);
  const [strategies, setStrategies] = useState([]);

  const generateStrategies = async () => {
    setGenerating(true);
    const results = [];

    const criticalZones = zones
      .filter(
        (z) =>
          z.health_score < 70 ||
          z.fire_risk === "high" ||
          z.fire_risk === "extreme",
      )
      .slice(0, 5);

    for (const zone of criticalZones) {
      const prompt = `Generate proactive intervention strategies for this at-risk forest zone:

Zone: ${zone.name}
Area: ${zone.area_acres} acres
Health Score: ${zone.health_score}/100
Fire Risk: ${zone.fire_risk}
Pest Risk: ${zone.pest_risk}
Drought Stress: ${zone.drought_stress}

Provide detailed intervention plan:
1. Primary intervention type (e.g., "Controlled Thinning", "Pest Treatment", "Irrigation")
2. Priority level (Critical/High/Medium)
3. Estimated cost (USD)
4. Timeline (days to implement)
5. Expected impact (health score improvement)
6. Resource requirements
7. Step-by-step action items
8. Success metrics`;

      try {
        const result = await base44.integrations.Core.InvokeLLM({
          prompt,
          response_json_schema: {
            type: "object",
            properties: {
              intervention_type: { type: "string" },
              priority: { type: "string" },
              estimated_cost: { type: "number" },
              timeline_days: { type: "number" },
              expected_improvement: { type: "number" },
              resources: { type: "array", items: { type: "string" } },
              action_items: { type: "array", items: { type: "string" } },
              success_metrics: { type: "array", items: { type: "string" } },
            },
          },
        });

        results.push({
          zone_id: zone.id,
          zone_name: zone.name,
          current_health: zone.health_score,
          ...result,
        });
      } catch (error) {
        console.error(`Error generating strategy for ${zone.name}:`, error);
      }
    }

    setStrategies(results);
    setGenerating(false);
  };

  useEffect(() => {
    if (zones.length > 0 && strategies.length === 0) {
      generateStrategies();
    }
  }, [zones]);

  const getPriorityColor = (priority) => {
    if (priority === "Critical") return "bg-red-500 text-white";
    if (priority === "High") return "bg-orange-500 text-white";
    return "bg-yellow-500 text-white";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[#0F2E1D]">
            Proactive Intervention Strategies
          </h3>
          <p className="text-sm text-gray-500">
            AI-generated action plans for at-risk zones
          </p>
        </div>
        <Button
          onClick={generateStrategies}
          disabled={generating}
          className="bg-[#40916C] hover:bg-[#2D6A4F] rounded-xl gap-2"
        >
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Target className="w-4 h-4" />
              Regenerate
            </>
          )}
        </Button>
      </div>

      {generating && strategies.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Loader2 className="w-12 h-12 animate-spin text-[#40916C] mx-auto mb-4" />
            <p className="text-gray-500">
              Generating intervention strategies...
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {strategies.map((strategy, index) => (
            <motion.div
              key={strategy.zone_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-2 border-[#40916C]/20">
                <CardHeader className="bg-gradient-to-r from-[#40916C]/5 to-[#52B788]/5">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {strategy.zone_name}
                      </CardTitle>
                      <p className="text-sm text-gray-500 mt-1">
                        {strategy.intervention_type}
                      </p>
                    </div>
                    <Badge className={getPriorityColor(strategy.priority)}>
                      {strategy.priority} Priority
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 pt-6">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <DollarSign className="w-4 h-4 text-[#40916C]" />
                        <span className="text-xs text-gray-600">
                          Estimated Cost
                        </span>
                      </div>
                      <p className="text-lg font-bold text-[#0F2E1D]">
                        ${(strategy.estimated_cost / 1000).toFixed(0)}K
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-[#52B788]" />
                        <span className="text-xs text-gray-600">Timeline</span>
                      </div>
                      <p className="text-lg font-bold text-[#0F2E1D]">
                        {strategy.timeline_days} days
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3">
                      <span className="text-xs text-gray-600 block mb-1">
                        Current Health
                      </span>
                      <p className="text-lg font-bold text-[#0F2E1D]">
                        {strategy.current_health}/100
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3">
                      <span className="text-xs text-gray-600 block mb-1">
                        Expected Gain
                      </span>
                      <p className="text-lg font-bold text-green-600">
                        +{strategy.expected_improvement}
                      </p>
                    </div>
                  </div>

                  {/* Resources Required */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-5 h-5 text-[#40916C]" />
                      <h4 className="font-semibold text-[#0F2E1D]">
                        Resources Required
                      </h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {strategy.resources.map((resource, i) => (
                        <Badge
                          key={i}
                          variant="outline"
                          className="text-[#2D6A4F]"
                        >
                          {resource}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Action Items */}
                  <div>
                    <h4 className="font-semibold text-[#0F2E1D] mb-3">
                      Action Plan
                    </h4>
                    <div className="space-y-2">
                      {strategy.action_items.map((item, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg p-3"
                        >
                          <div className="w-6 h-6 rounded-full bg-[#40916C] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {i + 1}
                          </div>
                          <p className="text-sm text-blue-900">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Success Metrics */}
                  <div className="bg-[#40916C]/5 border border-[#40916C]/20 rounded-lg p-4">
                    <h4 className="font-semibold text-[#2D6A4F] mb-2">
                      Success Metrics
                    </h4>
                    <ul className="space-y-1">
                      {strategy.success_metrics.map((metric, i) => (
                        <li key={i} className="text-sm text-gray-700">
                          • {metric}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

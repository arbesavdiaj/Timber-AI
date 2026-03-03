import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Leaf,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function DemoModal({ open, onOpenChange }) {
  const [loading, setLoading] = useState(false);
  const [demoData, setDemoData] = useState(null);
  const [location, setLocation] = useState("45.5,-122.5");

  const generateDemo = async () => {
    setLoading(true);
    setDemoData(null);

    try {
      const [lat, lng] = location.split(",").map((s) => parseFloat(s.trim()));

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Provide a forest health analysis demo for coordinates ${lat}, ${lng}. 
        Include: health_score (0-100), canopy_coverage (%), fire_risk (low/moderate/high/extreme), 
        drought_level (low/moderate/high), key_recommendation (1 sentence), 
        estimated_timber_value (number), carbon_sequestration (tons/year).`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            health_score: { type: "number" },
            canopy_coverage: { type: "number" },
            fire_risk: { type: "string" },
            drought_level: { type: "string" },
            key_recommendation: { type: "string" },
            estimated_timber_value: { type: "number" },
            carbon_sequestration: { type: "number" },
          },
        },
      });

      setDemoData(result);
    } catch (error) {
      console.error("Demo error:", error);
    }
    setLoading(false);
  };

  const getRiskColor = (risk) => {
    if (risk === "low") return "bg-green-100 text-green-700";
    if (risk === "moderate") return "bg-yellow-100 text-yellow-700";
    if (risk === "high") return "bg-orange-100 text-orange-700";
    return "bg-red-100 text-red-700";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Live Forest Intelligence Demo
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label>Enter Coordinates (Latitude, Longitude)</Label>
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="45.5,-122.5"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="rounded-xl"
              />
              <Button
                onClick={generateDemo}
                disabled={loading}
                className="bg-[#40916C] hover:bg-[#2D6A4F] rounded-xl gap-2 whitespace-nowrap"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Analyze
                  </>
                )}
              </Button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {loading && !demoData && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-8"
              >
                <Loader2 className="w-8 h-8 animate-spin text-[#40916C] mx-auto mb-2" />
                <p className="text-sm text-gray-500">
                  Processing satellite data and environmental conditions...
                </p>
              </motion.div>
            )}

            {demoData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="bg-gradient-to-br from-[#40916C]/10 to-[#52B788]/10 rounded-2xl p-6 border border-[#40916C]/20">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-[#0F2E1D]">
                      Forest Health Score
                    </h3>
                    <Badge className="bg-[#40916C] text-white text-lg px-4 py-1">
                      {demoData.health_score}/100
                    </Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-[#40916C] to-[#52B788] h-3 rounded-full transition-all duration-1000"
                      style={{ width: `${demoData.health_score}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Leaf className="w-4 h-4 text-[#40916C]" />
                      <span className="text-sm text-gray-600">
                        Canopy Coverage
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-[#0F2E1D]">
                      {demoData.canopy_coverage}%
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-orange-500" />
                      <span className="text-sm text-gray-600">Fire Risk</span>
                    </div>
                    <Badge className={getRiskColor(demoData.fire_risk)}>
                      {demoData.fire_risk}
                    </Badge>
                  </div>

                  <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-[#52B788]" />
                      <span className="text-sm text-gray-600">
                        Timber Value
                      </span>
                    </div>
                    <p className="text-lg font-bold text-[#0F2E1D]">
                      ${(demoData.estimated_timber_value / 1000).toFixed(0)}K
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Leaf className="w-4 h-4 text-[#74C69D]" />
                      <span className="text-sm text-gray-600">Carbon/Year</span>
                    </div>
                    <p className="text-lg font-bold text-[#0F2E1D]">
                      {demoData.carbon_sequestration.toLocaleString()} tons
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-sm font-medium text-blue-900 mb-2">
                    AI Recommendation
                  </p>
                  <p className="text-sm text-blue-700">
                    {demoData.key_recommendation}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!demoData && !loading && (
            <div className="text-center py-4 text-sm text-gray-500">
              Enter forest coordinates to see real-time AI analysis
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

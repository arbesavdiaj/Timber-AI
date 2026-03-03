import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Brain,
  Bug,
  Flame,
  TrendingUp,
  RefreshCw,
  Target,
} from "lucide-react";
import DiseaseDetection from "@/components/ai/DiseaseDetection";
import RiskPrediction from "@/components/ai/RiskPrediction";
import TrendAnalysis from "@/components/ai/TrendAnalysis";
import InterventionStrategies from "@/components/ai/InterventionStrategies";

export default function AIAnalysis() {
  const [activeTab, setActiveTab] = useState("disease");

  const { data: zones = [], refetch: refetchZones } = useQuery({
    queryKey: ["forestZones"],
    queryFn: () => base44.entities.ForestZone.list("-health_score"),
    initialData: [],
  });

  const { data: sensors = [], refetch: refetchSensors } = useQuery({
    queryKey: ["allSensors"],
    queryFn: async () => {
      const allSensors = [];
      for (const zone of zones) {
        const zoneSensors = await base44.entities.IoTSensor.filter({
          zone_id: zone.id,
        });
        allSensors.push(...zoneSensors);
      }
      return allSensors;
    },
    enabled: zones.length > 0,
    initialData: [],
  });

  const handleRefresh = () => {
    refetchZones();
    refetchSensors();
  };

  return (
    <div className="min-h-screen pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#40916C] to-[#52B788] flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-[#0F2E1D]">
                  AI Forest Analysis
                </h1>
                <p className="text-gray-500">
                  Advanced predictive insights and risk assessment
                </p>
              </div>
            </div>
          </div>
          <Button
            onClick={handleRefresh}
            variant="outline"
            className="border-[#40916C]/30 text-[#2D6A4F] hover:bg-[#40916C]/10 rounded-xl gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Analysis
          </Button>
        </motion.div>

        {/* Main Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-xl p-1 shadow-lg">
            <TabsTrigger
              value="disease"
              className="rounded-lg data-[state=active]:bg-[#2D6A4F] data-[state=active]:text-white gap-2"
            >
              <Bug className="w-4 h-4" />
              Disease Detection
            </TabsTrigger>
            <TabsTrigger
              value="risks"
              className="rounded-lg data-[state=active]:bg-[#2D6A4F] data-[state=active]:text-white gap-2"
            >
              <Flame className="w-4 h-4" />
              Risk Prediction
            </TabsTrigger>
            <TabsTrigger
              value="trends"
              className="rounded-lg data-[state=active]:bg-[#2D6A4F] data-[state=active]:text-white gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              Historical Trends
            </TabsTrigger>
            <TabsTrigger
              value="intervention"
              className="rounded-lg data-[state=active]:bg-[#2D6A4F] data-[state=active]:text-white gap-2"
            >
              <Target className="w-4 h-4" />
              Interventions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="disease">
            <DiseaseDetection zones={zones} sensors={sensors} />
          </TabsContent>

          <TabsContent value="risks">
            <RiskPrediction zones={zones} sensors={sensors} />
          </TabsContent>

          <TabsContent value="trends">
            <TrendAnalysis zones={zones} />
          </TabsContent>

          <TabsContent value="intervention">
            <InterventionStrategies zones={zones} sensors={sensors} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

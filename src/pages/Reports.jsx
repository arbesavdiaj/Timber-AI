import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  FileText,
  Plus,
  Calendar,
  Clock,
  CheckCircle,
  TreePine,
  Shield,
  TrendingUp,
  Leaf,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import AdvancedReportDialog from "@/components/reports/AdvancedReportDialog";
import ReportDownload from "@/components/reports/ReportDownload";
import ReportVisualizations from "@/components/reports/ReportVisualizations";

const reportTypes = [
  {
    value: "management_plan",
    label: "Management Plan",
    icon: TreePine,
    color: "#40916C",
  },
  {
    value: "health_assessment",
    label: "Health Assessment",
    icon: Shield,
    color: "#52B788",
  },
  {
    value: "harvest_schedule",
    label: "Harvest Schedule",
    icon: TrendingUp,
    color: "#74C69D",
  },
  {
    value: "risk_analysis",
    label: "Risk Analysis",
    icon: Leaf,
    color: "#2D6A4F",
  },
];

export default function Reports() {
  const [showNewReport, setShowNewReport] = useState(false);

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["reports"],
    queryFn: () => base44.entities.Report.list("-created_date"),
    initialData: [],
  });

  const { data: zones = [] } = useQuery({
    queryKey: ["forestZones"],
    queryFn: () => base44.entities.ForestZone.list("-health_score"),
    initialData: [],
  });

  const getReportTypeInfo = (type) => {
    return reportTypes.find((t) => t.value === type) || reportTypes[0];
  };

  const sampleReports =
    reports.length > 0
      ? reports
      : [
          {
            id: "sample1",
            title: "Q4 2024 Forest Management Plan",
            report_type: "management_plan",
            status: "ready",
            created_date: new Date().toISOString(),
            summary:
              "Comprehensive management plan covering 52,700 acres across 5 forest zones.",
            recommendations: [
              "Prioritize fire prevention",
              "Schedule selective harvesting",
              "Implement enhanced monitoring",
            ],
          },
          {
            id: "sample2",
            title: "Annual Health Assessment 2024",
            report_type: "health_assessment",
            status: "ready",
            created_date: new Date(Date.now() - 86400000 * 3).toISOString(),
            summary:
              "Complete health evaluation with AI-detected stress patterns and growth projections.",
            recommendations: [
              "Address drought stress in Zone C",
              "Monitor bark beetle activity",
            ],
          },
        ];

  return (
    <div className="min-h-screen pb-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-[#0F2E1D]">
              Reports
            </h1>
            <p className="text-gray-500">
              Generate AI-powered management reports
            </p>
          </div>
          <Button
            onClick={() => setShowNewReport(true)}
            className="bg-[#40916C] hover:bg-[#2D6A4F] rounded-xl gap-2"
          >
            <Plus className="w-5 h-5" />
            Generate Report
          </Button>
        </motion.div>

        {/* Report Analytics Overview */}
        {zones.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#0F2E1D]">
                Forest Analytics Dashboard
              </h2>
              <Badge variant="outline" className="text-xs">
                Live Data
              </Badge>
            </div>
            <ReportVisualizations zones={zones} reportType="overview" />
          </motion.div>
        )}

        {/* Reports Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleReports.map((report, index) => {
            const typeInfo = getReportTypeInfo(report.report_type);
            const Icon = typeInfo.icon;

            return (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${typeInfo.color}15` }}
                      >
                        <Icon
                          className="w-6 h-6"
                          style={{ color: typeInfo.color }}
                        />
                      </div>
                      <Badge
                        className={`${report.status === "ready" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                      >
                        {report.status === "ready" ? (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        ) : (
                          <Clock className="w-3 h-3 mr-1" />
                        )}
                        {report.status === "ready" ? "Ready" : "Generating"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <h3 className="font-semibold text-[#0F2E1D] mb-2 line-clamp-2">
                      {report.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                      {report.summary}
                    </p>

                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(report.created_date), "MMM d, yyyy")}
                    </div>

                    {report.status === "ready" && (
                      <ReportDownload report={report} />
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Empty State */}
        {sampleReports.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[#0F2E1D] mb-2">
              No Reports Yet
            </h3>
            <p className="text-gray-500 mb-6">
              Generate your first AI-powered management report.
            </p>
            <Button
              onClick={() => setShowNewReport(true)}
              className="bg-[#40916C] hover:bg-[#2D6A4F] rounded-xl gap-2"
            >
              <Plus className="w-5 h-5" />
              Generate Report
            </Button>
          </motion.div>
        )}
      </div>

      <AdvancedReportDialog
        open={showNewReport}
        onOpenChange={setShowNewReport}
      />
    </div>
  );
}

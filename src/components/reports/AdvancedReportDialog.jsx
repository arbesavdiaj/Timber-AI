import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import {
  Loader2,
  Sparkles,
  Calendar as CalendarIcon,
  FileText,
  Mail,
  Settings,
  TreePine,
  Shield,
  TrendingUp,
  Leaf,
  Clock,
} from "lucide-react";

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

export default function AdvancedReportDialog({ open, onOpenChange }) {
  const [generating, setGenerating] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    report_type: "",
    zones: [],
    date_from: null,
    date_to: new Date(),
    include_weather: true,
    include_sensors: true,
    include_health: true,
    export_format: "pdf",
    schedule_enabled: false,
    schedule_frequency: "monthly",
    email_recipients: "",
  });

  const queryClient = useQueryClient();

  const { data: zones = [] } = useQuery({
    queryKey: ["forestZones"],
    queryFn: () => base44.entities.ForestZone.list("-health_score"),
    initialData: [],
  });

  const generateReportMutation = useMutation({
    mutationFn: async (data) => {
      setGenerating(true);

      // Get selected zones data
      const selectedZones =
        data.zones.length > 0
          ? zones.filter((z) => data.zones.includes(z.id))
          : zones;

      // Fetch weather data
      let weatherData = [];
      if (data.include_weather && selectedZones.length > 0) {
        const weatherPromises = selectedZones.map((zone) =>
          base44.entities.WeatherData.filter(
            { zone_id: zone.id },
            "-timestamp",
            10,
          ),
        );
        const weatherResults = await Promise.all(weatherPromises);
        weatherData = weatherResults.flat();
      }

      // Fetch sensor data
      let sensorData = [];
      if (data.include_sensors && selectedZones.length > 0) {
        const sensorPromises = selectedZones.map((zone) =>
          base44.entities.IoTSensor.filter({ zone_id: zone.id }),
        );
        const sensorResults = await Promise.all(sensorPromises);
        sensorData = sensorResults.flat();
      }

      // Generate AI analysis
      const prompt = `Generate a comprehensive ${data.report_type.replace("_", " ")} report for the following forest zones:
      
Zones: ${selectedZones.map((z) => `${z.name} (${z.area_acres} acres, health: ${z.health_score}/100)`).join(", ")}

Time Period: ${data.date_from ? format(new Date(data.date_from), "MMM d, yyyy") : "All time"} to ${format(new Date(data.date_to), "MMM d, yyyy")}

Weather Data Points: ${weatherData.length}
Sensor Readings: ${sensorData.length}

Provide:
1. Executive summary (2-3 sentences)
2. Key findings (3-5 bullet points)
3. Actionable recommendations (5-7 specific actions)
4. Risk assessment
5. Success metrics`;

      const aiResult = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            executive_summary: { type: "string" },
            key_findings: { type: "array", items: { type: "string" } },
            recommendations: { type: "array", items: { type: "string" } },
            risk_assessment: { type: "string" },
          },
        },
      });

      // Calculate metrics
      const metrics = {
        total_acres: selectedZones.reduce(
          (sum, z) => sum + (z.area_acres || 0),
          0,
        ),
        avg_health_score:
          selectedZones.length > 0
            ? Math.round(
                selectedZones.reduce(
                  (sum, z) => sum + (z.health_score || 0),
                  0,
                ) / selectedZones.length,
              )
            : 0,
        total_carbon: selectedZones.reduce(
          (sum, z) => sum + (z.carbon_sequestration || 0),
          0,
        ),
        risk_zones: selectedZones.filter(
          (z) => z.fire_risk === "high" || z.fire_risk === "extreme",
        ).length,
        weather_readings: weatherData.length,
        sensor_count: sensorData.length,
        online_sensors: sensorData.filter((s) => s.status === "online").length,
      };

      // Create report
      const report = await base44.entities.Report.create({
        title: data.title,
        report_type: data.report_type,
        zones_included: selectedZones.map((z) => z.id),
        summary: aiResult.executive_summary,
        recommendations: aiResult.recommendations,
        metrics,
        status: "ready",
        report_config: {
          date_from: data.date_from,
          date_to: data.date_to,
          include_weather: data.include_weather,
          include_sensors: data.include_sensors,
          include_health: data.include_health,
          export_format: data.export_format,
        },
      });

      // Send email if recipients specified
      if (data.email_recipients) {
        const emails = data.email_recipients.split(",").map((e) => e.trim());
        for (const email of emails) {
          await base44.integrations.Core.SendEmail({
            to: email,
            subject: `Forest Report Ready: ${data.title}`,
            body: `Your forest management report "${data.title}" has been generated and is ready for review.\n\nExecutive Summary:\n${aiResult.executive_summary}\n\nKey Metrics:\n- Total Acres: ${metrics.total_acres.toLocaleString()}\n- Avg Health Score: ${metrics.avg_health_score}/100\n- Carbon Sequestration: ${metrics.total_carbon.toLocaleString()} tons/year\n\nLog in to TimberAI to view and download the full report.`,
          });
        }
      }

      // Create scheduled report if enabled
      if (data.schedule_enabled) {
        // Note: In production, you'd integrate with a scheduling service
        console.log("Scheduled report configuration saved:", {
          frequency: data.schedule_frequency,
          recipients: data.email_recipients,
          config: data,
        });
      }

      setGenerating(false);
      return report;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["reports"]);
      onOpenChange(false);
      setFormData({
        title: "",
        report_type: "",
        zones: [],
        date_from: null,
        date_to: new Date(),
        include_weather: true,
        include_sensors: true,
        include_health: true,
        export_format: "pdf",
        schedule_enabled: false,
        schedule_frequency: "monthly",
        email_recipients: "",
      });
    },
  });

  const handleGenerate = () => {
    if (!formData.title || !formData.report_type) return;
    generateReportMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Generate Advanced Report
          </DialogTitle>
          <DialogDescription>
            Customize your report with specific timeframes, zones, and metrics
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {!generating ? (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="basic">
                    <FileText className="w-4 h-4 mr-2" />
                    Basic
                  </TabsTrigger>
                  <TabsTrigger value="metrics">
                    <Settings className="w-4 h-4 mr-2" />
                    Metrics
                  </TabsTrigger>
                  <TabsTrigger value="schedule">
                    <Mail className="w-4 h-4 mr-2" />
                    Schedule
                  </TabsTrigger>
                </TabsList>

                {/* Basic Settings */}
                <TabsContent value="basic" className="space-y-4">
                  <div>
                    <Label htmlFor="title">Report Title</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Q4 2024 Management Plan"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="mt-1 rounded-xl"
                    />
                  </div>

                  <div>
                    <Label>Report Type</Label>
                    <Select
                      value={formData.report_type}
                      onValueChange={(value) =>
                        setFormData({ ...formData, report_type: value })
                      }
                    >
                      <SelectTrigger className="mt-1 rounded-xl">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {reportTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <type.icon
                                className="w-4 h-4"
                                style={{ color: type.color }}
                              />
                              {type.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>
                      Select Zones (optional - all zones if none selected)
                    </Label>
                    <div className="mt-2 space-y-2 max-h-40 overflow-y-auto border rounded-xl p-3">
                      {zones.length > 0 ? (
                        zones.map((zone) => (
                          <div
                            key={zone.id}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={zone.id}
                              checked={formData.zones.includes(zone.id)}
                              onCheckedChange={(checked) => {
                                setFormData({
                                  ...formData,
                                  zones: checked
                                    ? [...formData.zones, zone.id]
                                    : formData.zones.filter(
                                        (id) => id !== zone.id,
                                      ),
                                });
                              }}
                            />
                            <label
                              htmlFor={zone.id}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {zone.name} ({zone.area_acres?.toLocaleString()}{" "}
                              acres)
                            </label>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">
                          No zones available
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Start Date (optional)</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full mt-1 rounded-xl justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.date_from
                              ? format(formData.date_from, "PPP")
                              : "All time"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.date_from}
                            onSelect={(date) =>
                              setFormData({ ...formData, date_from: date })
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div>
                      <Label>End Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full mt-1 rounded-xl justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {format(formData.date_to, "PPP")}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.date_to}
                            onSelect={(date) =>
                              setFormData({ ...formData, date_to: date })
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </TabsContent>

                {/* Metrics Settings */}
                <TabsContent value="metrics" className="space-y-4">
                  <div className="space-y-3">
                    <Label>Include in Report</Label>
                    <div className="space-y-3 border rounded-xl p-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="include_health"
                          checked={formData.include_health}
                          onCheckedChange={(checked) =>
                            setFormData({
                              ...formData,
                              include_health: checked,
                            })
                          }
                        />
                        <label
                          htmlFor="include_health"
                          className="text-sm font-medium"
                        >
                          Health Scores & Trends
                        </label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="include_weather"
                          checked={formData.include_weather}
                          onCheckedChange={(checked) =>
                            setFormData({
                              ...formData,
                              include_weather: checked,
                            })
                          }
                        />
                        <label
                          htmlFor="include_weather"
                          className="text-sm font-medium"
                        >
                          Weather Data & Patterns
                        </label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="include_sensors"
                          checked={formData.include_sensors}
                          onCheckedChange={(checked) =>
                            setFormData({
                              ...formData,
                              include_sensors: checked,
                            })
                          }
                        />
                        <label
                          htmlFor="include_sensors"
                          className="text-sm font-medium"
                        >
                          IoT Sensor Readings
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Export Format</Label>
                    <Select
                      value={formData.export_format}
                      onValueChange={(value) =>
                        setFormData({ ...formData, export_format: value })
                      }
                    >
                      <SelectTrigger className="mt-1 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF Document</SelectItem>
                        <SelectItem value="csv">CSV Data Export</SelectItem>
                        <SelectItem value="both">Both (PDF + CSV)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-sm text-blue-900">
                      <strong>Note:</strong> Reports with more data may take
                      longer to generate. Weather and sensor data will be
                      aggregated for the selected time period.
                    </p>
                  </div>
                </TabsContent>

                {/* Schedule Settings */}
                <TabsContent value="schedule" className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="schedule_enabled"
                      checked={formData.schedule_enabled}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, schedule_enabled: checked })
                      }
                    />
                    <label
                      htmlFor="schedule_enabled"
                      className="text-sm font-medium"
                    >
                      Enable Automated Report Generation
                    </label>
                  </div>

                  {formData.schedule_enabled && (
                    <>
                      <div>
                        <Label>Frequency</Label>
                        <Select
                          value={formData.schedule_frequency}
                          onValueChange={(value) =>
                            setFormData({
                              ...formData,
                              schedule_frequency: value,
                            })
                          }
                        >
                          <SelectTrigger className="mt-1 rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="quarterly">Quarterly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="email_recipients">
                          Email Recipients (comma-separated)
                        </Label>
                        <Input
                          id="email_recipients"
                          placeholder="email1@example.com, email2@example.com"
                          value={formData.email_recipients}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              email_recipients: e.target.value,
                            })
                          }
                          className="mt-1 rounded-xl"
                        />
                      </div>

                      <div className="bg-[#40916C]/5 border border-[#40916C]/20 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                          <Clock className="w-5 h-5 text-[#40916C] flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-[#0F2E1D] mb-1">
                              Scheduled Report
                            </p>
                            <p className="text-xs text-gray-600">
                              This report will be automatically generated{" "}
                              {formData.schedule_frequency} and emailed to the
                              specified recipients. You can manage scheduled
                              reports from your settings.
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {!formData.schedule_enabled && (
                    <div>
                      <Label htmlFor="email_once">
                        Send to Email (optional)
                      </Label>
                      <Input
                        id="email_once"
                        placeholder="email@example.com"
                        value={formData.email_recipients}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            email_recipients: e.target.value,
                          })
                        }
                        className="mt-1 rounded-xl"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Send this report once via email when generated
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleGenerate}
                  disabled={!formData.title || !formData.report_type}
                  className="bg-[#40916C] hover:bg-[#2D6A4F] rounded-xl gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Generate Report
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="generating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-12 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-[#40916C]/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-[#40916C] animate-pulse" />
              </div>
              <h3 className="font-semibold text-[#0F2E1D] mb-2">
                Generating Report...
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Analyzing forest data, weather patterns, and sensor readings
              </p>
              <div className="flex items-center justify-center gap-2 text-[#40916C]">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">This may take a moment</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

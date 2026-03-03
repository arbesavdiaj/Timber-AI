import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  Flame,
  Activity,
  TrendingDown,
  Cloud,
  CheckCircle,
  Mail,
  Clock,
  ChevronRight,
  Bell,
  BellOff,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";

const alertIcons = {
  fire_risk: Flame,
  sensor_critical: Activity,
  health_decline: TrendingDown,
  weather_warning: Cloud,
  system: AlertTriangle,
};

const severityColors = {
  critical: {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
    icon: "text-red-500",
    badge: "bg-red-100 text-red-700",
  },
  high: {
    bg: "bg-orange-50",
    border: "border-orange-200",
    text: "text-orange-700",
    icon: "text-orange-500",
    badge: "bg-orange-100 text-orange-700",
  },
  medium: {
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    text: "text-yellow-700",
    icon: "text-yellow-500",
    badge: "bg-yellow-100 text-yellow-700",
  },
  low: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
    icon: "text-blue-500",
    badge: "bg-blue-100 text-blue-700",
  },
};

function AlertCard({ alert, onAcknowledge, onEmailNotify }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = alertIcons[alert.alert_type] || AlertTriangle;
  const colors = severityColors[alert.severity] || severityColors.medium;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`rounded-xl border-2 ${colors.border} ${colors.bg} overflow-hidden ${
        alert.status === "acknowledged" ? "opacity-60" : ""
      }`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center flex-shrink-0`}
          >
            <Icon className={`w-5 h-5 ${colors.icon}`} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <h4 className={`font-semibold ${colors.text} text-sm mb-1`}>
                  {alert.title}
                </h4>
                <p className="text-xs text-gray-600">{alert.zone_name}</p>
              </div>
              <Badge className={colors.badge}>{alert.severity}</Badge>
            </div>

            <p className="text-sm text-gray-700 mb-3">{alert.message}</p>

            {alert.metric_value !== undefined &&
              alert.threshold_value !== undefined && (
                <div className="flex items-center gap-4 text-xs text-gray-600 mb-3">
                  <span>
                    Current:{" "}
                    <strong className={colors.text}>
                      {alert.metric_value}
                    </strong>
                  </span>
                  <span>
                    Threshold: <strong>{alert.threshold_value}</strong>
                  </span>
                </div>
              )}

            {expanded &&
              alert.recommendations &&
              alert.recommendations.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="bg-white/50 rounded-lg p-3 mb-3 border border-gray-200"
                >
                  <p className="text-xs font-medium text-gray-700 mb-2">
                    AI Recommendations:
                  </p>
                  <ul className="space-y-1">
                    {alert.recommendations.map((rec, idx) => (
                      <li
                        key={idx}
                        className="text-xs text-gray-600 flex items-start gap-2"
                      >
                        <ChevronRight className="w-3 h-3 flex-shrink-0 mt-0.5" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}

            <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
              <Clock className="w-3 h-3" />
              <span>
                {format(new Date(alert.created_date), "MMM d, h:mm a")}
              </span>
              {alert.email_sent && (
                <>
                  <span>•</span>
                  <Mail className="w-3 h-3" />
                  <span>Email sent</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              {alert.status === "active" && (
                <>
                  <Button
                    size="sm"
                    onClick={() => onAcknowledge(alert)}
                    className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 h-8 px-3 text-xs rounded-lg"
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Acknowledge
                  </Button>
                  {!alert.email_sent && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEmailNotify(alert)}
                      className="h-8 px-3 text-xs rounded-lg"
                    >
                      <Mail className="w-3 h-3 mr-1" />
                      Email
                    </Button>
                  )}
                </>
              )}
              {alert.recommendations && alert.recommendations.length > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setExpanded(!expanded)}
                  className="h-8 px-3 text-xs"
                >
                  {expanded ? "Less" : "More"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function AlertsPanel({ compact = false }) {
  const queryClient = useQueryClient();
  const [showAcknowledged, setShowAcknowledged] = useState(false);

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ["alerts"],
    queryFn: () => base44.entities.Alert.list("-created_date", 50),
    refetchInterval: 30000, // Refresh every 30 seconds
    initialData: [],
  });

  const acknowledgeMutation = useMutation({
    mutationFn: async (alert) => {
      const user = await base44.auth.me();
      return base44.entities.Alert.update(alert.id, {
        status: "acknowledged",
        acknowledged_by: user.email,
        acknowledged_at: new Date().toISOString(),
      });
    },
    onSuccess: () => queryClient.invalidateQueries(["alerts"]),
  });

  const emailNotifyMutation = useMutation({
    mutationFn: async (alert) => {
      const user = await base44.auth.me();
      await base44.integrations.Core.SendEmail({
        to: user.email,
        subject: `[Timber AI Alert] ${alert.severity.toUpperCase()}: ${alert.title}`,
        body: `
Alert Details:
- Zone: ${alert.zone_name}
- Severity: ${alert.severity}
- Type: ${alert.alert_type}

${alert.message}

${alert.metric_value !== undefined ? `Current Value: ${alert.metric_value}` : ""}
${alert.threshold_value !== undefined ? `Threshold: ${alert.threshold_value}` : ""}

${
  alert.recommendations && alert.recommendations.length > 0
    ? `
Recommendations:
${alert.recommendations.map((r) => `- ${r}`).join("\n")}
`
    : ""
}

View in Timber AI Dashboard: ${window.location.origin}/Dashboard
        `,
      });

      await base44.entities.Alert.update(alert.id, { email_sent: true });
    },
    onSuccess: () => queryClient.invalidateQueries(["alerts"]),
  });

  const activeAlerts = alerts.filter((a) => a.status === "active");
  const acknowledgedAlerts = alerts.filter((a) => a.status === "acknowledged");
  const displayAlerts = showAcknowledged ? alerts : activeAlerts;

  const criticalCount = activeAlerts.filter(
    (a) => a.severity === "critical",
  ).length;
  const highCount = activeAlerts.filter((a) => a.severity === "high").length;

  if (compact) {
    return (
      <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <Bell className="w-6 h-6 text-orange-600 animate-pulse" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-orange-900 mb-1">
                {activeAlerts.length} Active Alert
                {activeAlerts.length !== 1 ? "s" : ""}
              </h3>
              <p className="text-sm text-orange-700">
                {criticalCount > 0 && `${criticalCount} critical`}
                {criticalCount > 0 && highCount > 0 && ", "}
                {highCount > 0 && `${highCount} high priority`}
              </p>
            </div>
            <Button
              size="sm"
              className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl"
              onClick={() =>
                document
                  .getElementById("alerts-section")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              View All
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card id="alerts-section">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <Bell
                className={`w-5 h-5 text-orange-600 ${activeAlerts.length > 0 ? "animate-pulse" : ""}`}
              />
            </div>
            <div>
              <CardTitle className="text-lg">Alert System</CardTitle>
              <p className="text-sm text-gray-500">
                {activeAlerts.length} active, {acknowledgedAlerts.length}{" "}
                acknowledged
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAcknowledged(!showAcknowledged)}
            className="rounded-xl gap-2"
          >
            {showAcknowledged ? (
              <BellOff className="w-4 h-4" />
            ) : (
              <Bell className="w-4 h-4" />
            )}
            {showAcknowledged ? "Active Only" : "Show All"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <AnimatePresence mode="popLayout">
            {displayAlerts.length > 0 ? (
              <div className="space-y-3">
                {displayAlerts.map((alert) => (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                    onAcknowledge={() => acknowledgeMutation.mutate(alert)}
                    onEmailNotify={() => emailNotifyMutation.mutate(alert)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-1">All Clear</h3>
                <p className="text-sm text-gray-500">
                  No active alerts at this time.
                </p>
              </div>
            )}
          </AnimatePresence>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bell, Save, AlertTriangle, Mail, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";

export default function AlertSettings() {
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState(null);
  const [preferences, setPreferences] = useState({
    disease_threshold: 40,
    fire_risk_threshold: "high",
    drought_threshold: "high",
    health_score_threshold: 60,
    pest_risk_threshold: "moderate",
    enable_email_alerts: true,
    enable_critical_only: false,
    notification_frequency: "immediate",
  });

  useEffect(() => {
    base44.auth.me().then((user) => setCurrentUser(user));
  }, []);

  const { data: existingPrefs, isLoading } = useQuery({
    queryKey: ["alertPreferences", currentUser?.email],
    queryFn: async () => {
      const prefs = await base44.entities.AlertPreference.filter({
        user_email: currentUser.email,
      });
      return prefs[0] || null;
    },
    enabled: !!currentUser,
  });

  useEffect(() => {
    if (existingPrefs) {
      setPreferences({
        disease_threshold: existingPrefs.disease_threshold || 40,
        fire_risk_threshold: existingPrefs.fire_risk_threshold || "high",
        drought_threshold: existingPrefs.drought_threshold || "high",
        health_score_threshold: existingPrefs.health_score_threshold || 60,
        pest_risk_threshold: existingPrefs.pest_risk_threshold || "moderate",
        enable_email_alerts: existingPrefs.enable_email_alerts ?? true,
        enable_critical_only: existingPrefs.enable_critical_only ?? false,
        notification_frequency:
          existingPrefs.notification_frequency || "immediate",
      });
    }
  }, [existingPrefs]);

  const saveMutation = useMutation({
    mutationFn: async (prefs) => {
      if (existingPrefs) {
        return await base44.entities.AlertPreference.update(
          existingPrefs.id,
          prefs,
        );
      } else {
        return await base44.entities.AlertPreference.create({
          user_email: currentUser.email,
          ...prefs,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alertPreferences"] });
      toast.success("Alert preferences saved successfully!");
    },
  });

  const handleSave = () => {
    saveMutation.mutate(preferences);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#40916C]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#40916C] to-[#52B788] flex items-center justify-center">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-[#0F2E1D]">
                Alert Settings
              </h1>
              <p className="text-gray-500">
                Configure your AI-driven alert preferences
              </p>
            </div>
          </div>
        </motion.div>

        <div className="space-y-6">
          {/* Threshold Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[#40916C]" />
                Alert Thresholds
              </CardTitle>
              <CardDescription>
                Set the sensitivity levels for automatic alert generation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Disease Detection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Disease Detection Threshold</Label>
                  <Badge variant="outline">
                    {preferences.disease_threshold}%
                  </Badge>
                </div>
                <Slider
                  value={[preferences.disease_threshold]}
                  onValueChange={(val) =>
                    setPreferences({
                      ...preferences,
                      disease_threshold: val[0],
                    })
                  }
                  min={0}
                  max={100}
                  step={5}
                  className="[&_[role=slider]]:bg-[#40916C]"
                />
                <p className="text-xs text-gray-500">
                  Alert when disease likelihood exceeds this percentage
                </p>
              </div>

              {/* Health Score */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Health Score Alert Level</Label>
                  <Badge variant="outline">
                    {preferences.health_score_threshold}/100
                  </Badge>
                </div>
                <Slider
                  value={[preferences.health_score_threshold]}
                  onValueChange={(val) =>
                    setPreferences({
                      ...preferences,
                      health_score_threshold: val[0],
                    })
                  }
                  min={0}
                  max={100}
                  step={5}
                  className="[&_[role=slider]]:bg-[#40916C]"
                />
                <p className="text-xs text-gray-500">
                  Alert when zone health drops below this score
                </p>
              </div>

              {/* Fire Risk */}
              <div className="space-y-2">
                <Label>Fire Risk Alert Level</Label>
                <Select
                  value={preferences.fire_risk_threshold}
                  onValueChange={(val) =>
                    setPreferences({ ...preferences, fire_risk_threshold: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="moderate">Moderate or Higher</SelectItem>
                    <SelectItem value="high">High or Higher</SelectItem>
                    <SelectItem value="extreme">Extreme Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Drought Level */}
              <div className="space-y-2">
                <Label>Drought Stress Alert Level</Label>
                <Select
                  value={preferences.drought_threshold}
                  onValueChange={(val) =>
                    setPreferences({ ...preferences, drought_threshold: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="moderate">Moderate or Higher</SelectItem>
                    <SelectItem value="high">High or Higher</SelectItem>
                    <SelectItem value="severe">Severe Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Pest Risk */}
              <div className="space-y-2">
                <Label>Pest Risk Alert Level</Label>
                <Select
                  value={preferences.pest_risk_threshold}
                  onValueChange={(val) =>
                    setPreferences({ ...preferences, pest_risk_threshold: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low or Higher</SelectItem>
                    <SelectItem value="moderate">Moderate or Higher</SelectItem>
                    <SelectItem value="high">High Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-[#40916C]" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Choose how and when you receive alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email Alerts */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Email Notifications</Label>
                  <p className="text-xs text-gray-500">
                    Receive alerts via email at {currentUser?.email}
                  </p>
                </div>
                <Switch
                  checked={preferences.enable_email_alerts}
                  onCheckedChange={(val) =>
                    setPreferences({ ...preferences, enable_email_alerts: val })
                  }
                  className="data-[state=checked]:bg-[#40916C]"
                />
              </div>

              {/* Critical Only */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Critical Alerts Only</Label>
                  <p className="text-xs text-gray-500">
                    Only receive critical severity notifications
                  </p>
                </div>
                <Switch
                  checked={preferences.enable_critical_only}
                  onCheckedChange={(val) =>
                    setPreferences({
                      ...preferences,
                      enable_critical_only: val,
                    })
                  }
                  className="data-[state=checked]:bg-[#40916C]"
                />
              </div>

              {/* Frequency */}
              <div className="space-y-2">
                <Label>Notification Frequency</Label>
                <Select
                  value={preferences.notification_frequency}
                  onValueChange={(val) =>
                    setPreferences({
                      ...preferences,
                      notification_frequency: val,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="hourly">Hourly Digest</SelectItem>
                    <SelectItem value="daily">Daily Summary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="bg-[#40916C] hover:bg-[#2D6A4F] rounded-xl px-8 gap-2"
            >
              {saveMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Preferences
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

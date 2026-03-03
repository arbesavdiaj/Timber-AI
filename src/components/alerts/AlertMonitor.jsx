import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { generateAlertsForZones, sendEmailAlert } from "./AlertGenerator";

// This component monitors metrics and generates alerts
export default function AlertMonitor() {
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    base44.auth
      .me()
      .then((user) => setCurrentUser(user))
      .catch(() => {});
  }, []);

  const { data: zones = [] } = useQuery({
    queryKey: ["forestZones"],
    queryFn: () => base44.entities.ForestZone.list(),
    refetchInterval: 60000,
    initialData: [],
  });

  const { data: weatherData = [] } = useQuery({
    queryKey: ["weatherData"],
    queryFn: () => base44.entities.WeatherData.list("-timestamp", 10),
    initialData: [],
  });

  const { data: sensors = [] } = useQuery({
    queryKey: ["allSensors"],
    queryFn: () => base44.entities.IoTSensor.list(),
    initialData: [],
  });

  const { data: existingAlerts = [] } = useQuery({
    queryKey: ["alerts"],
    queryFn: () => base44.entities.Alert.filter({ status: "active" }),
    refetchInterval: 30000,
    initialData: [],
  });

  const { data: userPreferences } = useQuery({
    queryKey: ["alertPreferences", currentUser?.email],
    queryFn: async () => {
      const prefs = await base44.entities.AlertPreference.filter({
        user_email: currentUser.email,
      });
      return prefs[0] || null;
    },
    enabled: !!currentUser,
  });

  const checkAndCreateAlert = async (alertData) => {
    // Check if similar alert already exists for this zone
    const duplicate = existingAlerts.find(
      (a) =>
        a.zone_id === alertData.zone_id &&
        a.alert_type === alertData.alert_type &&
        a.status === "active",
    );

    if (!duplicate) {
      const createdAlert = await base44.entities.Alert.create(alertData);
      queryClient.invalidateQueries(["alerts"]);

      // Send email if user preferences allow
      if (currentUser && userPreferences?.enable_email_alerts) {
        if (
          !userPreferences.enable_critical_only ||
          alertData.severity === "critical"
        ) {
          await sendEmailAlert(currentUser.email, createdAlert);
        }
      }
    }
  };

  // Auto-generate alerts based on user preferences and conditions
  useEffect(() => {
    const checkAndGenerateAlerts = async () => {
      if (!zones.length || !userPreferences || !currentUser) return;

      const newAlerts = await generateAlertsForZones(zones, userPreferences);

      for (const alertData of newAlerts) {
        await checkAndCreateAlert(alertData);
      }
    };

    const interval = setInterval(checkAndGenerateAlerts, 120000); // Check every 2 minutes
    checkAndGenerateAlerts(); // Initial check

    return () => clearInterval(interval);
  }, [zones, userPreferences, currentUser, existingAlerts]);

  // Monitor fire risk from weather data
  useEffect(() => {
    if (weatherData.length === 0) return;

    weatherData.forEach(async (weather) => {
      if (weather.fire_weather_index >= 75) {
        const zone = zones.find((z) => z.id === weather.zone_id);
        await checkAndCreateAlert({
          zone_id: weather.zone_id,
          zone_name: zone?.name || "Unknown Zone",
          alert_type: "fire_risk",
          severity: weather.fire_weather_index >= 85 ? "critical" : "high",
          title: "Extreme Fire Risk Detected",
          message: `Fire Weather Index has reached ${weather.fire_weather_index}/100. High temperatures (${weather.temperature}°F), low humidity (${weather.humidity}%), and strong winds (${weather.wind_speed} mph) create dangerous conditions.`,
          metric_value: weather.fire_weather_index,
          threshold_value: 75,
          recommendations: [
            "Implement immediate fire prevention measures",
            "Restrict access to high-risk areas",
            "Increase fire watch patrols",
            "Prepare emergency response equipment",
            "Monitor weather updates continuously",
          ],
        });
      }
    });
  }, [weatherData, zones]);

  // Monitor sensor readings
  useEffect(() => {
    if (sensors.length === 0) return;

    sensors.forEach(async (sensor) => {
      if (sensor.status !== "online") return;

      const zone = zones.find((z) => z.id === sensor.zone_id);

      // Check soil moisture
      if (
        sensor.sensor_type === "soil_moisture" &&
        sensor.current_reading < 25
      ) {
        await checkAndCreateAlert({
          zone_id: sensor.zone_id,
          zone_name: zone?.name || "Unknown Zone",
          alert_type: "sensor_critical",
          severity: sensor.current_reading < 15 ? "critical" : "high",
          title: "Critical Soil Moisture Level",
          message: `Sensor ${sensor.sensor_id} reports dangerously low soil moisture at ${sensor.current_reading}%. Trees are experiencing severe drought stress.`,
          metric_value: sensor.current_reading,
          threshold_value: 25,
          recommendations: [
            "Implement emergency irrigation if available",
            "Assess drought stress across zone",
            "Consider temporary harvest restrictions",
            "Monitor for signs of tree mortality",
          ],
        });
      }

      // Check temperature
      if (sensor.sensor_type === "temperature" && sensor.current_reading > 90) {
        await checkAndCreateAlert({
          zone_id: sensor.zone_id,
          zone_name: zone?.name || "Unknown Zone",
          alert_type: "sensor_critical",
          severity: sensor.current_reading > 100 ? "critical" : "high",
          title: "High Temperature Alert",
          message: `Sensor ${sensor.sensor_id} reports extreme temperature of ${sensor.current_reading}°F. Combined with dry conditions, fire risk is elevated.`,
          metric_value: sensor.current_reading,
          threshold_value: 90,
          recommendations: [
            "Increase fire monitoring",
            "Check for heat stress in vegetation",
            "Verify sensor accuracy",
            "Review fire suppression readiness",
          ],
        });
      }

      // Check low battery
      if (sensor.battery_level < 20 && sensor.battery_level > 0) {
        await checkAndCreateAlert({
          zone_id: sensor.zone_id,
          zone_name: zone?.name || "Unknown Zone",
          alert_type: "system",
          severity: sensor.battery_level < 10 ? "high" : "medium",
          title: "Sensor Battery Low",
          message: `IoT sensor ${sensor.sensor_id} (${sensor.sensor_type}) battery at ${sensor.battery_level}%. Sensor may go offline soon.`,
          metric_value: sensor.battery_level,
          threshold_value: 20,
          recommendations: [
            "Schedule battery replacement",
            "Deploy backup sensor if available",
            "Check solar panel if equipped",
          ],
        });
      }
    });
  }, [sensors, zones]);

  // This component doesn't render anything
  return null;
}

import { base44 } from "@/api/base44Client";

export async function generateAlertsForZones(zones, userPreferences) {
  const alerts = [];

  for (const zone of zones) {
    // Check health score
    if (zone.health_score < userPreferences.health_score_threshold) {
      const severity =
        zone.health_score < 40
          ? "critical"
          : zone.health_score < 60
            ? "high"
            : "medium";

      alerts.push({
        zone_id: zone.id,
        zone_name: zone.name,
        alert_type: "health_decline",
        severity,
        title: `Low Health Score: ${zone.name}`,
        message: `Forest health has dropped to ${zone.health_score}/100. Immediate assessment recommended.`,
        metric_value: zone.health_score,
        threshold_value: userPreferences.health_score_threshold,
        recommendations: [
          "Schedule on-site inspection within 48 hours",
          "Review recent sensor data for anomalies",
          "Consider consulting forestry specialist",
        ],
      });
    }

    // Check fire risk
    const fireRiskLevels = { low: 0, moderate: 1, high: 2, extreme: 3 };
    const thresholdLevel =
      fireRiskLevels[userPreferences.fire_risk_threshold] || 2;
    const currentLevel = fireRiskLevels[zone.fire_risk] || 0;

    if (currentLevel >= thresholdLevel) {
      alerts.push({
        zone_id: zone.id,
        zone_name: zone.name,
        alert_type: "fire_risk",
        severity: zone.fire_risk === "extreme" ? "critical" : "high",
        title: `Elevated Fire Risk: ${zone.name}`,
        message: `Fire risk level is ${zone.fire_risk}. Enhanced monitoring and prevention measures required.`,
        metric_value: currentLevel,
        threshold_value: thresholdLevel,
        recommendations: [
          "Deploy additional fire watch personnel",
          "Verify fire break integrity",
          "Coordinate with local fire services",
          "Consider temporary access restrictions",
        ],
      });
    }

    // Check drought stress
    const droughtLevels = { low: 0, moderate: 1, high: 2, severe: 3 };
    const droughtThreshold =
      droughtLevels[userPreferences.drought_threshold] || 2;
    const currentDrought = droughtLevels[zone.drought_stress] || 0;

    if (currentDrought >= droughtThreshold) {
      alerts.push({
        zone_id: zone.id,
        zone_name: zone.name,
        alert_type: "weather_warning",
        severity: zone.drought_stress === "severe" ? "critical" : "high",
        title: `Drought Stress Alert: ${zone.name}`,
        message: `Zone experiencing ${zone.drought_stress} drought stress. Water management intervention needed.`,
        metric_value: currentDrought,
        threshold_value: droughtThreshold,
        recommendations: [
          "Implement water conservation measures",
          "Assess irrigation system capacity",
          "Monitor vulnerable tree species",
          "Plan for potential harvest timing adjustments",
        ],
      });
    }

    // Check pest risk
    const pestLevels = { minimal: 0, low: 1, moderate: 2, high: 3 };
    const pestThreshold = pestLevels[userPreferences.pest_risk_threshold] || 2;
    const currentPest = pestLevels[zone.pest_risk] || 0;

    if (currentPest >= pestThreshold) {
      alerts.push({
        zone_id: zone.id,
        zone_name: zone.name,
        alert_type: "sensor_critical",
        severity: zone.pest_risk === "high" ? "critical" : "medium",
        title: `Pest Risk Detected: ${zone.name}`,
        message: `${zone.pest_risk} pest/disease risk identified. Inspection and potential treatment required.`,
        metric_value: currentPest,
        threshold_value: pestThreshold,
        recommendations: [
          "Conduct detailed pest survey",
          "Identify specific pest/disease type",
          "Prepare treatment plan if confirmed",
          "Consider preventive treatment in adjacent zones",
        ],
      });
    }
  }

  return alerts;
}

export async function sendEmailAlert(userEmail, alert) {
  try {
    await base44.integrations.Core.SendEmail({
      to: userEmail,
      subject: `🌲 Forest Alert: ${alert.title}`,
      body: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #2D6A4F 0%, #40916C 100%); padding: 30px; text-align: center;">
    <h1 style="color: white; margin: 0;">🌲 TimberAI Alert</h1>
  </div>
  
  <div style="padding: 30px; background: #f9f9f9;">
    <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid ${
      alert.severity === "critical"
        ? "#DC2626"
        : alert.severity === "high"
          ? "#F59E0B"
          : "#10B981"
    };">
      <h2 style="color: #0F2E1D; margin-top: 0;">${alert.title}</h2>
      <p style="color: #666; font-size: 16px;">${alert.message}</p>
      
      <div style="margin: 20px 0; padding: 15px; background: #f0f4f0; border-radius: 6px;">
        <strong style="color: #2D6A4F;">Zone:</strong> ${alert.zone_name}<br>
        <strong style="color: #2D6A4F;">Severity:</strong> <span style="text-transform: uppercase; color: ${
          alert.severity === "critical"
            ? "#DC2626"
            : alert.severity === "high"
              ? "#F59E0B"
              : "#10B981"
        };">${alert.severity}</span><br>
        <strong style="color: #2D6A4F;">Type:</strong> ${alert.alert_type.replace("_", " ")}
      </div>
      
      ${
        alert.recommendations && alert.recommendations.length > 0
          ? `
        <div style="margin-top: 20px;">
          <strong style="color: #0F2E1D;">Recommended Actions:</strong>
          <ul style="color: #666; line-height: 1.8;">
            ${alert.recommendations.map((rec) => `<li>${rec}</li>`).join("")}
          </ul>
        </div>
      `
          : ""
      }
    </div>
    
    <p style="text-align: center; color: #999; font-size: 12px; margin-top: 20px;">
      This is an automated alert from TimberAI. To adjust your notification preferences, visit the Alert Settings page.
    </p>
  </div>
</div>
      `,
    });
    return true;
  } catch (error) {
    console.error("Email send error:", error);
    return false;
  }
}

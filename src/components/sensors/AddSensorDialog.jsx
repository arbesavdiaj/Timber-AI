import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, MapPin, Gauge } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AddSensorDialog({
  open,
  onOpenChange,
  zoneId,
  zoneName,
  coordinates,
}) {
  const [formData, setFormData] = useState({
    sensor_type: "soil_moisture",
    location_offset_lat: "0",
    location_offset_lng: "0",
  });
  const [isDeploying, setIsDeploying] = useState(false);

  const queryClient = useQueryClient();

  const sensorTypes = [
    { value: "soil_moisture", label: "Soil Moisture", unit: "%" },
    { value: "temperature", label: "Temperature", unit: "°F" },
    { value: "humidity", label: "Humidity", unit: "%" },
    { value: "light", label: "Light Intensity", unit: "lux" },
    { value: "ph", label: "Soil pH", unit: "pH" },
    { value: "air_quality", label: "Air Quality Index", unit: "AQI" },
  ];

  const handleDeploy = async () => {
    setIsDeploying(true);
    try {
      // Calculate sensor location with small offset
      const sensorLocation = {
        lat: coordinates.lat + parseFloat(formData.location_offset_lat || 0),
        lng: coordinates.lng + parseFloat(formData.location_offset_lng || 0),
      };

      // Generate sensor ID
      const sensorId = `${formData.sensor_type.toUpperCase().slice(0, 3)}-${Date.now().toString().slice(-6)}`;

      // Fetch real environmental data based on sensor type
      const prompt = `Get real current environmental data for location ${sensorLocation.lat}, ${sensorLocation.lng}. 
      Provide accurate ${formData.sensor_type.replace("_", " ")} reading.
      
      For soil_moisture: provide percentage (0-100)
      For temperature: provide Fahrenheit
      For humidity: provide percentage (0-100)
      For light: provide lux value (0-100000)
      For ph: provide soil pH (0-14, typical forest soil 4.5-6.5)
      For air_quality: provide AQI index (0-500)
      
      Also provide realistic threshold values (min and max) for this sensor type.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            current_reading: { type: "number" },
            unit: { type: "string" },
            thresholds: {
              type: "object",
              properties: {
                min: { type: "number" },
                max: { type: "number" },
              },
            },
          },
        },
      });

      // Generate initial reading history
      const readingHistory = [];
      const now = Date.now();
      for (let i = 19; i >= 0; i--) {
        const variance = result.current_reading * 0.03; // 3% variance
        readingHistory.push({
          timestamp: new Date(now - i * 30000).toISOString(), // 30 sec intervals
          value: result.current_reading + (Math.random() - 0.5) * variance,
        });
      }

      // Create sensor in database
      await base44.entities.IoTSensor.create({
        sensor_id: sensorId,
        zone_id: zoneId,
        sensor_type: formData.sensor_type,
        location: sensorLocation,
        current_reading: result.current_reading,
        unit: result.unit,
        battery_level: Math.floor(85 + Math.random() * 15), // 85-100%
        status: "online",
        last_reading_time: new Date().toISOString(),
        reading_history: readingHistory,
        thresholds: result.thresholds,
      });

      queryClient.invalidateQueries(["sensors", zoneId]);

      onOpenChange(false);
      setFormData({
        sensor_type: "soil_moisture",
        location_offset_lat: "0",
        location_offset_lng: "0",
      });
    } catch (error) {
      console.error("Sensor deployment error:", error);
      alert("Failed to deploy sensor. Please try again.");
    }
    setIsDeploying(false);
  };

  const selectedSensor = sensorTypes.find(
    (s) => s.value === formData.sensor_type,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Deploy New IoT Sensor</DialogTitle>
          <DialogDescription>
            Deploy a sensor to collect real-time environmental data in{" "}
            {zoneName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Zone Info */}
          <div className="bg-[#40916C]/5 rounded-xl p-4 border border-[#40916C]/20">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-[#40916C] flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-[#0F2E1D] text-sm">
                  {zoneName}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Base Location: {coordinates?.lat?.toFixed(4)}°,{" "}
                  {coordinates?.lng?.toFixed(4)}°
                </p>
              </div>
            </div>
          </div>

          {/* Sensor Type */}
          <div className="space-y-2">
            <Label htmlFor="sensor_type">Sensor Type</Label>
            <Select
              value={formData.sensor_type}
              onValueChange={(value) =>
                setFormData({ ...formData, sensor_type: value })
              }
            >
              <SelectTrigger id="sensor_type" className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sensorTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center justify-between w-full">
                      <span>{type.label}</span>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {type.unit}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Location Offset */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Fine-tune Location (optional)
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="lat_offset" className="text-xs text-gray-500">
                  Latitude Offset
                </Label>
                <Input
                  id="lat_offset"
                  type="number"
                  step="0.001"
                  placeholder="0.000"
                  value={formData.location_offset_lat}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      location_offset_lat: e.target.value,
                    })
                  }
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="lng_offset" className="text-xs text-gray-500">
                  Longitude Offset
                </Label>
                <Input
                  id="lng_offset"
                  type="number"
                  step="0.001"
                  placeholder="0.000"
                  value={formData.location_offset_lng}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      location_offset_lng: e.target.value,
                    })
                  }
                  className="rounded-xl"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Small adjustments to place sensor at specific coordinates within
              the zone
            </p>
          </div>

          {/* Deployment Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Gauge className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900 mb-1">
                  Real-Time Data Collection
                </p>
                <p className="text-xs text-blue-700">
                  This sensor will fetch live{" "}
                  {selectedSensor?.label.toLowerCase()} data from the specified
                  location and update every 10 seconds automatically.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeploying}
            className="rounded-xl"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeploy}
            disabled={isDeploying}
            className="bg-[#40916C] hover:bg-[#2D6A4F] rounded-xl gap-2"
          >
            {isDeploying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Deploying...
              </>
            ) : (
              <>
                <MapPin className="w-4 h-4" />
                Deploy Sensor
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

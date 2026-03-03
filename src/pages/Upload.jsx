import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload as UploadIcon,
  Satellite,
  FileSpreadsheet,
  Map as MapIcon,
  Plane,
  CheckCircle,
  Loader2,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";

const uploadTypes = [
  {
    id: "drone_imagery",
    icon: Plane,
    title: "Drone Imagery",
    description: "Upload aerial photos and orthomosaic maps",
    formats: "TIFF, GeoTIFF, JPG, PNG",
    color: "#40916C",
  },
  {
    id: "satellite",
    icon: Satellite,
    title: "Satellite Data",
    description: "Import satellite imagery and spectral data",
    formats: "GeoTIFF, NetCDF, HDF",
    color: "#52B788",
  },
  {
    id: "csv",
    icon: FileSpreadsheet,
    title: "CSV / Tabular Data",
    description: "Import inventory data, measurements, and records",
    formats: "CSV, XLSX, JSON",
    color: "#74C69D",
  },
  {
    id: "shapefile",
    icon: MapIcon,
    title: "Shapefiles & GIS",
    description: "Upload vector boundaries and polygon data",
    formats: "SHP, GeoJSON, KML",
    color: "#2D6A4F",
  },
];

export default function Upload() {
  const [selectedType, setSelectedType] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStage, setProcessingStage] = useState("");
  const [completed, setCompleted] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

  const queryClient = useQueryClient();

  const simulateProcessing = async () => {
    const stages = [
      "Validating file format...",
      "Extracting geospatial metadata...",
      "Running AI health analysis...",
      "Detecting vegetation indices...",
      "Calculating risk scores...",
      "Generating zone boundaries...",
      "Finalizing results...",
    ];

    for (let i = 0; i < stages.length; i++) {
      setProcessingStage(stages[i]);
      await new Promise((resolve) =>
        setTimeout(resolve, 800 + Math.random() * 400),
      );
      setUploadProgress(((i + 1) / stages.length) * 100);
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedType) return;

    setUploadedFile(file);
    setUploading(true);
    setUploadProgress(0);
    setCompleted(false);

    // Upload file
    const { file_url } = await base44.integrations.Core.UploadFile({ file });

    // Create upload record
    await base44.entities.DataUpload.create({
      filename: file.name,
      file_url,
      file_type: selectedType,
      status: "processing",
    });

    // Simulate AI processing
    await simulateProcessing();

    // Create sample zone from upload
    await base44.entities.ForestZone.create({
      name: `Zone from ${file.name}`,
      area_acres: Math.floor(Math.random() * 10000) + 1000,
      health_score: Math.floor(Math.random() * 30) + 70,
      canopy_density: Math.floor(Math.random() * 30) + 60,
      drought_stress: ["low", "moderate"][Math.floor(Math.random() * 2)],
      pest_risk: ["minimal", "low", "moderate"][Math.floor(Math.random() * 3)],
      fire_risk: ["low", "moderate", "high"][Math.floor(Math.random() * 3)],
      recommended_action:
        "AI analysis complete. Review zone data for management recommendations.",
      timber_yield_estimate: Math.floor(Math.random() * 5000000) + 1000000,
      carbon_sequestration: Math.floor(Math.random() * 20000) + 5000,
      coordinates: {
        lat: 45 + Math.random() * 3,
        lng: -122 - Math.random() * 3,
      },
    });

    setCompleted(true);
    setUploading(false);
    queryClient.invalidateQueries(["forestZones"]);
  };

  const resetUpload = () => {
    setSelectedType(null);
    setUploadedFile(null);
    setUploading(false);
    setUploadProgress(0);
    setProcessingStage("");
    setCompleted(false);
  };

  return (
    <div className="min-h-screen pb-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-2xl lg:text-3xl font-bold text-[#0F2E1D] mb-2">
            Upload Data
          </h1>
          <p className="text-gray-500">
            Import your forest data for AI-powered analysis
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Step 1: Select Type */}
          {!selectedType && !uploading && !completed && (
            <motion.div
              key="select"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid sm:grid-cols-2 gap-4"
            >
              {uploadTypes.map((type, index) => {
                const Icon = type.icon;
                return (
                  <motion.div
                    key={type.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card
                      className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-transparent hover:border-[#52B788]/30"
                      onClick={() => setSelectedType(type.id)}
                    >
                      <CardContent className="p-6">
                        <div
                          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                          style={{ backgroundColor: `${type.color}15` }}
                        >
                          <Icon
                            className="w-7 h-7"
                            style={{ color: type.color }}
                          />
                        </div>
                        <h3 className="text-lg font-semibold text-[#0F2E1D] mb-2">
                          {type.title}
                        </h3>
                        <p className="text-gray-500 text-sm mb-3">
                          {type.description}
                        </p>
                        <p className="text-xs text-gray-400">
                          Formats: {type.formats}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* Step 2: Upload Interface */}
          {selectedType && !uploading && !completed && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-xl mx-auto"
            >
              <Card className="border-2 border-dashed border-[#52B788]/40 bg-[#52B788]/5">
                <CardContent className="p-12 text-center">
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    onChange={handleFileSelect}
                    accept=".tiff,.tif,.jpg,.jpeg,.png,.csv,.xlsx,.json,.shp,.geojson,.kml"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer block">
                    <div className="w-20 h-20 rounded-3xl bg-[#40916C]/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                      <UploadIcon className="w-10 h-10 text-[#40916C]" />
                    </div>
                    <h3 className="text-xl font-semibold text-[#0F2E1D] mb-2">
                      Drop your files here
                    </h3>
                    <p className="text-gray-500 mb-6">or click to browse</p>
                    <Button className="bg-[#40916C] hover:bg-[#2D6A4F] rounded-xl">
                      Select File
                    </Button>
                  </label>
                </CardContent>
              </Card>

              <div className="mt-4 text-center">
                <button
                  onClick={resetUpload}
                  className="text-gray-500 hover:text-[#2D6A4F] text-sm"
                >
                  ← Choose different type
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Processing */}
          {uploading && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-xl mx-auto"
            >
              <Card className="bg-gradient-to-br from-[#0F2E1D] to-[#1A4D30] text-white overflow-hidden">
                <CardContent className="p-12 text-center relative">
                  {/* Animated Background */}
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300%] h-[300%] bg-[radial-gradient(circle,rgba(82,183,136,0.1)_0%,transparent_40%)] animate-pulse" />
                  </div>

                  <div className="relative z-10">
                    <div className="w-20 h-20 rounded-3xl bg-[#52B788]/20 flex items-center justify-center mx-auto mb-6">
                      <Sparkles className="w-10 h-10 text-[#74C69D] animate-pulse" />
                    </div>

                    <h3 className="text-2xl font-bold mb-2">
                      Analyzing with AI
                    </h3>
                    <p className="text-white/70 mb-8">{uploadedFile?.name}</p>

                    <div className="mb-6">
                      <Progress
                        value={uploadProgress}
                        className="h-2 bg-white/20"
                      />
                    </div>

                    <div className="flex items-center justify-center gap-2 text-[#74C69D]">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="text-sm">{processingStage}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 4: Complete */}
          {completed && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-xl mx-auto"
            >
              <Card className="border-2 border-[#52B788]">
                <CardContent className="p-12 text-center">
                  <div className="w-20 h-20 rounded-3xl bg-[#52B788]/20 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-[#52B788]" />
                  </div>

                  <h3 className="text-2xl font-bold text-[#0F2E1D] mb-2">
                    Analysis Complete!
                  </h3>
                  <p className="text-gray-500 mb-8">
                    Your data has been processed and a new forest zone has been
                    created.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      onClick={resetUpload}
                      variant="outline"
                      className="rounded-xl border-[#40916C]/30 text-[#2D6A4F]"
                    >
                      Upload More
                    </Button>
                    <Button
                      onClick={() => (window.location.href = "/Dashboard")}
                      className="bg-[#40916C] hover:bg-[#2D6A4F] rounded-xl gap-2"
                    >
                      View Dashboard
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

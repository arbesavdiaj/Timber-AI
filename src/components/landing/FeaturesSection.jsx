import React from "react";
import { motion } from "framer-motion";
import {
  Stethoscope,
  TreePine,
  Flame,
  CloudSun,
  Map,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";

const features = [
  {
    icon: Stethoscope,
    title: "Forest Health Detection",
    description:
      "AI-powered analysis of vegetation indices, chlorophyll levels, and stress markers from multispectral imagery.",
    color: "#52B788",
    gradient: "from-[#52B788]/20 to-[#40916C]/10",
  },
  {
    icon: TreePine,
    title: "Harvest Optimization",
    description:
      "Machine learning models predict optimal harvest timing and zones to maximize yield while preserving ecosystem health.",
    color: "#40916C",
    gradient: "from-[#40916C]/20 to-[#2D6A4F]/10",
  },
  {
    icon: Flame,
    title: "Wildfire Risk Forecasting",
    description:
      "Real-time fire risk assessment combining weather data, fuel moisture content, and historical patterns.",
    color: "#E07A5F",
    gradient: "from-[#E07A5F]/20 to-[#C65D3D]/10",
  },
  {
    icon: CloudSun,
    title: "Climate & Growth Modeling",
    description:
      "Long-term projections of forest growth under various climate scenarios with carbon sequestration estimates.",
    color: "#74C69D",
    gradient: "from-[#74C69D]/20 to-[#52B788]/10",
  },
  {
    icon: Map,
    title: "GIS Dashboard",
    description:
      "Interactive mapping with customizable layers, time-series visualization, and collaborative annotation tools.",
    color: "#3D5A80",
    gradient: "from-[#3D5A80]/20 to-[#2D4A70]/10",
  },
  {
    icon: TrendingUp,
    title: "Pest & Disease Alerts",
    description:
      "Early detection of insect infestations and disease outbreaks using spectral signatures and pattern recognition.",
    color: "#8B5A2B",
    gradient: "from-[#8B5A2B]/20 to-[#6B4423]/10",
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-24 lg:py-32 bg-gradient-to-b from-[#0A1F14] via-[#0F2E1D] to-[#0A1F14] relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#40916C]/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#52B788]/5 rounded-full blur-[150px] translate-x-1/2 translate-y-1/2" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 lg:mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#40916C]/20 border border-[#52B788]/30 mb-6">
            <span className="text-[#74C69D] text-sm font-medium">
              Core Features
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Comprehensive Forest Intelligence
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Everything you need to monitor, analyze, and optimize your forest
            assets with cutting-edge AI technology.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative"
            >
              <div
                className={`relative bg-gradient-to-br ${feature.gradient} backdrop-blur-xl rounded-3xl border border-white/10 p-8 h-full hover:border-white/20 transition-all duration-500 group-hover:transform group-hover:-translate-y-2`}
              >
                {/* Hover Glow */}
                <div
                  className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
                  style={{ backgroundColor: `${feature.color}10` }}
                />

                {/* Icon */}
                <div
                  className="relative w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg transition-transform duration-500 group-hover:scale-110"
                  style={{
                    backgroundColor: `${feature.color}20`,
                    boxShadow: `0 8px 32px ${feature.color}30`,
                  }}
                >
                  <feature.icon
                    className="w-7 h-7"
                    style={{ color: feature.color }}
                  />
                </div>

                {/* Content */}
                <h3 className="relative text-xl font-bold text-white mb-3 flex items-center gap-2">
                  {feature.title}
                  <ArrowUpRight
                    className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1 group-hover:-translate-y-1"
                    style={{ color: feature.color }}
                  />
                </h3>
                <p className="relative text-white/60 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

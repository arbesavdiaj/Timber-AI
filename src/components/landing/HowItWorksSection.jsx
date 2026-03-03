import React from "react";
import { motion } from "framer-motion";
import {
  Satellite,
  Brain,
  BarChart3,
  FileCheck,
} from "lucide-react";

const steps = [
  {
    icon: Satellite,
    title: "Capture Data",
    description:
      "Upload satellite imagery, drone footage, or connect to live feeds from your forest assets.",
    gradient: "from-[#2D6A4F] to-[#40916C]",
  },
  {
    icon: Brain,
    title: "AI Analysis",
    description:
      "Our machine learning models analyze vegetation health, stress patterns, and growth metrics.",
    gradient: "from-[#40916C] to-[#52B788]",
  },
  {
    icon: BarChart3,
    title: "Insights & Predictions",
    description:
      "Receive actionable insights on health scores, harvest timing, and risk assessments.",
    gradient: "from-[#52B788] to-[#74C69D]",
  },
  {
    icon: FileCheck,
    title: "Generate Reports",
    description:
      "Create comprehensive management plans and share with stakeholders instantly.",
    gradient: "from-[#74C69D] to-[#95D5B2]",
  },
];

export default function HowItWorksSection() {
  return (
    <section className="py-24 lg:py-32 bg-[#0A1F14] relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(116,198,157,0.15) 1px, transparent 0)`,
            backgroundSize: "48px 48px",
          }}
        />
      </div>

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
              Simple Process
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            How Timber AI Works
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            From raw satellite data to actionable forest management insights in
            four simple steps.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="relative group"
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-[60%] w-full h-px bg-gradient-to-r from-[#40916C]/50 to-transparent" />
              )}

              <div className="relative bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl rounded-3xl border border-white/10 p-8 h-full hover:border-[#52B788]/40 transition-all duration-500 group-hover:transform group-hover:-translate-y-2">
                {/* Step Number */}
                <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-gradient-to-br from-[#40916C] to-[#52B788] flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-[#40916C]/40">
                  {index + 1}
                </div>

                {/* Icon */}
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center mb-6 shadow-lg shadow-[#40916C]/30 group-hover:scale-110 transition-transform duration-500`}
                >
                  <step.icon className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-white/60 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

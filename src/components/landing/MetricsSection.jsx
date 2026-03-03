import React from "react";
import { motion } from "framer-motion";
import { Trees, Shield, TrendingDown, Leaf } from "lucide-react";

const metrics = [
  {
    icon: Trees,
    value: "1M+",
    label: "Acres Monitored",
    description: "Active forest coverage",
  },
  {
    icon: Shield,
    value: "23%",
    label: "Risk Reduction",
    description: "Average fire risk decrease",
  },
  {
    icon: TrendingDown,
    value: "40%",
    label: "Cost Savings",
    description: "In management expenses",
  },
  {
    icon: Leaf,
    value: "2.4M",
    label: "Tons CO₂",
    description: "Carbon tracked annually",
  },
];

export default function MetricsSection() {
  return (
    <section className="py-24 bg-gradient-to-r from-[#2D6A4F] via-[#40916C] to-[#2D6A4F] relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Measurable Impact
          </h2>
          <p className="text-lg text-white/80 max-w-xl mx-auto">
            Real results from forests across North America
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {metrics.map((metric, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative group"
            >
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 text-center hover:bg-white/20 transition-all duration-500 group-hover:transform group-hover:scale-[1.02]">
                <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
                  <metric.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-4xl lg:text-5xl font-bold text-white mb-2">
                  {metric.value}
                </div>
                <div className="text-lg font-semibold text-white/90 mb-1">
                  {metric.label}
                </div>
                <div className="text-sm text-white/60">
                  {metric.description}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

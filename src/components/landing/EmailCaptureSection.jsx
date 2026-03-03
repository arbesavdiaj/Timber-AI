import React, { useState } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, CheckCircle, Loader2 } from "lucide-react";

export default function EmailCaptureSection() {
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    await base44.entities.EmailSubscriber.create({ email, company });
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <section className="py-24 lg:py-32 bg-[#0A1F14] relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(64,145,108,0.15),transparent_70%)]" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Join the Mission
          </h2>
          <p className="text-lg text-white/60 mb-10 max-w-xl mx-auto">
            Be among the first to access Timber AI and help shape the future of
            sustainable forestry.
          </p>

          {!submitted ? (
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto"
            >
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-xl h-14 px-6 focus:border-[#52B788] focus:ring-[#52B788]"
              />
              <Input
                type="text"
                placeholder="Company (optional)"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="flex-1 sm:max-w-[180px] bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-xl h-14 px-6 focus:border-[#52B788] focus:ring-[#52B788]"
              />
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-[#40916C] to-[#52B788] hover:from-[#2D6A4F] hover:to-[#40916C] text-white rounded-xl h-14 px-8 font-semibold shadow-lg shadow-[#40916C]/40 transition-all duration-300 hover:scale-[1.02] group"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Get Access
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </motion.form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center gap-3 text-[#74C69D]"
            >
              <CheckCircle className="w-6 h-6" />
              <span className="text-lg font-medium">
                Thanks! We'll be in touch soon.
              </span>
            </motion.div>
          )}

          <p className="text-sm text-white/40 mt-6">
            No spam, ever. Unsubscribe anytime.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Play,
  Sparkles,
  TreePine,
  Shield,
  Leaf,
  User as UserIcon,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { getRoleLabel } from "@/components/utils/permissions";
import DemoModal from "./DemoModal";

export default function HeroSection() {
  const [demoHovered, setDemoHovered] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    base44.auth
      .me()
      .then((user) => setCurrentUser(user))
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    base44.auth.logout();
  };

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=80"
          alt="Forest aerial"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A1F14]/95 via-[#0A1F14]/80 to-[#1A4D30]/70" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(82,183,136,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(64,145,108,0.1),transparent_50%)]" />
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ y: [0, -20, 0], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#52B788]/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 20, 0], opacity: [0.2, 0.5, 0.2] }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#40916C]/10 rounded-full blur-3xl"
        />
      </div>

      {/* Navigation */}
      <nav className="relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-[#40916C] to-[#52B788] flex items-center justify-center shadow-xl shadow-[#40916C]/40">
                <TreePine className="w-6 h-6 text-white" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#74C69D] rounded-full animate-pulse" />
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">
                Timber<span className="text-[#74C69D]">AI</span>
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4"
            >
              {currentUser ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#40916C] to-[#52B788] flex items-center justify-center text-white text-sm font-semibold">
                        {currentUser.full_name?.charAt(0) || "U"}
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">
                        {currentUser.full_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {currentUser.email}
                      </p>
                      {currentUser.user_role && (
                        <Badge className="mt-1 text-xs bg-[#40916C]/10 text-[#2D6A4F] border-[#40916C]/20">
                          {getRoleLabel(currentUser.user_role)}
                        </Badge>
                      )}
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link
                        to={createPageUrl("Dashboard")}
                        className="cursor-pointer"
                      >
                        <UserIcon className="w-4 h-4 mr-2" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-red-600"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link to={createPageUrl("Auth")}>
                  <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm rounded-xl px-6">
                    Sign In
                  </Button>
                </Link>
              )}
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 lg:pt-24 pb-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#40916C]/20 border border-[#52B788]/30 backdrop-blur-sm mb-8">
              <Sparkles className="w-4 h-4 text-[#74C69D]" />
              <span className="text-[#74C69D] text-sm font-medium">
                AI-Powered Forest Intelligence
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.1] tracking-tight mb-6">
              AI for Smarter Forests
              <span className="block mt-2 bg-gradient-to-r from-[#52B788] via-[#74C69D] to-[#40916C] bg-clip-text text-transparent">
                & Sustainable Timber
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-white/70 leading-relaxed mb-10 max-w-xl">
              Predict forest health. Optimize harvesting. Protect the future.
              Advanced satellite analytics and machine learning for modern
              forestry management.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to={createPageUrl("Dashboard")}>
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-gradient-to-r from-[#40916C] to-[#52B788] hover:from-[#2D6A4F] hover:to-[#40916C] text-white rounded-xl px-8 py-6 text-lg font-semibold shadow-xl shadow-[#40916C]/40 transition-all duration-300 hover:scale-[1.02] group"
                >
                  Get Early Access
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                onMouseEnter={() => setDemoHovered(true)}
                onMouseLeave={() => setDemoHovered(false)}
                onClick={() => setShowDemo(true)}
                className="w-full sm:w-auto bg-white/5 hover:bg-white/10 text-white border-white/20 hover:border-white/40 rounded-xl px-8 py-6 text-lg font-semibold backdrop-blur-sm transition-all duration-300"
              >
                <Play
                  className={`w-5 h-5 mr-2 transition-transform duration-300 ${demoHovered ? "scale-110" : ""}`}
                />
                Live Demo
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center gap-6 mt-12 pt-8 border-t border-white/10">
              <div className="flex items-center gap-2 text-white/60">
                <Shield className="w-5 h-5 text-[#52B788]" />
                <span className="text-sm">Enterprise Ready</span>
              </div>
              <div className="flex items-center gap-2 text-white/60">
                <Leaf className="w-5 h-5 text-[#52B788]" />
                <span className="text-sm">Carbon Neutral</span>
              </div>
            </div>
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="hidden lg:block"
          >
            <div className="relative">
              {/* Glow Effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-[#40916C]/30 to-[#52B788]/30 rounded-3xl blur-2xl" />

              {/* Dashboard Card */}
              <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 p-6 shadow-2xl">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>

                {/* Mock Dashboard Content */}
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-[#1A4D30]/50 to-[#2D6A4F]/30 rounded-2xl h-48 flex items-center justify-center border border-[#40916C]/30">
                    <div className="text-center">
                      <div className="text-[#74C69D] text-5xl font-bold mb-2">
                        94
                      </div>
                      <div className="text-white/60 text-sm">
                        Forest Health Score
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Acres Monitored", value: "24.5K" },
                      { label: "Carbon Saved", value: "1.2M" },
                      { label: "Risk Reduced", value: "23%" },
                    ].map((stat, i) => (
                      <div
                        key={i}
                        className="bg-white/5 rounded-xl p-3 border border-white/10"
                      >
                        <div className="text-[#74C69D] text-lg font-bold">
                          {stat.value}
                        </div>
                        <div className="text-white/50 text-xs">
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0A1F14] to-transparent" />

      <DemoModal open={showDemo} onOpenChange={setShowDemo} />
    </section>
  );
}

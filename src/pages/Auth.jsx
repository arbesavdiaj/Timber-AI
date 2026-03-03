import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import LoginForm from "@/components/auth/LoginForm";
import SignupForm from "@/components/auth/SignupForm";

export default function Auth() {
  const [mode, setMode] = useState("login");

  useEffect(() => {
    // Check if already authenticated
    base44.auth.isAuthenticated().then((isAuth) => {
      if (isAuth) {
        window.location.href = "/Dashboard";
      }
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1F14] via-[#0F2E1D] to-[#1A4D30] flex items-center justify-center p-4">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1511497584788-876760111969?w=1920&q=80"
          alt="Forest"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A1F14]/90 via-[#0F2E1D]/85 to-[#1A4D30]/80" />
      </div>

      <div className="relative z-10 w-full">
        {mode === "login" ? (
          <LoginForm onSwitchToSignup={() => setMode("signup")} />
        ) : (
          <SignupForm onSwitchToLogin={() => setMode("login")} />
        )}
      </div>

      {/* Decorative Elements */}
      <motion.div
        animate={{ y: [0, -20, 0], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#52B788]/10 rounded-full blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{ y: [0, 20, 0], opacity: [0.2, 0.5, 0.2] }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#40916C]/10 rounded-full blur-3xl pointer-events-none"
      />
    </div>
  );
}

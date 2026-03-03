import React from "react";
import HeroSection from "@/components/landing/HeroSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import MetricsSection from "@/components/landing/MetricsSection";
import EmailCaptureSection from "@/components/landing/EmailCaptureSection";
import FooterSection from "@/components/landing/FooterSection";

export default function Landing() {
  return (
    <div className="bg-[#0A1F14]">
      <HeroSection />
      <HowItWorksSection />
      <FeaturesSection />
      <MetricsSection />
      <EmailCaptureSection />
      <FooterSection />
    </div>
  );
}

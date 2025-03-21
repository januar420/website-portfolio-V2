"use client";

import dynamic from "next/dynamic";
import WebGLErrorBoundary from "@/components/webgl-error-boundary";

// Dynamically import with no SSR
const PremiumSkillsChart = dynamic(() => import("@/components/premium-skills-chart"), {
  ssr: false,
  loading: () => (
    <div className="py-20 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
    </div>
  ),
});

export default function ClientSkillsChart() {
  return (
    <WebGLErrorBoundary>
      <PremiumSkillsChart />
    </WebGLErrorBoundary>
  );
} 
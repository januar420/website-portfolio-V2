"use client";

import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/components/language-provider";
import HardwareOptimizedRenderer from "@/components/hardware-optimized-renderer";
import WebGLErrorBoundary from "@/components/webgl-error-boundary";
import PremiumParticles from "@/components/premium-particles";
import Watermark from "@/components/watermark";
import PremiumCursor from "@/components/premium-cursor";
import PremiumScrollIndicator from "@/components/premium-scroll-indicator";
import PremiumAudioPlayer from "@/components/premium-audio-player";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Toaster } from "@/components/ui/toaster";
import EmailInit from "@/components/email-init";
import dynamic from "next/dynamic";
import { Suspense } from "react";

// Import R3F Initializer secara dinamis di dalam Client Component
// dengan loading fallback berupa null (tidak terlihat) dan batas waktu 2 detik
const R3FInitializer = dynamic(() => import("@/components/r3f-initializer"), {
  ssr: false,
  loading: () => null,
  // Jika lebih dari 2 detik belum ter-load, tetap lanjutkan dengan komponen lain
  // ini mencegah loading yang tak berujung
});

export default function ClientLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <LanguageProvider>
        {/* React Three Fiber patch initializer */}
        <Suspense fallback={null}>
          <R3FInitializer />
        </Suspense>
        
        <HardwareOptimizedRenderer>
          <div className="relative min-h-screen bg-gradient-to-b from-background to-background/80">
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
            <WebGLErrorBoundary>
              <PremiumParticles />
              <Watermark />
            </WebGLErrorBoundary>
            <Navbar />
            <div className="relative z-10">{children}</div>
            <Footer />
            <Toaster />
            <PremiumCursor />
            <PremiumScrollIndicator />
            <PremiumAudioPlayer />
            <EmailInit />
          </div>
        </HardwareOptimizedRenderer>
      </LanguageProvider>
    </ThemeProvider>
  );
} 
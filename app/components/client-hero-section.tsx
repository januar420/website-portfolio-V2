"use client";

import { Suspense, useEffect, useState } from "react";
import { applyAllR3FPatches } from "../utils/r3f-performance-patch";
import HeroSectionWrapper from "@/components/hero-section-wrapper";
import { patchForCanvas } from "../utils/patch-hero-section";
import dynamic from "next/dynamic";
import navbar from "@/components/navbar";
import LoadingOptimized from "@/components/loading-optimized";

// Preload patch-manager di luar komponen untuk mempercepat
let patchesPreloaded = false;
async function preloadPatches() {
  if (typeof window !== 'undefined' && !patchesPreloaded) {
    patchesPreloaded = true;
    try {
      // Memuat patch secara asinkron untuk menghindari blocking
      const patchModule = await import("../utils/patch-hero-section");
      // Panggil patchForCanvas
      patchModule.patchForCanvas();
    } catch (error) {
      console.error("Failed to preload patches:", error);
    }
  }
}

// Panggil preload
preloadPatches();

// Interface props
interface ClientHeroSectionProps {
  mainHeadingText?: string;
}

export default function ClientHeroSection({ mainHeadingText = "IT & Cyber Security Enthusiast" }: ClientHeroSectionProps) {
  const [ready, setReady] = useState(false);

  async function initializePatches() {
    if (typeof window === "undefined") return;

    try {
      // Gunakan timeout dengan Promise untuk menggantikan Promise.race
      let patchCompleted = false;
      
      // Buat timeout promise
      const timeoutPromise = new Promise<void>((_, reject) => {
        setTimeout(() => {
          if (!patchCompleted) {
            reject(new Error("Patch timeout"));
          }
        }, 500);
      });
      
      // Mulai patch process
      const patchProcess = (async () => {
        try {
          const patchModule = await import("../utils/patch-hero-section");
          patchModule.patchForCanvas();
          patchCompleted = true;
        } catch (err) {
          console.error("Patch error:", err);
        }
      })();
      
      // Tunggu salah satu selesai
      try {
        await Promise.resolve(patchProcess);
      } catch (e) {
        console.warn("Patch timeout or error:", e);
      }
      
      setReady(true);
    } catch (error) {
      console.error("Failed to initialize patches:", error);
      // Tetap set ready ke true untuk memastikan interface bisa diakses
      setReady(true);
    }
  }

  useEffect(() => {
    initializePatches();

    // Safety timeout - akan render tanpa tunggu patches
    // Kurangi timeout dari 3000ms menjadi 800ms
    const timeoutId = setTimeout(() => {
      if (!ready) {
        console.warn("Rendering without patches due to timeout");
        setReady(true);
      }
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [ready]);

  if (!ready) {
    return <LoadingOptimized showProgress={true} />;
  }

  return (
    <section className="relative min-h-[750px] md:min-h-screen w-full pb-24">
      <HeroSectionWrapper mainHeadingText={mainHeadingText} />
    </section>
  );
} 
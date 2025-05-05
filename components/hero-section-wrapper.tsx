"use client"

import React, { useEffect, useState, useRef } from 'react'
import dynamic from 'next/dynamic'
import { toast } from "@/hooks/use-toast"
import HeroSectionFallback from './hero-section-fallback'
import type { ComponentType } from 'react'

// Import monkey patch script
import '@/utils/react-three-monkeypatch'
// Import performance patch utility
import { applyAllR3FPatches, setupPerformanceErrorRecovery } from '@/app/utils/r3f-performance-patch'

// Jumlah maksimum percobaan recovery
const MAX_RECOVERY_ATTEMPTS = 3;

// Interface untuk props komponen
interface HeroSectionProps {
  mainHeadingText?: string;
}

// Impor HeroSection dengan dynamic import sederhana
const HeroSection = dynamic(
  () => import('./hero-section').then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-sm text-foreground/70">Memuat tampilan 3D...</p>
        </div>
      </div>
    )
  }
);

export default function HeroSectionWrapper({ mainHeadingText = "IT & Cyber Security Enthusiast" }: HeroSectionProps) {
  const [hasMounted, setHasMounted] = useState(false);
  const [hasError, setHasError] = useState(false);
  const recoveryAttemptsRef = useRef(0);
  const maxRecoveryAttemptsRef = useRef(3);

  // Setup auto-recovery mechanism
  useEffect(() => {
    let mounted = true;
    
    // Apply all R3F patches
    applyAllR3FPatches();
    
    // Setup error handler untuk _updatedFibers
    const cleanupErrorHandler = setupPerformanceErrorRecovery();
    
    // Error handling dengan recovery untuk React Three Fiber errors
    const handleReactThreeError = (event: ErrorEvent) => {
      if (!mounted) return false;
      
      if (
        event.message?.includes('ReactCurrentOwner') || 
        event.message?.includes('Cannot read properties of undefined') ||
        event.message?.includes('reconciler')
      ) {
        console.error("[HERO-WRAPPER] React Three Fiber error detected:", event.message);
        
        // Coba recovery jika belum melebihi batas
        if (recoveryAttemptsRef.current < maxRecoveryAttemptsRef.current) {
          recoveryAttemptsRef.current++;
          console.info(`[HERO-WRAPPER] Attempting recovery ${recoveryAttemptsRef.current}/${maxRecoveryAttemptsRef.current}...`);
          
          // Terapkan emergency patches
          if (typeof window !== 'undefined') {
            console.info("[HERO-WRAPPER] Applying emergency patches...");
            
            // Apply semua patches
            applyAllR3FPatches();
          }
          
          // Reload component jika mungkin
          if (mounted) {
            setHasError(false);
            // Force re-render
            setHasMounted(false);
            setTimeout(() => {
              if (mounted) setHasMounted(true);
            }, 100);
          }
        } else {
          // Jika sudah mencapai batas, tampilkan fallback
          console.warn("[HERO-WRAPPER] Max recovery attempts reached, switching to fallback");
          if (mounted) setHasError(true);
          
          // Notifikasi user
          toast({
            title: "Tampilan 3D tidak tersedia",
            description: "Menggunakan tampilan alternatif untuk pengalaman yang lebih baik",
            variant: "default",
          });
        }
        
        // Prevent error showing in console
        event.preventDefault();
        return true;
      }
      return false;
    };

    // Register error handler untuk R3F related errors
    window.addEventListener('error', handleReactThreeError, true);
    setHasMounted(true);

    return () => {
      mounted = false;
      // Cleanup semua error handlers
      window.removeEventListener('error', handleReactThreeError, true);
      cleanupErrorHandler();
    };
  }, []);

  // Fallbacks
  if (!hasMounted) {
    return <HeroSectionFallback mainHeadingText={mainHeadingText} />;
  }

  if (hasError) {
    return <HeroSectionFallback mainHeadingText={mainHeadingText} />;
  }

  // Render dengan error handling tambahan
  try {
    // Pastikan kita selalu mengembalikan komponen React yang valid
    return <HeroSection mainHeadingText={mainHeadingText} />;
  } catch (error) {
    console.error("[HERO-WRAPPER] Error rendering HeroSection, showing fallback:", error);
    return <HeroSectionFallback mainHeadingText={mainHeadingText} />;
  }
} 
"use client"

/**
 * R3F Initializer - Komponen untuk menginisialisasi patches lebih awal dalam lifecycle React
 * Komponen ini harus diimport dan dirender di _app.tsx atau layout.tsx
 */

import React, { useState, useEffect, useRef } from "react"
import { applyAllR3FPatches } from "@/utils/react-three-patch"

// Flag global untuk memastikan patch hanya diterapkan sekali
let globalPatchApplied = false;

// Fungsi untuk menerapkan patch secara global tanpa blocking
function safeGlobalPatch() {
  if (typeof window === 'undefined' || globalPatchApplied) return;
  
  try {
    // Setup ReactCurrentOwner secara global
    if (!window.ReactCurrentOwner) {
      window.ReactCurrentOwner = { current: null };
    }

    // Setup ReactCurrentBatchConfig untuk React 18+
    if (!window.ReactCurrentBatchConfig) {
      window.ReactCurrentBatchConfig = { 
        transition: 0,
        suspense: null,
        thenableState: null
      };
    }

    // Tandai bahwa global patch sudah diterapkan
    globalPatchApplied = true;
  } catch (error) {
    console.error("[R3F-INITIALIZER] Error in global patch:", error);
  }
}

// Terapkan global patch segera jika window tersedia
if (typeof window !== 'undefined') {
  safeGlobalPatch();
}

/**
 * Komponen R3F Initializer - harus dirender di root aplikasi (layout atau app)
 */
export default function R3FInitializer({ children }: { children?: React.ReactNode }) {
  const [initialized, setInitialized] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    async function initialize() {
      try {
        // Coba terapkan patches dengan timeout
        await applyPatchesWithTimeout(300);
        
        // Hanya update state jika komponen masih terpasang
        if (isMounted) {
          setInitialized(true);
        }
      } catch (error) {
        console.error("[R3F-INITIALIZER] Initialization error:", error);
        // Set initialized ke true meskipun ada error, agar UI tetap muncul
        if (isMounted) {
          setInitialized(true);
        }
      }
    }
    
    // Mulai inisialisasi segera
    initialize();
    
    // Tetapkan safety timeout yang lebih singkat (500ms)
    timeoutRef.current = setTimeout(() => {
      if (isMounted && !initialized) {
        console.warn("[R3F-INITIALIZER] Forcing initialization after timeout");
        setInitialized(true);
      }
    }, 500);
    
    // Cleanup saat komponen unmount
    return () => {
      isMounted = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [initialized]);
  
  // Return children segera setelah diinisialisasi
  return initialized ? <>{children}</> : null;
}

// Fungsi untuk menerapkan patches dengan timeout
async function applyPatchesWithTimeout(timeoutMs = 300) {
  if (typeof window === 'undefined') return false;
  
  try {
    // Gunakan Promise.race untuk menghindari blocking
    return await Promise.race([
      (async () => {
        // Pastikan ReactCurrentOwner dan ReactCurrentBatchConfig tersedia
        safeGlobalPatch();
        
        // Import dan terapkan patch untuk Canvas jika perlu
        const patchManager = await import("@/lib/patch-manager");
        if (patchManager.applyPatches) {
          await patchManager.applyPatches();
        }
        
        return true;
      })(),
      // Batasi waktu maksimum untuk patching
      new Promise<false>(resolve => setTimeout(() => resolve(false), timeoutMs))
    ]);
  } catch (error) {
    console.error("[R3F-INITIALIZER] Error applying patches:", error);
    return false;
  }
} 
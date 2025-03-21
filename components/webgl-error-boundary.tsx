"use client"

import { useCallback, useState, useEffect, type ReactNode } from "react"
import { toast } from "@/hooks/use-toast"
import { checkWebGLSupport, detectPotentialWebGLIssues } from "@/utils/webgl-utils"
import { useHardwareCapabilities } from "./hardware-optimized-renderer"

// Interface untuk window dengan ReactCurrentOwner
interface WindowWithReactCurrentOwner extends Window {
  ReactCurrentOwner?: Record<string, unknown>;
}

interface WebGLErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

// Implementasi dengan Hooks-based error boundary
export default function WebGLErrorBoundary({ children, fallback }: WebGLErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false);
  const [errorInfo, setErrorInfo] = useState<string>("");
  const [recoveryAttempts, setRecoveryAttempts] = useState(0);
  const hardwareCapabilities = useHardwareCapabilities();
  const { deviceCategory = "unknown", cpuInfo, gpuInfo } = hardwareCapabilities || {};

  // Fix ReactCurrentOwner saat komponen dimuat
  useEffect(() => {
    // Pastikan ReactCurrentOwner tersedia untuk React Three Fiber
    if (typeof window !== "undefined") {
      const customWindow = window as WindowWithReactCurrentOwner;
      if (!customWindow.ReactCurrentOwner) {
        console.info("WebGLErrorBoundary: Fixing ReactCurrentOwner compatibility issue");
        customWindow.ReactCurrentOwner = {};
      }
    }
  }, []);

  // Handler untuk reset error
  const resetError = useCallback(() => {
    setHasError(false);
    setErrorInfo("");
  }, []);

  // Fungsi untuk menangani error yang muncul
  const handleError = useCallback((error: Error) => {
    setHasError(true);
    setErrorInfo(error.message);
    setRecoveryAttempts(prev => prev + 1);

    // Cek dukungan WebGL
    const webglSupport = checkWebGLSupport();
    const potentialIssues = detectPotentialWebGLIssues();

    // Siapkan pesan error mendetail
    let errorMessage = "Terjadi kesalahan dengan rendering 3D.";
    let shouldAttemptRecovery = true;
    let recoveryDelay = 5000; // Default 5 detik

    // Deteksi masalah khusus ReactCurrentOwner
    if (error.message.includes('ReactCurrentOwner') || 
        error.message.includes('Cannot read properties of undefined')) {
      errorMessage = "Terdeteksi masalah kompatibilitas React dengan Three.js";
      shouldAttemptRecovery = true;
      recoveryDelay = 1000; // Recovery lebih cepat untuk masalah ini
      
      // Coba perbaiki masalah ReactCurrentOwner
      if (typeof window !== "undefined") {
        const customWindow = window as WindowWithReactCurrentOwner;
        if (!customWindow.ReactCurrentOwner) {
          customWindow.ReactCurrentOwner = {};
        }
      }
    } else if (!webglSupport.supported) {
      errorMessage = `WebGL tidak didukung: ${webglSupport.reason}`;
      shouldAttemptRecovery = false; // Tidak perlu mencoba recovery jika WebGL tidak didukung
    } else if (potentialIssues.hasIssues) {
      errorMessage = `Masalah rendering 3D terdeteksi: ${potentialIssues.issues.join(", ")}`;
      
      // Sesuaikan strategi recovery berdasarkan kategori perangkat
      if (deviceCategory === "low-end" || cpuInfo?.throttled) {
        recoveryDelay = 8000; // Tunggu lebih lama pada perangkat low-end
        errorMessage += " Mencoba memulihkan dengan pengaturan minimal...";
      }
    }

    // Tambahkan info hardware ke log
    if (gpuInfo && cpuInfo) {
      console.info(`Hardware info during error: GPU=${gpuInfo.vendor}, CPU cores=${cpuInfo.logicalCores}, Device Category=${deviceCategory}`);
    }

    // Tampilkan toast dengan informasi error
    toast({
      title: "Error Rendering 3D",
      description: errorMessage,
      variant: "destructive",
    });

    // Coba pulihkan setelah jeda, kecuali ini adalah upaya ketiga atau lebih
    if (shouldAttemptRecovery && recoveryAttempts < 3) {
      const timeout = setTimeout(() => {
        resetError();
      }, recoveryDelay);

      return () => clearTimeout(timeout);
    } else if (recoveryAttempts >= 3) {
      // Setelah 3 kali mencoba, tampilkan toast dengan saran
      toast({
        title: "Masalah Performa 3D",
        description: "Kami telah mendeteksi kesulitan menjaga rendering 3D. Menggunakan mode tampilan sederhana.",
        variant: "default",
      });
    }
  }, [cpuInfo, deviceCategory, gpuInfo, recoveryAttempts, resetError]);

  // Setup error handler dengan window.onerror
  useEffect(() => {
    const handleWindowError = (event: ErrorEvent) => {
      // Hanya tangkap error yang berkaitan dengan WebGL atau Three.js
      if (
        event.message.includes('WebGL') || 
        event.message.includes('three') || 
        event.message.includes('THREE') ||
        event.message.includes('ReactCurrentOwner') ||
        event.message.includes('Cannot read properties of undefined')
      ) {
        event.preventDefault();
        handleError(new Error(event.message));
        return true; // Mencegah error muncul di konsol
      }
      return false;
    };

    window.addEventListener('error', handleWindowError);
    return () => window.removeEventListener('error', handleWindowError);
  }, [handleError]);

  // Setup unhandled rejection handler
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const errorMessage = event.reason?.message || 'Unknown Promise rejection';
      
      // Hanya tangkap error yang berkaitan dengan WebGL atau Three.js
      if (
        errorMessage.includes('WebGL') || 
        errorMessage.includes('three') || 
        errorMessage.includes('THREE') ||
        errorMessage.includes('ReactCurrentOwner') ||
        errorMessage.includes('Cannot read properties of undefined')
      ) {
        event.preventDefault();
        handleError(new Error(errorMessage));
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => window.removeEventListener('unhandledrejection', handleUnhandledRejection);
  }, [handleError]);

  // Jika terjadi error, tampilkan fallback
  if (hasError) {
    return fallback || (
      <div className="flex items-center justify-center min-h-[300px] bg-background/50 rounded-lg border border-primary/20">
        <div className="text-center p-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-destructive"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2">Error Rendering 3D</h3>
          <p className="text-sm text-foreground/70 mb-4">
            Kami mengalami masalah dengan rendering 3D. 
            {recoveryAttempts <= 3 ? "Mencoba memulihkan..." : "Menggunakan pengaturan minimal..."}
          </p>
          <button 
            className="text-sm text-primary underline" 
            onClick={resetError}
            data-device-category={deviceCategory}
          >
            Coba Lagi
          </button>
          {deviceCategory === "low-end" && (
            <p className="text-xs text-foreground/50 mt-2">
              Terdeteksi perangkat dengan performa terbatas. Beberapa efek visual mungkin disederhanakan.
            </p>
          )}
        </div>
      </div>
    );
  }

  // Jika tidak ada error, render children
  return <>{children}</>;
}


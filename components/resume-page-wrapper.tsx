"use client"

import { Suspense, useState, useEffect } from "react"
import dynamic from "next/dynamic"
import LoadingScreen from "@/components/loading-screen"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

// Gunakan dynamic import dengan opsi ssr: false untuk menghindari ChunkLoadError
const ResumeContent = dynamic(
  () => import("@/components/resume-content").catch(err => {
    console.error("Error loading ResumeContent:", err);
    return () => (
      <div className="container mx-auto py-10">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Gagal memuat konten resume. Silakan refresh halaman.
          </AlertDescription>
        </Alert>
      </div>
    );
  }),
  { 
    loading: () => <LoadingScreen message="Mempersiapkan resume..." />,
    ssr: false // Disable server-side rendering untuk menghindari hydration mismatch
  }
)

export default function ResumePageWrapper() {
  const [error, setError] = useState<Error | null>(null)
  const [key, setKey] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  // Deteksi perangkat mobile untuk optimasi
  useEffect(() => {
    const checkIfMobile = () => {
      const userAgent = 
        typeof window.navigator === "undefined" ? "" : navigator.userAgent;
      const mobile = Boolean(
        userAgent.match(
          /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i
        )
      );
      setIsMobile(mobile);
    };
    
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Fungsi untuk coba memuat ulang komponen jika terjadi error
  const handleRetry = () => {
    setError(null)
    setKey(prev => prev + 1)
  }

  // Reset error saat unmount
  useEffect(() => {
    return () => setError(null)
  }, [])

  // Tambahkan fallback timeout untuk memastikan komponen selalu dimuat pada perangkat mobile
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    if (isMobile) {
      // Pada perangkat mobile, siapkan timeout fallback
      timeout = setTimeout(() => {
        console.log("Applying resume loading fallback for mobile");
        // Force reload jika konten masih belum termuat setelah beberapa detik
        if (document.querySelector('.resume-content-wrapper')?.children.length === 0) {
          setKey(prev => prev + 1);
        }
        
        // Force visibility pada education section
        document.documentElement.style.setProperty('--education-in-view', '1');
        
        // Force semua konten mobile terlihat
        document.querySelectorAll('.motion-div').forEach(el => {
          if (el instanceof HTMLElement) {
            el.classList.add('mobile-visible');
            el.style.opacity = '1';
            el.style.transform = 'none';
            el.style.visibility = 'visible';
          }
        });
        
        // Tambahkan class untuk optimasi mobile pada body
        document.body.classList.add('mobile-optimized');
      }, 1500); // Lebih cepat dari sebelumnya untuk memastikan render cepat
    }
    
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isMobile, key]);

  // Error handler
  if (error) {
    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Terjadi kesalahan saat memuat halaman resume. {error.message}
          </AlertDescription>
        </Alert>
        <Button onClick={handleRetry} className="mt-4">
          <RefreshCw className="mr-2 h-4 w-4" /> Coba Lagi
        </Button>
      </div>
    )
  }

  return (
    <Suspense fallback={<LoadingScreen message="Mempersiapkan resume..." />}>
      <div 
        key={key} 
        className={`resume-content-wrapper ${isMobile ? 'mobile-optimized' : ''}`}
      >
        <ResumeContent />
      </div>
    </Suspense>
  )
} 
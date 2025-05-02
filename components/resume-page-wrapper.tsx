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
    ssr: false
  }
)

export default function ResumePageWrapper() {
  const [error, setError] = useState<Error | null>(null)
  const [key, setKey] = useState(0)

  // Fungsi untuk coba memuat ulang komponen jika terjadi error
  const handleRetry = () => {
    setError(null)
    setKey(prev => prev + 1)
  }

  // Reset error saat unmount
  useEffect(() => {
    return () => setError(null)
  }, [])

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
      <div key={key} className="resume-content-wrapper">
        <ResumeContent />
      </div>
    </Suspense>
  )
} 
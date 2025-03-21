"use client"

import { Suspense, useState, useEffect } from "react"
import dynamic from "next/dynamic"
import LoadingScreen from "@/components/loading-screen"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

// Gunakan dynamic import dengan opsi ssr: false untuk menghindari error
const ResumeContent = dynamic(
  () => import("@/components/resume-content"),
  { 
    loading: () => <LoadingScreen />,
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

  // Error boundary untuk menangkap error
  useEffect(() => {
    return () => setError(null)
  }, [])

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
    <Suspense fallback={<LoadingScreen />}>
      <div key={key}>
        <ResumeContent />
      </div>
    </Suspense>
  )
} 
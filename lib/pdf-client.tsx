"use client"

import React, { useState, useEffect, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { useLanguage } from '@/components/language-provider'
import { Loader2, FileText } from 'lucide-react'
import { motion } from 'framer-motion'

// Import polyfill
import '@/lib/dom-matrix-polyfill'

// Definisikan loading placeholder yang lebih responsif
export const PDFLoadingPlaceholder = () => {
  const { t } = useLanguage()
  
  // Deteksi ukuran viewport untuk responsivitas
  const [isMobile, setIsMobile] = useState(false)
  const [loadingDuration, setLoadingDuration] = useState(0)
  
  useEffect(() => {
    const checkViewport = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    // Check saat komponen dimount
    checkViewport()
    
    // Tambahkan listener untuk perubahan ukuran layar
    window.addEventListener('resize', checkViewport)
    
    // Timer untuk melacak durasi loading
    const startTime = Date.now()
    const loadingTimer = setInterval(() => {
      setLoadingDuration(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)
    
    // Cleanup listener & timer
    return () => {
      window.removeEventListener('resize', checkViewport)
      clearInterval(loadingTimer)
    }
  }, [])
  
  // Pesan yang berubah berdasarkan durasi loading
  const loadingMessage = useMemo(() => {
    if (loadingDuration < 3) {
      return t?.("pdf.loading") || "Memuat dokumen PDF...";
    } else if (loadingDuration < 7) {
      return t?.("pdf.loadingLonger") || "Masih memuat, mohon tunggu...";
    } else if (loadingDuration < 15) {
      return t?.("pdf.loadingSlow") || "Loading agak lambat, harap bersabar...";
    } else {
      return t?.("pdf.loadingVerySlow") || "Loading sangat lambat. Koneksi mungkin lambat atau file besar.";
    }
  }, [loadingDuration, t]);
  
  return (
    <motion.div 
      className={`flex flex-col items-center justify-center ${isMobile ? 'min-h-[140px]' : 'min-h-[200px]'} w-full p-4 sm:p-8 bg-muted/10 backdrop-blur-sm rounded-lg border border-border/30 shadow-sm`}
      initial={{ opacity: 0.8 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
    >
      <div className="flex flex-col items-center justify-center gap-2 sm:gap-3">
        <Loader2 className={`${isMobile ? 'h-6 w-6' : 'h-8 w-8'} text-primary/60 animate-spin`} />
        <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground text-center max-w-xs`}>
          {loadingMessage}
        </p>
        
        {/* Tambahkan indikator progress jika loading lebih dari 5 detik */}
        {loadingDuration > 5 && (
          <div className="w-full max-w-[180px] mt-2">
            <div className="h-1 bg-muted/30 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-primary/50"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// Definisikan komponen fallback jika terjadi error
export const PDFErrorPlaceholder = ({ error, retry }: { error: Error, retry?: () => void }) => {
  const { t } = useLanguage()
  
  // Analisis pesan error untuk memberikan solusi yang lebih spesifik
  const getErrorDetails = () => {
    if (!error || !error.message) return {
      message: t?.("pdf.errorMessage") || "Terjadi kesalahan saat memuat dokumen PDF",
      solution: t?.("pdf.retrySolution") || "Coba muat ulang atau gunakan metode lain"
    };
    
    const msg = error.message.toLowerCase();
    
    if (msg.includes('cors') || msg.includes('cross-origin') || msg.includes('access-control')) {
      return {
        message: t?.("pdf.corsError") || "Akses lintas domain diblokir (CORS)",
        solution: t?.("pdf.corsSolution") || "Coba buka PDF langsung di tab baru"
      };
    }
    
    if (msg.includes('404') || msg.includes('not found')) {
      return {
        message: t?.("pdf.notFoundError") || "File PDF tidak ditemukan",
        solution: t?.("pdf.notFoundSolution") || "Periksa apakah URL PDF valid dan masih ada"
      };
    }
    
    if (msg.includes('network') || msg.includes('internet') || msg.includes('offline')) {
      return {
        message: t?.("pdf.networkError") || "Masalah koneksi jaringan",
        solution: t?.("pdf.networkSolution") || "Periksa koneksi internet Anda dan coba lagi"
      };
    }
    
    if (msg.includes('invalid') || msg.includes('corrupt') || msg.includes('malformed')) {
      return {
        message: t?.("pdf.formatError") || "Format PDF tidak valid atau rusak",
        solution: t?.("pdf.formatSolution") || "File mungkin bukan PDF yang valid atau rusak"
      };
    }
    
    return {
      message: error.message || t?.("pdf.errorMessage") || "Terjadi kesalahan saat memuat dokumen PDF",
      solution: t?.("pdf.retrySolution") || "Coba muat ulang atau gunakan metode lain"
    };
  };
  
  const { message, solution } = getErrorDetails();
  
  return (
    <motion.div 
      className="flex flex-col items-center justify-center min-h-[200px] w-full p-4 sm:p-8 bg-destructive/5 backdrop-blur-sm rounded-lg border border-destructive/30 shadow-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col items-center justify-center gap-3">
        <FileText className="h-8 w-8 text-destructive/70" />
        <div className="text-center">
          <p className="text-sm font-medium text-destructive/90 mb-1">
            {t?.("pdf.error") || "Gagal memuat PDF"}
          </p>
          <p className="text-xs text-muted-foreground max-w-[250px] mb-2">
            {message}
          </p>
          <p className="text-xs text-muted-foreground/80 max-w-[280px] italic">
            {solution}
          </p>
        </div>
        {retry && (
          <button 
            onClick={retry}
            className="mt-2 px-4 py-1.5 text-xs rounded-full bg-background/80 hover:bg-background transition-colors duration-200 shadow-sm border border-input flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
              <path d="M3 3v5h5"></path>
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path>
              <path d="M16 21h5v-5"></path>
            </svg>
            {t?.("pdf.retry") || "Coba Lagi"}
          </button>
        )}
      </div>
    </motion.div>
  )
}

// Dynamic import dengan memori cache untuk optimasi performa
const ReactPDFViewer = dynamic(
  () => import('@/lib/pdf-viewer').then((mod) => mod.default),
  {
    ssr: false,
    loading: () => <PDFLoadingPlaceholder />
  }
)

// Client PDF viewer props dengan properti tambahan
export interface ClientPDFViewerProps {
  file: string  
  pageNumber?: number
  scale?: number
  rotate?: number
  width?: number
  height?: number
  className?: string
  pageClassName?: string
  renderMode?: 'canvas' | 'svg'
  renderTextLayer?: boolean
  renderAnnotationLayer?: boolean
  enableSwipe?: boolean
  onLoadSuccess?: (numPages: number) => void
  onLoadError?: (error: Error) => void
  onPageChange?: (pageNumber: number) => void
  onScaleChange?: (scale: number) => void
}

export default function ClientPDFViewer({
  file,
  pageNumber = 1,
  scale = 1.0,
  rotate = 0,
  width,
  height,
  className = '',
  pageClassName = '',
  renderMode = 'canvas',
  renderTextLayer = false,
  renderAnnotationLayer = false,
  enableSwipe = false,
  onLoadSuccess,
  onLoadError,
  onPageChange,
  onScaleChange
}: ClientPDFViewerProps) {
  const [loadingComplete, setLoadingComplete] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  
  // Deteksi ukuran viewport untuk responsivitas
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    const checkViewport = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    // Check saat komponen dimount
    checkViewport()
    
    // Tambahkan listener untuk perubahan ukuran layar
    window.addEventListener('resize', checkViewport)
    
    // Cleanup listener
    return () => window.removeEventListener('resize', checkViewport)
  }, [])
  
  // Reset state saat file berubah
  useEffect(() => {
    setLoadingComplete(false)
    setError(null)
    setIsLoading(true)
  }, [file])
  
  // Handler load success dengan callback
  const handleLoadSuccess = (numPages: number) => {
    setLoadingComplete(true)
    setIsLoading(false)
    setError(null)
    if (onLoadSuccess) onLoadSuccess(numPages)
  }
  
  // Handler load error dengan auto-retry
  const handleLoadError = (err: Error) => {
    console.error('Error loading PDF in client:', err)
    setIsLoading(false)
    setError(err)
    
    if (onLoadError) onLoadError(err)
  }
  
  // Fungsi retry manual
  const handleRetry = () => {
    setRetryCount(prev => prev + 1)
    setIsLoading(true)
    setError(null)
  }

  return (
    <>
      {error ? (
        <PDFErrorPlaceholder error={error} retry={handleRetry} />
      ) : (
        <motion.div
          className={`relative pdf-container ${className}`}
          animate={{ opacity: loadingComplete ? 1 : 0.8 }}
          transition={{ duration: 0.3 }}
        >
          <ReactPDFViewer
            key={`pdf-${file}-${retryCount}`}
            file={file}
            pageNumber={pageNumber}
            scale={scale}
            rotate={rotate}
            width={width}
            height={height}
            onLoadSuccess={handleLoadSuccess}
            onLoadError={handleLoadError}
            onPageChange={onPageChange}
            onScaleChange={onScaleChange}
            className={className}
            pageClassName={pageClassName}
            renderMode={renderMode}
            renderTextLayer={renderTextLayer}
            renderAnnotationLayer={renderAnnotationLayer}
            enableSwipe={enableSwipe}
            isLoading={isLoading}
          />
        </motion.div>
      )}
    </>
  )
} 
"use client"

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { motion, AnimatePresence } from 'framer-motion'
import { CircleOff, Loader2, FileText, AlertTriangle } from 'lucide-react'

// Versioning dan caching yang lebih baik
const PDFJS_VERSION = '5.2.133'
// Ubah prioritas: gunakan file lokal terlebih dahulu
const LOCAL_WORKER_URL = `/pdf.worker.min.js` // Local worker sebagai prioritas utama
const CDN_WORKER_URL = `https://unpkg.com/pdfjs-dist@${PDFJS_VERSION}/build/pdf.worker.min.js` // CDN sebagai fallback

// Konfigurasi opsi PDF yang dioptimasi
const DOCUMENT_OPTIONS = {
  cMapUrl: `https://unpkg.com/pdfjs-dist@${PDFJS_VERSION}/cmaps/`,
  cMapPacked: true,
  standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${PDFJS_VERSION}/standard_fonts/`,
  disableRange: false,
  disableStream: false,
  disableAutoFetch: false,
  isEvalSupported: true,
  useSystemFonts: true, // Aktifkan font sistem untuk kompatibilitas yang lebih baik
  enableXfa: false, // Menonaktifkan fitur XFA untuk performa lebih baik
  withCredentials: false,
  disableFontFace: false,
}

// Inisialisasi worker dengan handling yang lebih robust
if (typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
  try {
    // Set worker source ke file lokal terlebih dahulu
    pdfjs.GlobalWorkerOptions.workerSrc = LOCAL_WORKER_URL;
    
    // Gunakan promise untuk menangani kasus worker gagal dimuat
    const loadWorker = async () => {
      try {
        // Coba akses file worker lokal
        const localResponse = await fetch(LOCAL_WORKER_URL, { method: 'HEAD' });
        
        if (!localResponse.ok) {
          throw new Error('Local worker tidak dapat diakses');
        }
        
        console.log('Menggunakan PDF worker lokal');
        
        // Tingkatkan memori yang tersedia untuk PDF.js worker
        if (typeof window !== 'undefined' && 'pdfjsLib' in window) {
          // @ts-ignore
          window.pdfjsLib.GlobalWorkerOptions.workerPort = new Worker(LOCAL_WORKER_URL);
        }
      } catch (localError) {
        console.warn('Gagal memuat PDF worker lokal, mencoba CDN:', localError);
        
        try {
          // Fallback ke CDN
          pdfjs.GlobalWorkerOptions.workerSrc = CDN_WORKER_URL;
          
          // Cek apakah worker CDN bisa diakses
          const cdnResponse = await fetch(CDN_WORKER_URL, { method: 'HEAD' });
          if (!cdnResponse.ok) {
            throw new Error('CDN worker tidak dapat diakses');
          }
          
          console.log('Menggunakan PDF worker dari CDN');
          
          if (typeof window !== 'undefined' && 'pdfjsLib' in window) {
            // @ts-ignore
            window.pdfjsLib.GlobalWorkerOptions.workerPort = new Worker(CDN_WORKER_URL);
          }
        } catch (cdnError) {
          console.error('Semua upaya memuat PDF worker gagal:', cdnError);
          
          // Set kembali ke lokal meskipun mungkin tidak berfungsi
          // Ini memberi kesempatan pdfjs untuk menggunakan "fake worker"
          pdfjs.GlobalWorkerOptions.workerSrc = LOCAL_WORKER_URL;
        }
      }
    };
    
    loadWorker().catch(e => {
      console.error('Semua upaya memuat PDF worker gagal:', e);
    });
  } catch (e) {
    console.error('Gagal menginisialisasi PDF.js worker:', e);
  }
}

// Interface yang lebih lengkap dengan properti tambahan
interface PDFViewerProps {
  file: string
  pageNumber?: number
  scale?: number
  rotate?: number
  width?: number
  height?: number
  onLoadSuccess?: (numPages: number) => void
  onLoadError?: (error: Error) => void
  onPageChange?: (pageNumber: number) => void
  onScaleChange?: (scale: number) => void
  className?: string
  renderMode?: 'canvas' | 'svg'
  pageClassName?: string
  renderTextLayer?: boolean
  renderAnnotationLayer?: boolean
  enableSwipe?: boolean
  isLoading?: boolean
  maxAttempts?: number
  fallbackContent?: React.ReactNode
}

// Komponen loading yang lebih responsif dengan animasi yang lebih mulus
const LoadingSpinner = () => (
  <motion.div 
    className="flex flex-col items-center justify-center p-4 sm:p-6"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3 }}
  >
    <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 text-primary/70 animate-spin mb-2 sm:mb-3" />
    <p className="text-xs sm:text-sm text-muted-foreground">Memuat dokumen...</p>
  </motion.div>
);

// Komponen Error yang lebih informatif dengan diagnosis
const ErrorComponent = ({ error, url, onRetry }: { error: Error, url?: string, onRetry?: () => void }) => {
  // Deteksi tipe error secara lebih spesifik
  const errorMessage = useMemo(() => {
    if (!error || !error.message) return "Terjadi kesalahan saat memuat dokumen PDF";
    
    if (error.message.includes('CORS') || error.message.includes('cross-origin') || error.message.includes('Access-Control')) {
      return "Gagal mengakses karena masalah keamanan CORS. PDF mungkin berada di domain yang berbeda.";
    } else if (error.message.includes('404') || error.message.includes('not found') || error.message.includes('Not Found')) {
      return "File PDF tidak ditemukan. URL mungkin tidak valid atau file telah dihapus.";
    } else if (error.message.includes('network') || error.message.includes('internet') || error.message.includes('connection')) {
      return "Koneksi jaringan bermasalah. Periksa koneksi internet Anda dan coba lagi.";
    } else if (error.message.includes('timeout') || error.message.includes('time out') || error.message.includes('timed out')) {
      return "Waktu memuat habis. Server mungkin lambat merespon atau file terlalu besar.";
    } else if (error.message.includes('invalid') || error.message.includes('corrupt') || error.message.includes('malformed')) {
      return "Format PDF tidak valid atau rusak. File mungkin bukan PDF yang valid.";
    } else if (error.message.includes('password') || error.message.includes('encrypted') || error.message.includes('protected')) {
      return "PDF dilindungi password atau terenkripsi. Gunakan metode alternatif untuk melihatnya.";
    } else if (error.message.includes('aborted') || error.message.includes('cancel')) {
      return "Proses memuat PDF dibatalkan. Coba muat ulang.";
    } else if (error.message.includes('memory') || error.message.includes('buffer')) {
      return "Memori tidak cukup untuk memuat PDF. File mungkin terlalu besar untuk browser Anda.";
    } else {
      return error.message || "Terjadi kesalahan saat memuat dokumen PDF";
    }
  }, [error]);

  // Opsi untuk membuka di PDF viewer eksternal
  const openExternally = () => {
    if (!url) return;
    
    try {
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (e) {
      console.error('Error opening external viewer:', e);
      
      // Fallback
      try {
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.click();
      } catch (e2) {
        console.error('Secondary fallback failed:', e2);
      }
    }
  };

  return (
    <motion.div 
      className="flex flex-col items-center justify-center p-4 sm:p-6 bg-destructive/5 backdrop-blur-md rounded-lg border border-destructive/20 shadow-md"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col items-center text-center max-w-md">
        <AlertTriangle className="h-8 w-8 sm:h-10 sm:w-10 text-destructive/70 mb-2 sm:mb-3" />
        <p className="text-sm font-medium text-destructive/90 mb-1">Gagal memuat PDF</p>
        <p className="text-xs text-muted-foreground mb-3 max-w-xs sm:max-w-sm">
          {errorMessage}
        </p>
        
        {url && (
          <div className="max-w-[220px] sm:max-w-[300px] overflow-hidden text-ellipsis text-xs text-muted-foreground mb-3 bg-background/60 backdrop-blur-sm px-2 py-1 rounded-md">
            <span className="font-semibold">URL: </span>
            <span className="opacity-70 truncate">{url}</span>
          </div>
        )}
        
        <div className="flex flex-wrap gap-2 justify-center mt-1">
          {onRetry && (
            <button 
              onClick={onRetry}
              className="px-3 py-1.5 text-xs rounded-full bg-background/70 hover:bg-background backdrop-blur-sm transition-colors duration-200 shadow-sm border border-input flex items-center gap-1.5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                <path d="M3 3v5h5"></path>
                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path>
                <path d="M16 21h5v-5"></path>
              </svg>
              Coba Lagi
            </button>
          )}
          
          {url && (
            <button 
              onClick={openExternally}
              className="px-3 py-1.5 text-xs rounded-full bg-primary/10 hover:bg-primary/20 transition-colors duration-200 shadow-sm border border-primary/20 flex items-center gap-1.5 text-primary"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
              Buka di Tab Baru
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Placeholder saat tidak ada konten
const NoDataComponent = () => (
  <motion.div 
    className="flex flex-col items-center justify-center p-4 sm:p-6 bg-muted/20 rounded-lg border border-border/30"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3 }}
  >
    <FileText className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground/50 mb-2 sm:mb-3" />
    <p className="text-xs sm:text-sm text-muted-foreground">Tidak ada data PDF</p>
  </motion.div>
);

// Komponen PDF viewer yang dioptimasi
function PDFViewer({
  file,
  pageNumber = 1,
  scale = 1.0,
  rotate = 0,
  width,
  height,
  onLoadSuccess,
  onLoadError,
  onPageChange,
  onScaleChange,
  className = '',
  renderMode = 'canvas',
  pageClassName = '',
  renderTextLayer = false,
  renderAnnotationLayer = false,
  enableSwipe = false,
  isLoading = false,
  maxAttempts = 3,
  fallbackContent = null
}: PDFViewerProps) {
  const [numPages, setNumPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [docKey, setDocKey] = useState<string>(`${file}-${new Date().getTime()}`)
  const [pdfDocument, setPdfDocument] = useState<any>(null)
  const [viewportWidth, setViewportWidth] = useState<number>(0)
  const [isMobile, setIsMobile] = useState<boolean>(false)
  const [attempts, setAttempts] = useState<number>(0)
  const [renderKey, setRenderKey] = useState<number>(0)
  const documentRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Deteksi ukuran viewport dan perangkat
  useEffect(() => {
    const updateViewportWidth = () => {
      const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
      setViewportWidth(vw)
      setIsMobile(vw < 768) // Deteksi mobile secara dinamis
    }

    // Set awal
    updateViewportWidth()

    // Tambahkan event listener dengan throttling
    let throttleTimeout: NodeJS.Timeout | null = null
    const handleResize = () => {
      if (!throttleTimeout) {
        throttleTimeout = setTimeout(() => {
          updateViewportWidth()
          throttleTimeout = null
        }, 100)
      }
    }

    window.addEventListener('resize', handleResize)
    
    // Cleanup event listener
    return () => {
      window.removeEventListener('resize', handleResize)
      if (throttleTimeout) clearTimeout(throttleTimeout)
    }
  }, [])

  // Menghitung lebar responsif jika tidak ditentukan secara eksplisit
  const responsiveWidth = useMemo(() => {
    if (width) return width
    
    if (isMobile) {
      return Math.min(viewportWidth - 40, 440) // Padding 20px di kedua sisi untuk mobile
    }
    
    return Math.min(Math.max(viewportWidth * 0.7, 400), 800) // Responsif untuk desktop
  }, [width, viewportWidth, isMobile])

  // Fungsi validasi file PDF
  const validatePdf = useCallback(async (fileUrl: string): Promise<boolean> => {
    try {
      if (!fileUrl) return false;
      
      if (fileUrl.startsWith('data:')) {
        // Data URL sudah valid
        return true;
      }
      
      if (fileUrl.startsWith('blob:')) {
        try {
          // Blob URL, validasi dengan mencoba membaca
          const response = await fetch(fileUrl);
          if (!response.ok) throw new Error(`HTTP error ${response.status}`);
          const blob = await response.blob();
          return blob.type === 'application/pdf' || blob.size > 0;
        } catch (error) {
          console.warn('Validasi blob URL PDF gagal:', error);
          // Return true karena kita tidak bisa memvalidasi dengan tepat
          return true;
        }
      }

      // Untuk URL eksternal, gunakan mode no-cors untuk mengatasi masalah CORS
      try {
        const checkResponse = await fetch(fileUrl, { 
          method: 'HEAD',
          // Mode no-cors untuk izinkan cross-origin request
          mode: 'no-cors'
        });
        
        // Jika tidak error, maka URL bisa diakses
        return true;
      } catch (corsError) {
        console.warn('CORS check for PDF URL failed:', corsError);
        // Masih return true karena PDF.js mungkin masih bisa memuat PDF
        return true;
      }
    } catch (e) {
      console.warn('Validasi PDF gagal:', e);
      // Return true juga di sini, biarkan PDF.js menangani error
      return true;
    }
  }, []);

  // Handler document loading yang dioptimalkan
  const handleDocumentLoadSuccess = useCallback(({ numPages, _pdfInfo }: { numPages: number, _pdfInfo?: any }) => {
    setNumPages(numPages)
    setLoading(false)
    setError(null)
    setAttempts(0) // Reset attempts on success
    
    // Simpan referensi dokumen PDF untuk penggunaan lebih lanjut
    if (_pdfInfo) {
      setPdfDocument(_pdfInfo)
    }
    
    if (onLoadSuccess) {
      onLoadSuccess(numPages)
    }
    
    // Hapus timer apapun yang berjalan
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [onLoadSuccess])

  // Handler error yang dioptimalkan dengan auto-retry
  const handleDocumentLoadError = useCallback((err: Error) => {
    console.error('Error loading PDF:', err)
    setLoading(false)
    setError(err)
    
    // Catat informasi error lebih detail
    let errorDetails = '';
    if (err.message) errorDetails += ` Message: ${err.message}`;
    if (err.name) errorDetails += ` Name: ${err.name}`;
    if (err.stack) errorDetails += ` Stack: ${err.stack.split('\n')[0]}`;
    console.error(`PDF error details: ${errorDetails}`);
    
    const nextAttempts = attempts + 1
    setAttempts(nextAttempts)
    
    // Jika masih ada kesempatan retry dan tidak melebihi maxAttempt
    if (nextAttempts < maxAttempts) {
      // Buat delay dengan exponential backoff (1s, 2s, 4s, 8s)
      const delay = Math.min(1000 * Math.pow(2, nextAttempts - 1), 8000)
      
      console.log(`Akan retry dalam ${delay}ms (percobaan ${nextAttempts}/${maxAttempts})`)
      
      // Generate docKey baru untuk reload dengan timestamp dan data random
      // untuk menghindari cache browser
      const randomId = Math.floor(Math.random() * 10000);
      const newDocKey = `${file}-${new Date().getTime()}-retry-${nextAttempts}-${randomId}`
      setDocKey(newDocKey)
      
      // Set timer untuk retry dengan pengecekan bahwa komponen masih mounted
      timerRef.current = setTimeout(() => {
        console.log(`Melakukan retry loading PDF (${nextAttempts}/${maxAttempts})`)
        setLoading(true)
        setRenderKey(prev => prev + 1) // Force re-render komponen
      }, delay)
    } else {
      // Sudah melebihi maxAttempt, panggil error callback
      if (onLoadError) {
        onLoadError(err)
      }
    }
  }, [file, onLoadError, attempts, maxAttempts])

  // Retry manual handler dengan reset penuh
  const handleRetry = useCallback(() => {
    // Reset semua state
    setAttempts(0)
    setError(null)
    setLoading(true)
    setRenderKey(prev => prev + 1)
    
    // Generate docKey yang benar-benar baru
    const randomId = Math.floor(Math.random() * 10000);
    const timestamp = new Date().getTime();
    setDocKey(`${file}-${timestamp}-manual-retry-${randomId}`)
    
    // Coba preload sumber dengan fetch untuk menyiapkan cache browser
    try {
      if (typeof file === 'string' && !file.startsWith('data:') && !file.startsWith('blob:')) {
        fetch(file, { method: 'HEAD', cache: 'reload' })
          .catch(() => {/* silent catch */});
      }
    } catch (e) {
      // Jangan gagalkan retry jika preload gagal
      console.warn('Preload for retry failed:', e);
    }
  }, [file]);

  // Bersihkan memori saat komponen unmounted
  useEffect(() => {
    // Cleanup pada unmount
    return () => {
      if (pdfDocument) {
        try {
          // Lepaskan referensi ke dokumen PDF
          setPdfDocument(null)
        } catch (e) {
          console.error('Error cleaning up PDF document:', e)
        }
      }
      
      // Hapus timer apapun yang berjalan
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [pdfDocument])

  // Validasi dan preload PDF saat file berubah
  useEffect(() => {
    if (!file) return
    
    // Reset state untuk file baru
    setLoading(true)
    setError(null)
    setAttempts(0)
    
    // Berikan key unik untuk memaksa reload saat file berubah
    setDocKey(`${file}-${new Date().getTime()}`)
    
    // Validasi file PDF
    validatePdf(file)
      .then(isValid => {
        if (!isValid) {
          const validationError = new Error('URL PDF tidak valid atau tidak dapat diakses');
          setError(validationError);
          setLoading(false);
          if (onLoadError) onLoadError(validationError);
        }
      })
      .catch(() => {
        // Jangan setting error di sini, biarkan komponen Document menghandle error loading
      });
      
    // Cleanup timer saat file berubah
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [file, validatePdf, onLoadError])

  // Implementasi swipe untuk mobile jika enableSwipe=true
  useEffect(() => {
    if (!enableSwipe || !documentRef.current || !numPages) return;
    
    let touchStartX = 0;
    let touchEndX = 0;
    
    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.changedTouches[0].screenX;
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    };
    
    const handleSwipe = () => {
      const minSwipeDistance = 50;
      const swipeDistance = touchEndX - touchStartX;
      
      if (Math.abs(swipeDistance) > minSwipeDistance) {
        if (swipeDistance > 0 && pageNumber > 1) {
          // Swipe kanan -> halaman sebelumnya
          if (onPageChange) onPageChange(pageNumber - 1);
        } else if (swipeDistance < 0 && pageNumber < numPages) {
          // Swipe kiri -> halaman berikutnya
          if (onPageChange) onPageChange(pageNumber + 1);
        }
      }
    };
    
    const element = documentRef.current;
    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enableSwipe, pageNumber, numPages, onPageChange]);

  // Error handler untuk React suspense
  const handleSuspenseError = (error: Error) => {
    console.error('Error in PDF component suspense:', error);
    setError(error);
    setLoading(false);
  };
  
  // Deteksi jika error terkait dengan worker PDF
  const isWorkerError = useMemo(() => {
    if (!error) return false;
    
    const errorMsg = error.message ? error.message.toLowerCase() : '';
    return (
      errorMsg.includes('worker') || 
      errorMsg.includes('fake worker') || 
      errorMsg.includes('failed to fetch') || 
      errorMsg.includes('dynamically imported module')
    );
  }, [error]);

  return (
    <div 
      ref={documentRef}
      className={`pdf-viewer-container relative ${isMobile ? 'pdf-viewer-mobile' : ''} ${isLoading ? 'opacity-50' : ''}`}
    >
      <AnimatePresence mode="wait">
        {error ? (
          <motion.div
            key={`error-${attempts}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {isWorkerError ? (
              // Gunakan fallback sederhana untuk error worker
              <SimplePDFLinkFallback 
                file={typeof file === 'string' ? file : undefined} 
                onRetry={handleRetry} 
              />
            ) : (
              // Gunakan error component standar untuk error lainnya
              <ErrorComponent 
                error={error} 
                url={typeof file === 'string' ? file : undefined}
                onRetry={handleRetry} 
              />
            )}
          </motion.div>
        ) : (
          <motion.div
            key={`document-${docKey}-${renderKey}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="pdf-document-container relative"
          >
            <React.Suspense fallback={<LoadingSpinner />}>
              <ErrorBoundary fallback={handleSuspenseError}>
                <Document
                  key={`${docKey}-${renderKey}`}
                  file={file}
                  onLoadSuccess={handleDocumentLoadSuccess}
                  onLoadError={handleDocumentLoadError}
                  options={DOCUMENT_OPTIONS}
                  loading={<LoadingSpinner />}
                  noData={<NoDataComponent />}
                  error={<p className="text-xs sm:text-sm text-destructive py-1 px-2 bg-destructive/5 rounded-full shadow-sm">Gagal memuat PDF</p>}
                  className="pdf-document"
                  externalLinkTarget="_blank"
                >
                  {numPages > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 300, 
                        damping: 30,
                        duration: 0.5
                      }}
                      className="pdf-page-container"
                    >
                      <Page
                        key={`page-${pageNumber}-${scale}-${rotate}`}
                        pageNumber={pageNumber <= numPages ? pageNumber : 1}
                        scale={scale}
                        rotate={rotate}
                        width={responsiveWidth}
                        height={height}
                        className={`${className} shadow-lg rounded-lg overflow-hidden pdf-page transition-all duration-200 ease-in-out ${pageClassName}`}
                        renderTextLayer={renderTextLayer}
                        renderAnnotationLayer={renderAnnotationLayer}
                        renderMode={renderMode as any}
                        loading={<LoadingSpinner />}
                        error={<p className="text-xs sm:text-sm text-destructive bg-destructive/5 py-1 px-2 rounded-full">Gagal memuat halaman</p>}
                        canvasBackground={isMobile ? "transparent" : "#ffffff"}
                        customTextRenderer={
                          // @ts-ignore - React-PDF memerlukan string tapi kita memberikan elemen JSX
                          ({ str, itemIndex }) => (
                            <span key={itemIndex} style={{ padding: '0 0.1px' }}>{str}</span>
                          )
                        }
                      />
                    </motion.div>
                  )}
                </Document>
              </ErrorBoundary>
            </React.Suspense>
            
            {numPages > 0 && (
              <motion.p 
                className="text-xs text-muted-foreground mt-2 sm:mt-3 bg-background/80 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-full shadow-sm border border-border/30"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                Halaman {pageNumber} dari {numPages}
              </motion.p>
            )}
            
            {/* Fallback content if available */}
            {loading && attempts >= maxAttempts / 2 && fallbackContent && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 0.5 }}
                className="mt-4"
              >
                {fallbackContent}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ErrorBoundary untuk menangani crash React
class ErrorBoundary extends React.Component<{
  children: React.ReactNode;
  fallback: (error: Error) => void;
}> {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by PDF viewer error boundary:", error, errorInfo);
    this.props.fallback(error);
  }
  
  render() {
    if (this.state.hasError) {
      return null; // Fallback handler will handle the UI
    }
    
    return this.props.children;
  }
}

// Fallback untuk menampilkan link ke PDF jika semua opsi lainnya gagal
const SimplePDFLinkFallback = ({ file, onRetry }: { file?: string, onRetry?: () => void }) => {
  const isValidUrl = useMemo(() => {
    if (!file || typeof file !== 'string') return false;
    
    // Cek format URL dasar
    if (file.startsWith('data:') || file.startsWith('blob:')) return true;
    
    try {
      new URL(file);
      return true;
    } catch (e) {
      return false;
    }
  }, [file]);
  
  const handleOpenPDF = () => {
    if (!file || !isValidUrl) return;
    
    try {
      window.open(file, '_blank', 'noopener,noreferrer');
    } catch (e) {
      console.error('Failed to open PDF:', e);
      
      // Fallback
      try {
        const link = document.createElement('a');
        link.href = file;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.click();
      } catch (e2) {
        console.error('Secondary fallback failed:', e2);
      }
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] p-4 bg-muted/10 rounded-lg border border-muted/30 text-center">
      <FileText className="h-10 w-10 text-muted-foreground/60 mb-3" />
      <h3 className="text-sm font-medium mb-2">Viewer PDF tidak dapat dimuat</h3>
      <p className="text-xs text-muted-foreground mb-4 max-w-xs">
        PDF viewer mengalami masalah saat memuat komponen yang diperlukan. 
        Anda masih dapat membuka PDF langsung di browser.
      </p>
      
      <div className="flex flex-wrap gap-2 justify-center">
        {isValidUrl && (
          <button 
            onClick={handleOpenPDF}
            className="px-3 py-1.5 text-xs rounded-md bg-primary/90 hover:bg-primary text-primary-foreground 
                      transition-colors duration-200 shadow-sm flex items-center gap-1.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
            Buka PDF di Tab Baru
          </button>
        )}
        
        {onRetry && (
          <button 
            onClick={onRetry}
            className="px-3 py-1.5 text-xs rounded-md bg-muted hover:bg-muted/80 
                      transition-colors duration-200 shadow-sm flex items-center gap-1.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
              <path d="M3 3v5h5"></path>
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path>
              <path d="M16 21h5v-5"></path>
            </svg>
            Coba Lagi
          </button>
        )}
      </div>
    </div>
  );
};

export default PDFViewer 
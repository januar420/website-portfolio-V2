"use client"

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { useLanguage } from "./language-provider"
import { 
  ZoomIn, ZoomOut, RotateCw, Download, ChevronLeft, ChevronRight, 
  Maximize, Minimize, Share, X, ExternalLink, FileText, Eye, Info,
  RefreshCw, Smartphone, ScreenShare
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import ClientPDFViewer from "@/lib/pdf-client"

// Impor polyfill untuk kompatibilitas
import '@/lib/dom-matrix-polyfill'

// Deteksi client side rendering
const isClient = typeof window !== 'undefined';

// Opsi dokumen statis untuk PDF.js
const DOCUMENT_OPTIONS = {
  cMapUrl: 'https://unpkg.com/pdfjs-dist@5.2.133/cmaps/',
  cMapPacked: true,
  standardFontDataUrl: 'https://unpkg.com/pdfjs-dist@5.2.133/standard_fonts/',
}

// Konstanta untuk rentang zoom
const MIN_SCALE = 0.5;
const MAX_SCALE = 3.0;
const SCALE_STEP = 0.2;

interface CertificationPdfViewerProps {
  pdfUrl: string
  isOpen: boolean
  onClose: () => void
  title: string
  issuedBy: string
  date: string
  fileSize?: string
}

export default function CertificationPdfViewer({
  pdfUrl,
  isOpen,
  onClose,
  title,
  issuedBy,
  date,
  fileSize = "2.4 MB"
}: CertificationPdfViewerProps) {
  const { t } = useLanguage()
  const containerRef = useRef<HTMLDivElement>(null)
  const pdfContainerRef = useRef<HTMLDivElement>(null)
  
  // State untuk PDF viewer
  const [numPages, setNumPages] = useState<number>(0)
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [scale, setScale] = useState<number>(1.0)
  const [rotation, setRotation] = useState<number>(0)
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false)
  const [loadError, setLoadError] = useState<Error | null>(null)
  const [useFallbackViewer, setUseFallbackViewer] = useState<boolean>(false)
  const [showInfo, setShowInfo] = useState<boolean>(false)
  const [retryCount, setRetryCount] = useState<number>(0)
  const [isMobile, setIsMobile] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [renderMode, setRenderMode] = useState<'canvas' | 'svg'>('canvas')
  const [hasUserInteracted, setHasUserInteracted] = useState<boolean>(false)
  
  // Deteksi perangkat mobile
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      
      // Gunakan 'svg' mode pada perangkat mobile untuk performa lebih baik
      if (width < 768 && renderMode !== 'svg') {
        setRenderMode('svg');
      } else if (width >= 768 && renderMode !== 'canvas') {
        setRenderMode('canvas');
      }
    };
    
    // Cek saat komponen mount
    checkDevice();
    
    // Tambahkan listener untuk resize
    window.addEventListener('resize', checkDevice);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', checkDevice);
    };
  }, [renderMode]);

  // Reset status loading ketika pdfUrl berubah
  useEffect(() => {
    if (pdfUrl) {
      setIsLoading(true);
      setLoadError(null);
    }
  }, [pdfUrl]);

  // Efek untuk menangani keyboard shortcuts dengan debounce
  useEffect(() => {
    if (!isOpen) return;

    let keyTimeout: NodeJS.Timeout | null = null;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!containerRef.current) return;
      if (document.activeElement && document.activeElement.tagName === 'INPUT') return;
      if (!hasUserInteracted) setHasUserInteracted(true);
      
      // Debounce untuk mencegah terlalu banyak operasi pada keypress yang cepat
      if (keyTimeout) clearTimeout(keyTimeout);
      
      keyTimeout = setTimeout(() => {
        switch (e.key) {
          case 'ArrowRight':
            changePage(1);
            e.preventDefault();
            break;
          case 'ArrowLeft':
            changePage(-1);
            e.preventDefault();
            break;
          case 'Escape':
            if (isFullscreen) {
              toggleFullscreen();
            } else {
              onClose();
            }
            e.preventDefault();
            break;
          case '+':
          case '=':
            zoomIn();
            e.preventDefault();
            break;
          case '-':
            zoomOut();
            e.preventDefault();
            break;
          case 'r':
          case 'R':
            rotateDocument();
            e.preventDefault();
            break;
          case 'f':
          case 'F':
            toggleFullscreen();
            e.preventDefault();
            break;
        }
      }, 50);
    };

    // Tambahkan event listener ketika komponen dipasang
    window.addEventListener('keydown', handleKeyDown);
    
    // Bersihkan listener ketika komponen dilepas
    return () => {
      if (keyTimeout) clearTimeout(keyTimeout);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, pageNumber, numPages, onClose, isFullscreen]);

  // Fungsi untuk toggle fullscreen dengan dukungan berbagai browser
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    
    if (!isFullscreen) {
      try {
        if (containerRef.current.requestFullscreen) {
          containerRef.current.requestFullscreen();
        } else if ((containerRef.current as any).mozRequestFullScreen) { /* Firefox */
          (containerRef.current as any).mozRequestFullScreen();
        } else if ((containerRef.current as any).webkitRequestFullscreen) { /* Chrome, Safari & Opera */
          (containerRef.current as any).webkitRequestFullscreen();
        } else if ((containerRef.current as any).msRequestFullscreen) { /* IE/Edge */
          (containerRef.current as any).msRequestFullscreen();
        }
        setIsFullscreen(true);
      } catch (error) {
        console.error('Error entering fullscreen:', error);
      }
    } else {
      try {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if ((document as any).mozCancelFullScreen) { /* Firefox */
          (document as any).mozCancelFullScreen();
        } else if ((document as any).webkitExitFullscreen) { /* Chrome, Safari & Opera */
          (document as any).webkitExitFullscreen();
        } else if ((document as any).msExitFullscreen) { /* IE/Edge */
          (document as any).msExitFullscreen();
        }
        setIsFullscreen(false);
      } catch (error) {
        console.error('Error exiting fullscreen:', error);
      }
    }
  }, [isFullscreen]);

  // Deteksi keluar fullscreen dari browser controls dengan dukungan vendor prefix
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isDocFullscreen = 
        !!document.fullscreenElement || 
        !!(document as any).mozFullScreenElement ||
        !!(document as any).webkitFullscreenElement || 
        !!(document as any).msFullscreenElement;
        
      setIsFullscreen(isDocFullscreen);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  // Fungsi untuk loading dokumen berhasil dengan memoization
  const onDocumentLoadSuccess = useCallback((numPages: number) => {
    setNumPages(numPages);
    setPageNumber(1);
    setLoadError(null);
    setIsLoading(false);
    
    // Sesuaikan scale awal untuk perangkat mobile
    if (isMobile && !hasUserInteracted) {
      const optimalScale = Math.min(0.8, scale);
      setScale(optimalScale);
    }
  }, [isMobile, scale, hasUserInteracted]);

  // Fungsi untuk menangani error loading dokumen dengan retry logic yang lebih robust
  const onDocumentLoadError = useCallback((error: Error) => {
    console.error('Error loading PDF:', error);
    setLoadError(error);
    setIsLoading(false);
    
    // Deteksi jenis error spesifik
    const errorMsg = error.message ? error.message.toLowerCase() : '';
    
    // Cek apakah error berkaitan dengan worker
    const isWorkerError = 
      errorMsg.includes('worker') || 
      errorMsg.includes('failed to fetch') || 
      errorMsg.includes('dynamically imported module');
    
    // Cek apakah error berisi "no preview available" atau pesan serupa
    const isNoPreviewError = 
      errorMsg.includes('no preview') || 
      errorMsg.includes('preview not available') ||
      errorMsg.includes('cannot display');
    
    // Strategi penanganan error yang berbeda
    if (isWorkerError) {
      console.log('Detected worker loading issue, switching to fallback viewer immediately');
      // Langsung gunakan fallback viewer untuk error worker
      setUseFallbackViewer(true);
    } else if (isNoPreviewError) {
      console.log('Detected "No preview available" error, trying alternate method');
      // Coba gunakan fallback viewer dengan lebih cepat
      setUseFallbackViewer(true);
    } else {
      // Untuk error lain, coba auto-retry dengan delay
      const fallbackTimer = setTimeout(() => {
        if (retryCount < 3) {
          // Auto-retry dengan exponential backoff (semakin lama menunggu)
          const delay = Math.min(1000 * Math.pow(2, retryCount), 4000);
          console.log(`Auto-retrying in ${delay}ms (attempt ${retryCount + 1}/3)`);
          
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
            setIsLoading(true);
            setLoadError(null);
          }, delay);
        } else {
          console.log('Max retry attempts reached, switching to fallback viewer');
          setUseFallbackViewer(true);
        }
      }, 1000);
      
      return () => clearTimeout(fallbackTimer);
    }
  }, [retryCount]);

  // Fungsi untuk retry manual yang lebih kuat
  const retryLoading = useCallback(() => {
    // Reset state untuk mencoba lagi
    setRetryCount(prev => prev + 1);
    setIsLoading(true);
    setLoadError(null);
    setUseFallbackViewer(false);
    
    // Tambahkan parameter random untuk mencegah caching
    const randomParam = `?nocache=${Date.now()}`;
    const fileUrl = typeof pdfUrl === 'string' ? pdfUrl : '';
    
    // Preload file untuk memeriksa aksesibilitas
    if (fileUrl && !fileUrl.startsWith('data:') && !fileUrl.includes('blob:')) {
      const preloadLink = document.createElement('link');
      preloadLink.rel = 'preload';
      preloadLink.as = 'fetch';
      preloadLink.href = fileUrl.includes('?') ? `${fileUrl}&timestamp=${Date.now()}` : `${fileUrl}${randomParam}`;
      document.head.appendChild(preloadLink);
      
      // Hapus preload link setelah beberapa detik
      setTimeout(() => {
        if (document.head.contains(preloadLink)) {
          document.head.removeChild(preloadLink);
        }
      }, 5000);
    }
  }, [pdfUrl]);

  // Fungsi untuk mengganti halaman dengan validasi
  const changePage = useCallback((offset: number) => {
    const newPageNumber = pageNumber + offset;
    if (newPageNumber >= 1 && newPageNumber <= numPages) {
      setPageNumber(newPageNumber);
    }
  }, [pageNumber, numPages]);

  // Fungsi zoom in/out dengan validasi batasan
  const zoomIn = useCallback(() => {
    setScale(prev => {
      const newScale = Math.min(prev + SCALE_STEP, MAX_SCALE);
      return parseFloat(newScale.toFixed(1));
    });
    if (!hasUserInteracted) setHasUserInteracted(true);
  }, [hasUserInteracted]);
  
  const zoomOut = useCallback(() => {
    setScale(prev => {
      const newScale = Math.max(prev - SCALE_STEP, MIN_SCALE);
      return parseFloat(newScale.toFixed(1));
    });
    if (!hasUserInteracted) setHasUserInteracted(true);
  }, [hasUserInteracted]);

  // Reset zoom ke 100%
  const resetZoom = useCallback(() => {
    setScale(1.0);
    if (!hasUserInteracted) setHasUserInteracted(true);
  }, [hasUserInteracted]);

  // Fungsi rotasi dengan validasi
  const rotateDocument = useCallback(() => {
    setRotation(prev => (prev + 90) % 360);
    if (!hasUserInteracted) setHasUserInteracted(true);
  }, [hasUserInteracted]);

  // Fungsi untuk berbagi sertifikat dengan web share API dan fallback
  const shareCertificate = useCallback(() => {
    if (!hasUserInteracted) setHasUserInteracted(true);
    
    // Buat dynamic share data berdasarkan metadata sertifikat
    const shareData = {
      title: `${title} - ${issuedBy}`,
      text: `${t("certifications.shareText") || 'Lihat sertifikat saya'}: ${title} dari ${issuedBy} (${date})`,
      url: pdfUrl,
    };
    
    if (navigator.share) {
      navigator.share(shareData)
        .then(() => {
          console.log('Shared successfully');
        })
        .catch((error) => {
          console.log('Error sharing:', error);
          // Fallback jika share gagal
          copyToClipboard();
        });
    } else {
      // Fallback jika Web Share API tidak tersedia
      copyToClipboard();
    }
  }, [title, issuedBy, date, pdfUrl, t, hasUserInteracted]);
  
  // Helper untuk copy ke clipboard
  const copyToClipboard = useCallback(() => {
    try {
      navigator.clipboard.writeText(pdfUrl);
      // Toast notification atau alert
      alert(t("certifications.linkCopied") || 'Tautan sertifikat telah disalin!');
    } catch (err) {
      console.error('Failed to copy link:', err);
      // Fallback untuk browser yang tidak mendukung clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = pdfUrl;
      textArea.style.position = 'fixed';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        document.execCommand('copy');
        alert(t("certifications.linkCopied") || 'Tautan sertifikat telah disalin!');
      } catch (err) {
        console.error('Failed to copy with execCommand:', err);
        alert(t("certifications.copyError") || 'Tidak dapat menyalin tautan. Coba salin URL secara manual.');
      }
      
      document.body.removeChild(textArea);
    }
  }, [pdfUrl, t]);

  // Fungsi untuk membuka PDF secara langsung dengan error handling yang lebih baik
  const openPdfDirectly = useCallback((e: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!hasUserInteracted) setHasUserInteracted(true);
    
    // Sanitasi URL
    let urlToOpen = pdfUrl;
    
    try {
      // Validasi dasar URL
      if (!urlToOpen || typeof urlToOpen !== 'string') {
        throw new Error('URL PDF tidak valid');
      }
      
      // Tambahkan parameter waktu untuk mencegah caching
      if (!urlToOpen.startsWith('data:') && !urlToOpen.startsWith('blob:')) {
        urlToOpen = urlToOpen.includes('?')
          ? `${urlToOpen}&_t=${Date.now()}`
          : `${urlToOpen}?_t=${Date.now()}`;
      }
      
      // Gunakan rel=noopener untuk keamanan
      const newWindow = window.open(urlToOpen, '_blank', 'noopener,noreferrer');
      
      if (!newWindow) {
        console.warn('Popup blocker mungkin mencegah pembukaan PDF');
        
        // Coba alternatif 1: Gunakan atribut download
        const downloadLink = document.createElement('a');
        downloadLink.href = urlToOpen;
        downloadLink.target = '_blank';
        downloadLink.rel = 'noopener noreferrer';
        downloadLink.setAttribute('download', `${title.replace(/\s+/g, '_')}.pdf`);
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        setTimeout(() => {
          // Jika metode download tidak berhasil, tampilkan pesan ke pengguna
          alert(t("certifications.popupBlockerWarning") || 'Popup blocker mungkin mencegah pembukaan PDF. Silakan izinkan popup untuk situs ini atau coba unduh filenya.');
        }, 1000);
      } else {
        // Fokus ke window baru
        newWindow.focus();
      }
    } catch (error) {
      console.error('Error opening PDF directly:', error);
      
      // Fallback: redirect langsung
      try {
        if (urlToOpen && typeof urlToOpen === 'string') {
          // Coba dengan Location API
          window.location.href = urlToOpen;
        } else {
          throw new Error('URL tidak valid untuk redirect');
        }
      } catch (redirectError) {
        console.error('Failed to redirect:', redirectError);
        alert(t("certifications.pdfError") || 'Tidak dapat membuka file PDF. Silakan coba lagi.');
      }
    }
  }, [pdfUrl, t, hasUserInteracted, title]);

  // Download PDF dengan progress tracking (jika didukung)
  const downloadPdf = useCallback(() => {
    if (!hasUserInteracted) setHasUserInteracted(true);
    
    try {
      // Coba gunakan fetch untuk mengunduh dengan progress tracking
      if (window.fetch) {
        const downloadLink = document.createElement('a');
        downloadLink.href = pdfUrl;
        downloadLink.download = `${title.replace(/\s+/g, '_')}_${issuedBy.replace(/\s+/g, '_')}.pdf`;
        downloadLink.target = '_blank';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      } else {
        // Fallback for older browsers
        window.location.href = pdfUrl;
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      window.location.href = pdfUrl;
    }
  }, [pdfUrl, title, issuedBy, hasUserInteracted]);

  // Toggle info panel dengan animasi smooth
  const toggleInfo = useCallback(() => {
    if (!hasUserInteracted) setHasUserInteracted(true);
    setShowInfo(prev => !prev);
  }, [hasUserInteracted]);

  // Optimasi: memoize nilai width untuk PDF berdasarkan viewport
  const pdfWidth = useMemo(() => {
    if (isMobile) {
      // Pada mobile, gunakan width yang lebih kecil
      return Math.min(window.innerWidth - 32, 500);
    } else {
      // Pada desktop, lebih lebar
      return isFullscreen ? Math.min(window.innerWidth - 80, 1000) : 600;
    }
  }, [isMobile, isFullscreen]);
  
  // Tampilkan error fallback jika terjadi masalah loading PDF
  const renderErrorFallback = useCallback(() => (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 sm:p-6 text-center">
      <div className="bg-red-50/10 backdrop-blur-md p-6 sm:p-8 rounded-xl border border-red-200/30 shadow-xl max-w-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="flex flex-col items-center"
        >
          <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-red-400/90 mx-auto mb-3 sm:mb-4" />
          <h3 className="text-base sm:text-lg font-medium mb-2">{t("certifications.pdfError") || 'Tidak dapat memuat PDF'}</h3>
          <p className="text-muted-foreground mb-4 sm:mb-6 text-xs sm:text-sm">
            {t("certifications.pdfErrorMessage") || 'Terjadi kesalahan saat memuat dokumen PDF. Coba buka langsung atau unduh filenya.'}
          </p>
          
          {/* Opsi retry */}
          <Button 
            variant="outline" 
            className="mb-3 w-full gap-2 text-xs sm:text-sm bg-background/60 backdrop-blur-sm border-border/50 hover:bg-background/80 transition-all duration-200"
            onClick={retryLoading}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            {t("certifications.retry") || 'Coba Lagi'}
          </Button>
          
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center w-full">
            <Button 
              variant="outline" 
              className="gap-2 text-xs sm:text-sm backdrop-blur-sm bg-background/60 border-border/60 hover:bg-background/80 transition-all duration-200 w-full"
              onClick={openPdfDirectly}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              {t("certifications.openInNewTab") || 'Buka di Tab Baru'}
            </Button>
            <Button 
              variant="default" 
              className="gap-2 text-xs sm:text-sm bg-primary/90 hover:bg-primary transition-all duration-200 w-full"
              onClick={downloadPdf}
            >
              <Download className="h-3.5 w-3.5" />
              {t("certifications.download") || 'Unduh PDF'}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  ), [t, retryLoading, openPdfDirectly, downloadPdf]);

  // Fallback viewer sebagai langkah terakhir: embedded iframe viewer for PDFs
  const renderFallbackViewer = useCallback(() => (
    <div className="w-full h-full flex flex-col items-center justify-center p-2 sm:p-4">
      <motion.div 
        className="w-full h-full min-h-[400px] flex flex-col items-center mb-2 sm:mb-4 bg-background/40 backdrop-blur-md border border-border/40 rounded-xl overflow-hidden shadow-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Coba beberapa metode fallback viewer */}
        {(() => {
          // Sanitasi URL (keamanan & validasi)
          const sanitizedUrl = (() => {
            try {
              if (!pdfUrl || typeof pdfUrl !== 'string') return '';
              // Validasi URL dasar
              if (pdfUrl.startsWith('data:') || pdfUrl.startsWith('blob:')) return pdfUrl;
              
              // Coba parse URL untuk validasi
              new URL(pdfUrl);
              return pdfUrl;
            } catch (e) {
              console.error('Invalid PDF URL:', e);
              return '';
            }
          })();
          
          if (!sanitizedUrl) {
            return (
              <div className="flex flex-col items-center justify-center h-full w-full p-6">
                <FileText className="h-10 w-10 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground text-center mb-2">
                  {t("certifications.invalidUrl") || "URL PDF tidak valid"}
                </p>
                <p className="text-xs text-muted-foreground/70 text-center max-w-xs">
                  {t("certifications.contactAdmin") || "Silakan hubungi administrator jika masalah berlanjut."}
                </p>
              </div>
            );
          }

          // Prioritas fallback viewers
          return (
            <>
              {/* Opsi 1: Google Doc Embed (best compatibility) */}
              <iframe 
                src={`https://docs.google.com/viewer?url=${encodeURIComponent(sanitizedUrl)}&embedded=true`}
                title={title}
                className="w-full h-full min-h-[400px] border-0"
                style={{ backgroundColor: 'rgba(255,255,255,0.9)' }}
                onError={(e) => {
                  console.error('Google Docs viewer failed:', e);
                  // Fallback dihandle di UI
                }}
              />
              
              {/* Fallback content untuk browser yang memblokir iframe */}
              <div className="absolute inset-0 flex-col items-center justify-center p-6 bg-background/80 backdrop-blur-md hidden fallback-content">
                <p className="text-sm font-medium mb-3">PDF tidak dapat ditampilkan dalam viewer</p>
                <p className="text-xs text-muted-foreground mb-4 text-center max-w-xs">
                  Browser mungkin memblokir iframe atau PDF memerlukan otentikasi
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button 
                    className="text-xs rounded-md px-3 py-1.5 bg-primary/90 hover:bg-primary text-primary-foreground 
                              transition-colors duration-200 shadow-sm flex items-center gap-1.5"
                    onClick={openPdfDirectly}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Buka di Tab Baru
                  </button>
                  <button 
                    className="text-xs rounded-md px-3 py-1.5 bg-muted hover:bg-muted/80 
                              transition-colors duration-200 shadow-sm flex items-center gap-1.5"
                    onClick={downloadPdf}
                  >
                    <Download className="h-3.5 w-3.5" />
                    Unduh PDF
                  </button>
                </div>
              </div>
            </>
          );
        })()}
      </motion.div>
      
      {/* Info dan alternatif */}
      <div className="w-full max-w-lg bg-background/70 backdrop-blur-md p-3 sm:p-4 rounded-lg border border-border/40 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium">{title}</h3>
          <Badge variant="outline" className="bg-primary/10 text-primary text-[10px] px-1.5 py-0">
            {fileSize}
          </Badge>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1.5 h-7 text-xs bg-background/80 hover:bg-background transition-colors duration-200"
            onClick={openPdfDirectly}
          >
            <ExternalLink className="h-3 w-3" />
            {t("certifications.openInNewTab") || 'Buka di Tab Baru'}
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1.5 h-7 text-xs bg-background/80 hover:bg-background transition-colors duration-200"
            onClick={downloadPdf}
          >
            <Download className="h-3 w-3" />
            {t("certifications.download") || 'Unduh PDF'}
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1.5 h-7 text-xs bg-background/80 hover:bg-background transition-colors duration-200 ml-auto"
            onClick={retryLoading}
          >
            <RefreshCw className="h-3 w-3" />
            {t("certifications.tryNative") || 'Coba Viewer Asli'}
          </Button>
        </div>
      </div>
      
      {/* Script untuk mendeteksi fallback content jika iframe gagal */}
      {isClient && (
        <script dangerouslySetInnerHTML={{
          __html: `
            setTimeout(function() {
              try {
                const iframe = document.querySelector('iframe');
                const fallbackContent = document.querySelector('.fallback-content');
                
                if (iframe && fallbackContent) {
                  // Cek apakah iframe memuat konten properly setelah beberapa detik
                  if (iframe.contentWindow && iframe.contentWindow.document && 
                      iframe.contentWindow.document.body && 
                      iframe.contentWindow.document.body.innerHTML.length > 100) {
                    // PDF berhasil dimuat di iframe
                  } else {
                    // PDF gagal dimuat, tampilkan fallback
                    fallbackContent.style.display = 'flex';
                  }
                }
              } catch (e) {
                console.error('Error checking iframe:', e);
                // Jika terjadi error saat mengecek iframe, tampilkan fallback
                const fallbackContent = document.querySelector('.fallback-content');
                if (fallbackContent) fallbackContent.style.display = 'flex';
              }
            }, 5000); // Tunggu 5 detik untuk iframe memuat
          `
        }} />
      )}
    </div>
  ), [title, pdfUrl, fileSize, t, openPdfDirectly, downloadPdf, retryLoading, isClient]);

  // Handler untuk menutup dialog
  const closeDialog = useCallback(() => {
    // Reset semua state saat dialog ditutup
    setScale(1.0);
    setRotation(0);
    setLoadError(null);
    setUseFallbackViewer(false);
    setRetryCount(0);
    setIsLoading(true);
    setHasUserInteracted(false);
    
    // Pastikan tidak dalam mode fullscreen saat dialog ditutup
    if (isFullscreen) {
      try {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if ((document as any).mozCancelFullScreen) {
          (document as any).mozCancelFullScreen();
        } else if ((document as any).webkitExitFullscreen) {
          (document as any).webkitExitFullscreen();
        } else if ((document as any).msExitFullscreen) {
          (document as any).msExitFullscreen();
        }
      } catch (e) {
        console.warn('Error exiting fullscreen on close:', e);
      }
    }
    
    // Tutup dialog
    onClose();
  }, [isFullscreen, onClose]);

  // Animations
  const containerVariants = {
    hidden: { 
      opacity: 0,
      scale: isFullscreen ? 1 : 0.95 
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.3, 
        ease: [0.16, 1, 0.3, 1]
      }
    },
    exit: { 
      opacity: 0, 
      scale: isFullscreen ? 1 : 0.95,
      transition: { 
        duration: 0.2, 
        ease: [0.16, 1, 0.3, 1]
      }
    }
  }

  return (
    <div 
      ref={containerRef}
      className={`fixed inset-0 z-50 flex flex-col bg-background/50 backdrop-blur-lg ${
        isFullscreen ? 'fullscreen-mode' : ''
      }`}
      style={{ display: isOpen ? 'flex' : 'none' }}
    >
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div 
            className="flex flex-col w-full h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header dengan info & tombol tutup */}
            <div className="bg-background/80 backdrop-blur-md border-b border-border/40 px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="flex-shrink-0">
                  <FileDocumentIcon className="h-6 w-6 text-primary/80" />
                </div>

                <div className="min-w-0 overflow-hidden">
                  <h3 className="text-sm sm:text-base font-medium truncate pr-2">{title}</h3>
                  <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                    <span className="truncate max-w-[120px] sm:max-w-[180px]">{issuedBy}</span>
                    <span className="text-border/80">•</span>
                    <span>{date}</span>
                  </div>
                </div>

                <Badge 
                  variant="outline" 
                  className="hidden sm:flex bg-primary/5 text-primary text-[10px] px-1.5 py-0 h-4"
                >
                  {fileSize}
                </Badge>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 rounded-full hidden sm:flex hover:bg-background/80 text-muted-foreground"
                        onClick={toggleInfo}
                      >
                        <Info className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">
                      <p>{t("certifications.info") || 'Info'}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 sm:h-8 sm:w-8 rounded-full hover:bg-accent/50"
                      onClick={closeDialog}
                    >
                      <X className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    <p>{t("certifications.close") || 'Tutup'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Panel Info Sertifikat */}
            <AnimatePresence>
              {showInfo && (
                <motion.div 
                  className="bg-background/60 backdrop-blur-sm border-b border-border/40 px-4 py-3 text-xs"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    <div>
                      <p className="text-muted-foreground mb-0.5">{t("certifications.issuer") || 'Penerbit'}</p>
                      <p className="font-medium">{issuedBy}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-0.5">{t("certifications.issueDate") || 'Tanggal Terbit'}</p>
                      <p className="font-medium">{date}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-0.5">{t("certifications.fileSize") || 'Ukuran File'}</p>
                      <p className="font-medium">{fileSize}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Toolbar dengan kontrol PDF - Desain premium & responsif */}
            <div className="bg-background/40 backdrop-blur-md border-b border-border/40 px-2 sm:px-4 py-1.5 sm:py-2 flex flex-wrap items-center gap-1.5 sm:gap-3 sticky top-0 z-10">
              <div className="flex items-center gap-1 bg-background/70 rounded-full px-1.5 sm:px-2 py-0.5 sm:py-1 border border-border/30 shadow-sm">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 sm:h-7 sm:w-7 rounded-full hover:bg-background/80"
                  onClick={() => changePage(-1)} 
                  disabled={pageNumber <= 1 || loadError !== null}
                >
                  <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
                <div className="text-xs sm:text-sm font-medium whitespace-nowrap px-1 sm:px-1.5">
                  {pageNumber} / {numPages || '-'}
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 sm:h-7 sm:w-7 rounded-full hover:bg-background/80"
                  onClick={() => changePage(1)} 
                  disabled={pageNumber >= numPages || loadError !== null}
                >
                  <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
              </div>

              <div className="h-5 w-px bg-border/30 mx-0.5 hidden sm:block" />
              
              <div className="flex items-center gap-1 bg-background/70 rounded-full px-1.5 sm:px-2 py-0.5 sm:py-1 border border-border/30 shadow-sm">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 sm:h-7 sm:w-7 rounded-full hover:bg-background/80"
                        onClick={zoomOut} 
                        disabled={loadError !== null}
                      >
                        <ZoomOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">
                      <p>{t("certifications.zoomOut") || 'Perkecil'}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Button
                  variant="ghost"
                  className="h-6 px-1 sm:px-1.5 text-xs font-medium hover:bg-background/80 rounded-full"
                  onClick={resetZoom}
                  disabled={loadError !== null}
                >
                  {Math.round(scale * 100)}%
                </Button>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 sm:h-7 sm:w-7 rounded-full hover:bg-background/80"
                        onClick={zoomIn} 
                        disabled={loadError !== null}
                      >
                        <ZoomIn className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">
                      <p>{t("certifications.zoomIn") || 'Perbesar'}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className="ml-auto flex items-center gap-1">
                <div className="flex items-center gap-1 bg-background/70 rounded-full px-1.5 sm:px-2 py-0.5 sm:py-1 border border-border/30 shadow-sm">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 sm:h-7 sm:w-7 rounded-full hover:bg-background/80"
                          onClick={rotateDocument} 
                          disabled={loadError !== null}
                        >
                          <RotateCw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="text-xs">
                        <p>{t("certifications.rotate") || 'Putar'}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 sm:h-7 sm:w-7 rounded-full hover:bg-background/80"
                          onClick={shareCertificate}
                        >
                          <Share className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="text-xs">
                        <p>{t("certifications.share") || 'Bagikan'}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 sm:h-7 sm:w-7 rounded-full hover:bg-background/80"
                          onClick={downloadPdf}
                        >
                          <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="text-xs">
                        <p>{t("certifications.download") || 'Unduh'}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 sm:h-7 sm:w-7 rounded-full hover:bg-background/80"
                          onClick={toggleFullscreen}
                        >
                          {isFullscreen ? (
                            <Minimize className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          ) : (
                            <Maximize className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="text-xs">
                        <p>
                          {isFullscreen 
                            ? t("certifications.exitFullscreen") || 'Keluar Mode Layar Penuh'
                            : t("certifications.fullscreen") || 'Mode Layar Penuh'
                          }
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>

            {/* Konten PDF dengan Scrollable View */}
            <div 
              className="flex-1 overflow-auto bg-gradient-to-b from-muted/20 to-muted/5 relative"
              ref={pdfContainerRef}
            >
              <AnimatePresence mode="wait">
                {loadError && !useFallbackViewer ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0"
                  >
                    {renderErrorFallback()}
                  </motion.div>
                ) : useFallbackViewer ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0"
                  >
                    {renderFallbackViewer()}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-center p-2 sm:p-4 min-h-[300px] sm:min-h-[400px] overflow-y-auto custom-scrollbar"
                  >
                    <div className={`
                      bg-background/50 backdrop-blur-md border border-border/30 
                      rounded-xl p-4 sm:p-6 shadow-xl max-w-full
                      ${isMobile ? 'pdf-mobile-view' : ''}
                      ${isLoading ? 'opacity-60' : ''}
                    `}>
                      <ClientPDFViewer 
                        file={pdfUrl}
                        pageNumber={pageNumber}
                        scale={scale}
                        rotate={rotation}
                        width={pdfWidth}
                        renderMode={renderMode}
                        onLoadSuccess={onDocumentLoadSuccess}
                        onLoadError={onDocumentLoadError}
                        onPageChange={setPageNumber}
                        onScaleChange={setScale}
                        className={`pdf-viewer rounded-lg overflow-hidden shadow-md ${isFullscreen ? 'fullscreen-pdf' : ''}`}
                        pageClassName={`pdf-page ${rotation !== 0 ? 'pdf-rotated' : ''}`}
                        renderTextLayer={!isMobile}
                        renderAnnotationLayer={false}
                        enableSwipe={true}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function FileDocumentIcon(props: React.SVGProps<SVGSVGElement>): JSX.Element {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  )
}

"use client"

import React, { useState, useRef, useEffect } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import { 
  ZoomIn, ZoomOut, RotateCw, Download, ChevronLeft, ChevronRight, 
  Maximize, Minimize, Share, X 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "./language-provider"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Deklarasikan tipe untuk window.PDFViewerOptions
declare global {
  interface Window {
    PDFViewerOptions?: {
      cMapUrl: string;
      cMapPacked: boolean;
      standardFontDataUrl: string;
    }
  }
}

// Versi yang kompatibel dengan pdfjs-dist dari package.json
const COMPATIBLE_PDFJS_VERSION = '5.2.133';

// Daftar CDN untuk fallback
const CDN_WORKER_URLS = [
  `https://unpkg.com/pdfjs-dist@${COMPATIBLE_PDFJS_VERSION}/build/pdf.worker.min.js`,
  `https://cdn.jsdelivr.net/npm/pdfjs-dist@${COMPATIBLE_PDFJS_VERSION}/build/pdf.worker.min.js`,
  `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${COMPATIBLE_PDFJS_VERSION}/pdf.worker.min.js`
];

// Konfigurasi PDF.js worker dengan pendekatan yang lebih robust
const PdfWorkerSetup = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [workerLoaded, setWorkerLoaded] = useState(false);

  useEffect(() => {
    const setupPdfWorker = async () => {
      try {
        console.log("Setting up PDF.js worker...");
        
        // 1. Coba gunakan file worker lokal terlebih dahulu (prioritas tertinggi)
        const localWorkerPaths = [
          '/pdf.worker.min.js',
          '/static/pdf.worker.min.js',
          '/_next/static/pdf.worker.min.js'
        ];
        
        let workerPath = '';
        let workerFound = false;
        
        // Coba semua path lokal
        for (const path of localWorkerPaths) {
          try {
            const response = await fetch(path, { method: 'HEAD' });
            if (response.ok) {
              workerPath = path;
              workerFound = true;
              console.log(`✅ PDF.js worker ditemukan di: ${path}`);
              break;
            }
          } catch (e) {
            console.log(`❌ PDF.js worker tidak ditemukan di: ${path}`);
          }
        }
        
        // 2. Jika worker lokal tidak ditemukan, coba gunakan CDN (fallback)
        if (!workerFound) {
          console.warn("⚠️ Local worker tidak ditemukan, mencoba CDN...");
          
          for (const cdnUrl of CDN_WORKER_URLS) {
            try {
              const response = await fetch(cdnUrl, { method: 'HEAD' });
              if (response.ok) {
                workerPath = cdnUrl;
                workerFound = true;
                console.log(`✅ PDF.js worker ditemukan di CDN: ${cdnUrl}`);
                break;
              }
            } catch (e) {
              console.log(`❌ PDF.js worker tidak ditemukan di CDN: ${cdnUrl}`);
            }
          }
        }
        
        // 3. Jika worker ditemukan (lokal atau CDN), gunakan
        if (workerFound) {
          console.log(`📄 Menggunakan PDF.js worker dari: ${workerPath}`);
          pdfjs.GlobalWorkerOptions.workerSrc = workerPath;
          setWorkerLoaded(true);
        } else {
          // 4. Jika tidak ada worker yang ditemukan, gunakan direct import
          console.warn("⚠️ Tidak dapat menemukan PDF.js worker, menggunakan direct import...");
          try {
            // Import worker menggunakan dynamic import dengan eval untuk menghindari error build time
            const workerScript = `import('pdfjs-dist/build/pdf.worker.min.js')`;
            const importWorker = new Function(`return ${workerScript}`)();
            importWorker
              .then(() => {
                console.log("✅ Worker berhasil diimpor langsung");
                setWorkerLoaded(true);
              })
              .catch((error) => {
                console.error("❌ Gagal memuat worker secara langsung:", error);
                throw error;
              });
          } catch (nodeModulesError) {
            console.error("❌ Gagal memuat worker secara dinamis:", nodeModulesError);
            
            // Fallback final - mencoba membuat blob worker
            try {
              const workerBlob = new Blob([`importScripts("${CDN_WORKER_URLS[0]}");`], { type: 'application/javascript' });
              pdfjs.GlobalWorkerOptions.workerSrc = URL.createObjectURL(workerBlob);
              setWorkerLoaded(true);
              console.log("✅ Fallback worker berhasil dibuat");
            } catch (finalError) {
              console.error("❌ Semua upaya gagal, PDF tidak dapat dirender:", finalError);
            }
          }
        }
        
        // Set opsi default untuk cMaps dan font data
        window.PDFViewerOptions = {
          cMapUrl: `https://unpkg.com/pdfjs-dist@${COMPATIBLE_PDFJS_VERSION}/cmaps/`,
          cMapPacked: true,
          standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${COMPATIBLE_PDFJS_VERSION}/standard_fonts/`
        };
      } catch (error) {
        console.error('❌ Error saat setup PDF.js worker:', error);
      } finally {
        // Selesai loading apapun hasilnya
        setIsLoading(false);
      }
    };
    
    setupPdfWorker();
    
    // Cleanup function untuk membersihkan saat komponen unmount
    return () => {
      // Bersihkan URL object jika ada
      if (pdfjs.GlobalWorkerOptions.workerSrc && 
          pdfjs.GlobalWorkerOptions.workerSrc.startsWith('blob:')) {
        URL.revokeObjectURL(pdfjs.GlobalWorkerOptions.workerSrc);
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-pulse bg-primary/10 p-4 rounded-md flex flex-col items-center space-y-2">
          <div className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin"></div>
          <p className="text-xs text-muted-foreground">Menyiapkan PDF Viewer...</p>
        </div>
      </div>
    );
  }

  if (!workerLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="bg-destructive/10 p-4 rounded-md flex flex-col items-center space-y-2">
          <X className="h-8 w-8 text-destructive" />
          <p className="text-sm font-medium text-destructive">Gagal memuat PDF Viewer</p>
          <p className="text-xs text-muted-foreground text-center max-w-xs">
            Komponen PDF Viewer tidak dapat dimuat. Anda masih dapat mengunduh atau membuka PDF langsung.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

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
  const [numPages, setNumPages] = useState<number | null>(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [loadError, setLoadError] = useState<Error | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const closeBtnRef = useRef<HTMLButtonElement>(null)
  
  // Reset error saat PDF berubah
  useEffect(() => {
    setLoadError(null);
  }, [pdfUrl]);
  
  // Handle esc key untuk menutup dialog
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        console.log("Escape key pressed, closing dialog");
        closeDialog();
        
        // Fallback jika closeDialog tidak berfungsi
        setTimeout(() => {
          // Coba klik tombol close jika masih terbuka
          if (closeBtnRef.current && isOpen) {
            closeBtnRef.current.click();
          }
        }, 100);
      }
    };
    
    // Handle tab trap for accessibility
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && containerRef.current) {
        const focusableElements = containerRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length > 0) {
          const firstElement = focusableElements[0] as HTMLElement;
          const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
          
          if (e.shiftKey && document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };
    
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("keydown", handleTabKey);
      
      // Auto-focus close button for better keyboard accessibility
      setTimeout(() => {
        const closeButton = containerRef.current?.querySelector('button[aria-label="Close dialog"]') as HTMLElement;
        if (closeButton) {
          closeButton.focus();
        }
      }, 100);
    }
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keydown", handleTabKey);
    }
  }, [isOpen, onClose]);

  // Cleanup effect untuk memastikan tidak ada listener yang tersisa
  useEffect(() => {
    return () => {
      // Cleanup semua listener saat komponen unmount
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(err => {
          console.error(`Error exiting fullscreen: ${err.message}`);
        });
      }
    };
  }, []);
  
  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    try {
      if (!document.fullscreenElement) {
        // Masuk mode fullscreen
        containerRef.current?.requestFullscreen().then(() => {
          setIsFullscreen(true);
        }).catch(err => {
          console.error(`Error attempting to enable fullscreen mode: ${err.message}`);
          setIsFullscreen(false);
        });
      } else {
        // Keluar dari mode fullscreen
        document.exitFullscreen().then(() => {
          setIsFullscreen(false);
        }).catch(err => {
          console.error(`Error attempting to exit fullscreen mode: ${err.message}`);
        });
      }
    } catch (error) {
      console.error("Fullscreen API error:", error);
      // Fallback aksi jika fullscreen API tidak tersedia
      if (containerRef.current) {
        containerRef.current.classList.toggle('fixed');
        containerRef.current.classList.toggle('inset-0');
        containerRef.current.classList.toggle('z-[999]');
        setIsFullscreen(!isFullscreen);
      }
    }
  }
  
  // Handler untuk saat dokumen berhasil dimuat
  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages)
    setPageNumber(1)
    setLoadError(null)
  }
  
  // Handler untuk error saat memuat dokumen
  function onDocumentLoadError(error: Error) {
    console.error('Error loading PDF:', error);
    setLoadError(error);
  }
  
  // Halaman selanjutnya
  function changePage(offset: number) {
    if (numPages) {
      const newPageNumber = pageNumber + offset
      if (newPageNumber >= 1 && newPageNumber <= numPages) {
        setPageNumber(newPageNumber)
      }
    }
  }
  
  // Zoom in/out
  function zoomIn() {
    setScale(prevScale => Math.min(prevScale + 0.2, 3))
  }
  
  function zoomOut() {
    setScale(prevScale => Math.max(prevScale - 0.2, 0.5))
  }
  
  // Rotasi dokumen
  function rotateDocument() {
    setRotation(prevRotation => (prevRotation + 90) % 360)
  }
  
  // Berbagi sertifikasi
  function shareCertificate() {
    if (navigator.share) {
      navigator.share({
        title: title,
        text: `Lihat sertifikasi '${title}' oleh ${issuedBy}`,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
        .then(() => {
          alert('URL disalin ke clipboard!')
        })
    }
  }
  
  // Animation variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  }
  
  const dialogVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, y: 50, scale: 0.95, transition: { duration: 0.2, ease: "easeIn" } }
  }
  
  // Fungsi untuk membuka PDF secara langsung di tab baru jika terjadi error
  const openPdfDirectly = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      // Tambahkan timestamp untuk menghindari caching
      const url = pdfUrl.includes('?') 
        ? `${pdfUrl}&t=${Date.now()}` 
        : `${pdfUrl}?t=${Date.now()}`;
      
      // Log informasi untuk debugging
      console.log("Opening PDF directly:", url);
        
      // Buka di tab baru dengan target dan rel yang sesuai
      const newWindow = window.open(url, '_blank');
      
      // Pastikan tab baru terbuka dengan baik
      if (newWindow) {
        newWindow.focus();
      } else {
        // Jika popup blocker mencegah pembukaan tab baru
        console.warn("Popup blocker detected");
        alert('Popup blocker mungkin mencegah pembukaan PDF. Mohon izinkan popup untuk website ini.');
      }
      
      // Tutup dialog setelah membuka PDF
      setTimeout(() => {
        onClose();
      }, 300);
    } catch (error) {
      console.error('Error opening PDF:', error);
      // Menampilkan error yang lebih spesifik
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error details:', errorMessage);
      alert(`Gagal membuka PDF. Error: ${errorMessage}. Silakan coba lagi nanti.`);
    }
  };
  
  // Render fallback jika ada error
  const renderErrorFallback = () => (
    <div className="flex flex-col items-center justify-center h-[500px] w-full">
      <div className="bg-destructive/10 rounded-md p-8 text-center max-w-md">
        <p className="text-destructive font-medium mb-4">Gagal memuat pratinjau PDF</p>
        <p className="text-sm text-muted-foreground mb-6">
          Terjadi masalah saat menampilkan pratinjau PDF. Anda masih dapat membuka atau mengunduh file PDF secara langsung.
        </p>
        <Button 
          variant="default" 
          onClick={openPdfDirectly}
          className="mx-auto"
        >
          <Download className="h-4 w-4 mr-2" />
          Buka PDF di Tab Baru
        </Button>
      </div>
    </div>
  );
  
  // Helper function untuk menutup dialog
  const closeDialog = () => {
    console.log("Dialog close helper called");
    if (typeof onClose === 'function') {
      onClose();
    }
  };
  
  return (
    <PdfWorkerSetup>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex items-center justify-center"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={backdropVariants}
            onClick={(e) => {
              // Hanya tutup jika klik tepat pada backdrop (bukan pada konten)
              if (e.target === e.currentTarget) {
                e.stopPropagation();
                console.log("Backdrop clicked, closing dialog");
                closeDialog();
              }
            }}
          >
            <motion.div
              ref={containerRef}
              className="bg-background border border-border rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden relative"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={dialogVariants}
              onClick={(e) => {
                // Mencegah event klik menutup modal saat mengklik konten
                e.stopPropagation();
              }}
              style={{ pointerEvents: 'auto' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border p-4 bg-background/90">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-primary/10 p-2">
                    <FileDocumentIcon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{title}</h3>
                    <p className="text-sm text-muted-foreground">{issuedBy}</p>
                  </div>
                </div>
                
                <div 
                  className="relative z-[150] flex items-center justify-center" 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  role="button"
                  tabIndex={-1}
                >
                  <Button 
                    ref={closeBtnRef}
                    variant="ghost" 
                    size="icon" 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log("Close button clicked");
                      closeDialog();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        console.log("Close button key pressed");
                        closeDialog();
                      }
                    }}
                    aria-label="Close dialog"
                    className="hover:bg-destructive/20 active:bg-destructive/30 transition-colors duration-200 cursor-pointer active:scale-95 hover:scale-105 focus:ring-2 focus:ring-primary focus:outline-none"
                    type="button"
                  >
                    <X className="h-5 w-5 text-foreground" />
                    <span className="sr-only">Tutup</span>
                  </Button>
                </div>
              </div>
              
              {/* Toolbar */}
              <div className="flex items-center justify-between gap-2 border-b border-border p-2 bg-muted/30">
                <div className="flex items-center gap-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={zoomOut} disabled={!!loadError}>
                          <ZoomOut className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Zoom Out</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <div className="w-24">
                    <Slider
                      value={[scale * 50]}
                      min={25}
                      max={150}
                      step={5}
                      onValueChange={(value) => setScale(value[0] / 50)}
                      disabled={!!loadError}
                    />
                  </div>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={zoomIn} disabled={!!loadError}>
                          <ZoomIn className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Zoom In</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <Badge variant="outline" className="text-xs ml-2">
                    {Math.round(scale * 100)}%
                  </Badge>
                </div>
                
                <div className="flex items-center gap-1 mx-auto">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => changePage(-1)}
                    disabled={pageNumber <= 1 || !!loadError}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <span className="text-sm">
                    {pageNumber} / {numPages || '-'}
                  </span>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => changePage(1)}
                    disabled={!numPages || pageNumber >= numPages || !!loadError}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex items-center gap-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={rotateDocument} disabled={!!loadError}>
                          <RotateCw className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Rotate</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={toggleFullscreen} disabled={!!loadError}>
                          {isFullscreen ? (
                            <Minimize className="h-4 w-4" />
                          ) : (
                            <Maximize className="h-4 w-4" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={shareCertificate}>
                          <Share className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Share</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" asChild>
                          <a 
                            href={`${pdfUrl}${pdfUrl.includes('?') ? '&' : '?'}t=${Date.now()}`} 
                            download 
                            target="_blank" 
                            rel="noopener noreferrer"
                            onClick={(e) => {
                              // Hentikan propagasi untuk mencegah penutupan dialog
                              e.stopPropagation();
                              console.log("Toolbar Download button clicked", pdfUrl);
                            }}
                          >
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Download</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              
              {/* PDF Viewer */}
              <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-gray-800 relative">
                {loadError ? (
                  renderErrorFallback()
                ) : (
                  <div 
                    style={{ 
                      transform: `scale(${scale}) rotate(${rotation}deg)`,
                      transformOrigin: 'center',
                      transition: 'transform 0.3s ease'
                    }}
                    className="pdf-container mx-auto"
                  >
                    <Document
                      file={pdfUrl}
                      onLoadSuccess={onDocumentLoadSuccess}
                      onLoadError={onDocumentLoadError}
                      loading={
                        <div className="flex items-center justify-center h-[500px] w-[400px]">
                          <div className="animate-pulse bg-primary/10 h-full w-full rounded-md flex items-center justify-center">
                            <p className="text-muted-foreground">Loading PDF...</p>
                          </div>
                        </div>
                      }
                      error={renderErrorFallback()}
                      options={{
                        // Menggunakan versi yang kompatibel dengan pdfjs-dist dari package.json
                        cMapUrl: `https://unpkg.com/pdfjs-dist@${COMPATIBLE_PDFJS_VERSION}/cmaps/`,
                        cMapPacked: true,
                        standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${COMPATIBLE_PDFJS_VERSION}/standard_fonts/`,
                        
                        // Opsi tambahan untuk meningkatkan ketahanan
                        disableStream: false,
                        disableAutoFetch: false,
                        
                        // Opsi kinerja
                        maxImageSize: 1024 * 1024 * 10, // 10 MB
                        isEvalSupported: true,
                        useSystemFonts: true,
                        useWorkerFetch: true,
                      }}
                    >
                      <Page
                        key={`page_${pageNumber}_scale_${scale}_rotation_${rotation}`}
                        pageNumber={pageNumber}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        className="shadow-xl"
                      />
                    </Document>
                  </div>
                )}
              </div>
              
              {/* Footer */}
              <div className="border-t border-border p-4 text-sm text-muted-foreground bg-muted/30">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-xs font-medium text-foreground">{t("certifications.fileDetails")}</p>
                      <p className="text-xs">{t("certifications.date")}: {date}</p>
                    </div>
                    <div>
                      <p className="text-xs">Format: PDF</p>
                      <p className="text-xs">Size: {fileSize}</p>
                    </div>
                  </div>
                  
                  <Button variant="default" size="sm" asChild>
                    <a 
                      href={`${pdfUrl}${pdfUrl.includes('?') ? '&' : '?'}t=${Date.now()}`} 
                      download 
                      target="_blank" 
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        // Hentikan propagasi untuk mencegah penutupan dialog
                        e.stopPropagation();
                        // Tambahkan console log untuk debugging
                        console.log("Download/Open PDF button clicked", pdfUrl);
                        // Jeda sebentar sebelum menutup dialog
                        setTimeout(() => {
                          closeDialog();
                        }, 300);
                      }}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      {t("certifications.openPdf")}
                    </a>
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PdfWorkerSetup>
  );
}

// Ikon file dokumen
function FileDocumentIcon(props: React.SVGProps<SVGSVGElement>): JSX.Element {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
      <path d="M10 9H8" />
    </svg>
  );
}

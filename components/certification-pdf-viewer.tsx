"use client"

import React, { useState, useRef, useEffect, useMemo } from "react"
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

// Konfigurasi worker PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

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
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Handle esc key untuk menutup dialog
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }
    
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown)
    }
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, onClose])
  
  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen mode: ${err.message}`)
      })
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }
  
  // Handler untuk saat dokumen berhasil dimuat
  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages)
    setPageNumber(1)
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
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={backdropVariants}
          onClick={onClose}
        >
          <motion.div
            ref={containerRef}
            className="bg-background border border-border rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={dialogVariants}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <FileDocument className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">{title}</h3>
                  <p className="text-sm text-muted-foreground">{issuedBy}</p>
                </div>
              </div>
              
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-2 border-b border-border p-2 bg-muted/30">
              <div className="flex items-center gap-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={zoomOut}>
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
                  />
                </div>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={zoomIn}>
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
                  disabled={pageNumber <= 1}
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
                  disabled={!numPages || pageNumber >= numPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center gap-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={rotateDocument}>
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
                      <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
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
                        <a href={pdfUrl} download target="_blank" rel="noopener noreferrer">
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
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-gray-800">
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
                  loading={
                    <div className="flex items-center justify-center h-[500px] w-[400px]">
                      <div className="animate-pulse bg-primary/10 h-full w-full rounded-md flex items-center justify-center">
                        <p className="text-muted-foreground">Loading PDF...</p>
                      </div>
                    </div>
                  }
                  error={
                    <div className="flex items-center justify-center h-[500px] w-[400px]">
                      <div className="bg-destructive/10 h-full w-full rounded-md flex flex-col items-center justify-center p-8 text-center">
                        <p className="text-destructive font-medium mb-2">Failed to load PDF</p>
                        <p className="text-sm text-muted-foreground">The document could not be loaded. Please try again later.</p>
                      </div>
                    </div>
                  }
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
                  <a href={pdfUrl} download target="_blank" rel="noopener noreferrer">
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
  )
}

// Ikon file dokumen
function FileDocument(props: React.SVGProps<SVGSVGElement>) {
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
  )
} 
"use client"

import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/components/language-provider';

interface FallbackPdfLoaderProps {
  pdfUrl: string;
  title: string;
  issuer?: string;
  onTryAgain?: () => void;
  className?: string;
  variant?: 'default' | 'compact';
}

/**
 * Komponen fallback jika PDF viewer gagal dimuat
 * Menyediakan opsi untuk membuka PDF langsung di tab baru atau download
 */
export function FallbackPdfLoader({
  pdfUrl,
  title,
  issuer,
  onTryAgain,
  className = '',
  variant = 'default'
}: FallbackPdfLoaderProps) {
  const { t } = useLanguage();
  
  // Tambahkan timestamp untuk mencegah caching
  const getUrlWithTimestamp = (url: string) => {
    return url.includes('?') 
      ? `${url}&t=${Date.now()}` 
      : `${url}?t=${Date.now()}`;
  };
  
  // Handler untuk membuka PDF di tab baru
  const handleOpenPdf = (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      window.open(getUrlWithTimestamp(pdfUrl), '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Error opening PDF:', error);
      alert(t("errors.openPdfFailed"));
    }
  };
  
  // Handler untuk download
  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      // Buat anchor element untuk download
      const link = document.createElement('a');
      link.href = getUrlWithTimestamp(pdfUrl);
      link.download = title.replace(/\s+/g, '_') + '.pdf';
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
      }, 100);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert(t("errors.downloadFailed"));
    }
  };
  
  if (variant === 'compact') {
    return (
      <div className={`bg-muted/30 rounded-md p-4 ${className}`}>
        <div className="flex items-center gap-2 mb-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{title}</span>
        </div>
        
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleOpenPdf}>
            <ExternalLink className="h-3 w-3 mr-1" />
            {t("common.open")}
          </Button>
          <Button size="sm" variant="default" onClick={handleDownload}>
            <Download className="h-3 w-3 mr-1" />
            {t("common.download")}
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`flex flex-col items-center justify-center p-6 bg-muted/30 rounded-lg border border-border ${className}`}>
      <div className="rounded-full bg-primary/10 p-3 mb-4">
        <FileText className="h-6 w-6 text-primary" />
      </div>
      
      <h3 className="text-lg font-medium mb-1">{title}</h3>
      {issuer && <p className="text-sm text-muted-foreground mb-4">{issuer}</p>}
      
      <p className="text-sm text-center mb-6 max-w-md text-muted-foreground">
        {t("errors.pdfViewerFailed")}
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        {onTryAgain && (
          <Button variant="outline" className="flex-1" onClick={onTryAgain}>
            {t("common.tryAgain")}
          </Button>
        )}
        
        <Button variant="outline" className="flex-1" onClick={handleOpenPdf}>
          <ExternalLink className="h-4 w-4 mr-2" />
          {t("common.openInNewTab")}
        </Button>
        
        <Button variant="default" className="flex-1" onClick={handleDownload}>
          <Download className="h-4 w-4 mr-2" />
          {t("common.download")}
        </Button>
      </div>
    </div>
  );
} 
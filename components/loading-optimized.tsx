"use client";

import React, { useEffect, useState } from 'react';

interface LoadingOptimizedProps {
  message?: string;
  timeout?: number;
  showProgress?: boolean;
}

/**
 * Komponen loading dengan optimasi performa dan UX
 * - Timeout otomatis untuk mencegah loading tanpa batas
 * - Indikator progres yang halus
 * - Animasi yang efisien
 */
export default function LoadingOptimized({
  message = "Inisialisasi...",
  timeout = 800, // timeout default lebih cepat
  showProgress = true
}: LoadingOptimizedProps) {
  const [progress, setProgress] = useState(0);
  const [visibleMessage, setVisibleMessage] = useState(message);

  useEffect(() => {
    // Setup penambahan progres secara bertahap
    const startTime = Date.now();
    const endTime = startTime + timeout;
    
    const updateProgress = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const newProgress = Math.min(100, (elapsed / timeout) * 100);
      
      setProgress(newProgress);

      // Perbarui pesan jika mendekati selesai
      if (newProgress > 80 && visibleMessage === message) {
        setVisibleMessage("Hampir selesai...");
      }
      
      if (newProgress < 100) {
        // Gunakan requestAnimationFrame untuk animasi yang lebih efisien
        requestAnimationFrame(updateProgress);
      }
    };
    
    // Mulai animasi progres
    requestAnimationFrame(updateProgress);
    
    // Cleanup
    return () => {
      // Tidak perlu membersihkan requestAnimationFrame karena akan berhenti saat komponen unmount
    };
  }, [message, timeout, visibleMessage]);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="text-sm text-foreground/70">{visibleMessage}</p>
        {showProgress && (
          <div className="w-48 h-1 bg-gray-200 rounded-full overflow-hidden mt-1">
            <div 
              className="h-full bg-primary transition-all duration-200 ease-out" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
} 
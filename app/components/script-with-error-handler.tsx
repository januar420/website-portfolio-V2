"use client"

import Script from "next/script"
import { useEffect, useState } from "react"

// Interface dasar untuk custom window properties
interface CustomWindow extends Window {
  ReactCurrentOwner?: { current: null | object };
  __R3F_PATCHED?: boolean;
}

export default function ScriptWithErrorHandler() {
  const [patchStatus, setPatchStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  
  // Patch darurat jika script gagal dimuat
  useEffect(() => {
    // Hanya patch jika di browser
    if (typeof window !== 'undefined') {
      // Gunakan type assertion untuk window
      const customWindow = window as CustomWindow;
      
      // Pastikan ReactCurrentOwner tersedia
      if (!customWindow.ReactCurrentOwner) {
        console.info("[PATCH] Setting up fallback ReactCurrentOwner")
        customWindow.ReactCurrentOwner = { current: null }
      }
      
      // Coba patch React internals
      try {
        const React = require('react')
        // @ts-ignore - React internal types tidak didefinisikan
        if (!React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED?.ReactCurrentOwner) {
          console.info("[PATCH] Setting up fallback React internals")
          // @ts-ignore
          if (!React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) {
            // @ts-ignore
            React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = {}
          }
          // @ts-ignore
          React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner = { current: null }
        }
      } catch (e) {
        console.warn("[PATCH] Could not patch React internals:", e)
      }
      
      // Siapkan property penting untuk Fiber
      try {
        // @ts-ignore - property performance._updatedFibers tidak didefinisikan di TypeScript
        if (window.performance && typeof window.performance._updatedFibers === 'undefined') {
          console.info("[PATCH] Preparing _updatedFibers property")
          // @ts-ignore
          window.performance._updatedFibers = new Set();
        }
      } catch (e) {
        console.warn("[PATCH] Could not setup _updatedFibers:", e)
      }
    }
  }, []);

  return (
    <Script
      id="r3f-patch-script"
      src="/r3f-patch.js"
      strategy="beforeInteractive"
      onLoad={() => {
        console.info('R3F patch script loaded successfully');
        setPatchStatus('ready');
        
        // Pastikan window.ReactCurrentOwner tersedia
        if (typeof window !== 'undefined') {
          const customWindow = window as CustomWindow;
          if (!customWindow.ReactCurrentOwner) {
            customWindow.ReactCurrentOwner = { current: null };
          }
          
          // Tambahkan property performance._updatedFibers
          try {
            // @ts-ignore - menambahkan property yang dibutuhkan R3F
            if (window.performance && typeof window.performance._updatedFibers === 'undefined') {
              // @ts-ignore
              window.performance._updatedFibers = new Set();
            }
          } catch (e) {
            console.warn('Error setting up performance._updatedFibers:', e);
          }
          
          // Tandai bahwa patch sudah diaplikasikan
          customWindow.__R3F_PATCHED = true;
        }
      }}
      onError={(e) => {
        console.error('Error loading R3F patch script:', e);
        setPatchStatus('error');
        
        // Terapkan patch darurat jika script gagal dimuat
        if (typeof window !== 'undefined') {
          const customWindow = window as CustomWindow;
          customWindow.ReactCurrentOwner = { current: null };
          
          try {
            const React = require('react');
            // @ts-ignore
            if (!React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) {
              // @ts-ignore
              React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = {};
            }
            // @ts-ignore
            React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner = { current: null };
            
            // @ts-ignore
            if (window.performance && typeof window.performance._updatedFibers === 'undefined') {
              // @ts-ignore
              window.performance._updatedFibers = new Set();
            }
          } catch (e) {
            console.warn('Error applying emergency R3F patches:', e);
          }
        }
      }}
    />
  )
} 
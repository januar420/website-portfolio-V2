"use client"

import Script from "next/script"

export default function AnalyticsScript() {
  return (
    <Script 
      id="gtm-script" 
      strategy="afterInteractive" 
      dangerouslySetInnerHTML={{
        __html: `
        // Google Tag Manager code would go here 
        console.log('Analytics initialized');
        `
      }} 
    />
  )
} 
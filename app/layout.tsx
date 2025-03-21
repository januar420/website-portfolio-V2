import type { Metadata } from "next"
import "./globals.css"
import ClientLayoutWrapper from "./components/client-layout-wrapper"
import ScriptWithErrorHandler from "./components/script-with-error-handler"
import AnalyticsScript from "./components/analytics-script"
import localFont from "next/font/local"
import { fontCacheBuster } from "./utils/cache-buster"

// Gunakan font lokal daripada diunduh dari Google Fonts
const inter = localFont({
  src: [
    {
      path: '../public/fonts/inter-latin-400.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/inter-latin-700.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  display: 'swap',
  fallback: ['Inter Fallback', 'Arial', 'sans-serif'],
  variable: '--font-inter',
  preload: true,    // Font akan dipreload untuk performa lebih baik
  adjustFontFallback: "Arial",  // Menggunakan Arial sebagai fallback sesuai dengan tipe yang diharapkan
})

export const metadata: Metadata = {
  title: "Januar Galuh Prabakti | Portfolio",
  description: "Professional portfolio of Januar Galuh Prabakti - IT & Cybersecurity Specialist",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Buat versi dengan cache buster untuk font CSS
  const fontCssUrl = fontCacheBuster.getVersionedPath('/fonts/inter.css');

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Add meta tags for better WebGL performance */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />

        {/* Prevent GPU throttling in Chrome */}
        <meta httpEquiv="hardware-accelerated" content="true" />

        {/* Hint to browsers about the type of content */}
        <meta name="renderer" content="webkit|ie-comp|ie-stand" />
        
        {/* Add preload link for local font CSS with cache busting */}
        <link rel="preload" href={fontCssUrl} as="style" />
        <link rel="stylesheet" href={fontCssUrl} />
      </head>
      <body className={inter.className}>
        {/* Patch React Three Fiber sebelum komponen lainnya dimuat */}
        <ScriptWithErrorHandler />
        
        <ClientLayoutWrapper>
          {children}
        </ClientLayoutWrapper>

        {/* Analytics */}
        <AnalyticsScript />
      </body>
    </html>
  )
}



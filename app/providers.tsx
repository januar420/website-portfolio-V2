"use client"

import { ReactNode } from "react"
import { I18nProvider } from "@/components/i18n/context"

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <I18nProvider>
      {children}
    </I18nProvider>
  )
} 
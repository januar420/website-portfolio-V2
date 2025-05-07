"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"

// Bahasa yang didukung
export type SupportedLanguage = "id" | "en" | "ja" | "es" | "fr"

// Antarmuka context untuk i18n
interface I18nContextType {
  language: SupportedLanguage
  setLanguage: (lang: SupportedLanguage) => void
  t: (key: string) => string
}

// Nilai default
const defaultContext: I18nContextType = {
  language: "en",
  setLanguage: () => {},
  t: (key) => key
}

// Membuat context
const I18nContext = createContext<I18nContextType>(defaultContext)

// Hook untuk menggunakan i18n
export const useI18n = () => useContext(I18nContext)

// Props untuk provider
interface I18nProviderProps {
  children: ReactNode
  initialLanguage?: SupportedLanguage
}

// Provider komponen
export function I18nProvider({ children, initialLanguage = "en" }: I18nProviderProps) {
  const [language, setLanguage] = useState<SupportedLanguage>(initialLanguage)
  const [translations, setTranslations] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)

  // Memuat file terjemahan sesuai bahasa yang dipilih
  useEffect(() => {
    const loadTranslations = async () => {
      setIsLoading(true)
      try {
        // Dinamis import file terjemahan
        const translationModule = await import(`./locales/${language}.json`)
        setTranslations(translationModule.default)
      } catch (error) {
        console.error(`Failed to load translations for language: ${language}`, error)
        // Fallback ke bahasa Inggris jika gagal
        if (language !== "en") {
          const fallbackModule = await import("./locales/en.json")
          setTranslations(fallbackModule.default)
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadTranslations()
  }, [language])

  // Fungsi terjemahan
  const t = (key: string): string => {
    if (isLoading) return key
    return translations[key] || key
  }

  // Simpan bahasa di localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("preferred-language", language)
    }
  }, [language])

  // Deteksi bahasa dari localStorage saat pertama kali load
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLanguage = localStorage.getItem("preferred-language") as SupportedLanguage | null
      if (savedLanguage && ["en", "id", "ja", "es", "fr"].includes(savedLanguage)) {
        setLanguage(savedLanguage)
      }
    }
  }, [])

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  )
} 
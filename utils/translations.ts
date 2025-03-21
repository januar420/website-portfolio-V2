/**
 * Sistem terjemahan yang diperbarui untuk portfolio website.
 * File ini berisi utilitas untuk mengelola terjemahan dan dapat digunakan
 * untuk mengimpor terjemahan dari file eksternal atau API.
 */

import type { Language, TranslationKeys } from '@/types/translations'

export type TranslationsType = {
  [key in Language]?: { [k in TranslationKeys]?: string }
}

/**
 * Menggabungkan terjemahan dari berbagai sumber.
 * @param sources Array dari objek terjemahan yang akan digabungkan
 * @returns Objek terjemahan gabungan
 */
export function mergeTranslations(...sources: TranslationsType[]): TranslationsType {
  const result: TranslationsType = {}
  
  for (const source of sources) {
    for (const [language, translations] of Object.entries(source)) {
      if (!result[language as Language]) {
        result[language as Language] = {}
      }
      
      result[language as Language] = {
        ...result[language as Language],
        ...translations
      }
    }
  }
  
  return result
}

/**
 * Memuat terjemahan dari JSON. Fungsi ini dapat digunakan untuk memuat
 * terjemahan dari file statis atau dari respons API.
 * @param json Terjemahan dalam format JSON
 * @returns Objek terjemahan yang dapat digunakan
 */
export function loadTranslationsFromJSON(json: any): TranslationsType {
  try {
    return json as TranslationsType
  } catch (error) {
    console.error('Error loading translations from JSON:', error)
    return {}
  }
}

/**
 * Fungsi async untuk memuat terjemahan dari endpoint API
 * @param url URL endpoint API yang menyediakan terjemahan
 * @returns Promise dengan objek terjemahan
 */
export async function fetchTranslations(url: string): Promise<TranslationsType> {
  try {
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch translations: ${response.status}`)
    }
    
    const data = await response.json()
    return loadTranslationsFromJSON(data)
  } catch (error) {
    console.error('Error fetching translations:', error)
    return {}
  }
}

/**
 * Contoh terjemahan tambahan yang dapat digabungkan dengan terjemahan utama
 */
export const additionalTranslations: TranslationsType = {
  id: {
    "contact.title": "Hubungi Saya",
    "contact.subtitle": "Silakan kirim pesan untuk diskusi, kolaborasi, atau pertanyaan.",
    "contact.form.title": "Kirim Pesan",
    "contact.form.description": "Isi formulir di bawah ini untuk mengirim pesan via email atau WhatsApp.",
    "contact.form.name": "Nama",
    "contact.form.email": "Email",
    "contact.form.subject": "Subjek",
    "contact.form.message": "Pesan",
    "contact.form.namePlaceholder": "Nama Anda",
    "contact.form.emailPlaceholder": "email@contoh.com",
    "contact.form.subjectPlaceholder": "Topik pesan Anda",
    "contact.form.messagePlaceholder": "Tulis pesan Anda di sini...",
    "contact.form.emailBtn": "Kirim Langsung",
    "contact.form.sending": "Mengirim...",
    "contact.form.whatsapp": "Kirim via WhatsApp",
    "contact.form.emailClient": "Email Client",
    "contact.form.success": "Pesan terkirim!",
    "contact.form.error": "Gagal mengirim pesan. Silakan coba lagi."
  },
  en: {
    "contact.title": "Contact Me",
    "contact.subtitle": "Please send a message for discussion, collaboration, or inquiries.",
    "contact.form.title": "Send Message",
    "contact.form.description": "Fill out the form below to send a message via email or WhatsApp.",
    "contact.form.name": "Name",
    "contact.form.email": "Email",
    "contact.form.subject": "Subject",
    "contact.form.message": "Message",
    "contact.form.namePlaceholder": "Your Name",
    "contact.form.emailPlaceholder": "email@example.com",
    "contact.form.subjectPlaceholder": "Your message topic",
    "contact.form.messagePlaceholder": "Write your message here...",
    "contact.form.emailBtn": "Send Directly",
    "contact.form.sending": "Sending...",
    "contact.form.whatsapp": "Send via WhatsApp",
    "contact.form.emailClient": "Email Client",
    "contact.form.success": "Message sent!",
    "contact.form.error": "Failed to send message. Please try again."
  }
}; 
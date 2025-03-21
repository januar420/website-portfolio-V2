"use client"

import { useEffect, useState } from 'react'
import emailjs from '@emailjs/browser'

export default function EmailInitializer() {
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (initialized) return

    try {
      console.log('Initializing EmailJS...')
      const publicKey = process.env.NEXT_PUBLIC_EMAILJS_USER_ID

      if (!publicKey) {
        console.error('EmailJS Public Key is missing')
        return
      }

      // Inisialisasi dengan public key
      emailjs.init(publicKey)
      
      setInitialized(true)
      console.log('EmailJS initialized successfully with key:', publicKey)
    } catch (error) {
      console.error('Failed to initialize EmailJS:', error)
    }
  }, [initialized])

  // Komponen ini tidak merender apapun
  return null
} 
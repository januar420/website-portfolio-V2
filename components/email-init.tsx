"use client";

import { useEffect } from 'react';
import { initEmailJS } from '@/utils/email-service';

/**
 * Komponen untuk menginisialisasi EmailJS pada aplikasi
 * Tidak merender apapun, hanya menjalankan inisialisasi
 */
export default function EmailInit() {
  useEffect(() => {
    // Inisialisasi EmailJS hanya pada sisi klien
    initEmailJS();
  }, []);

  return null;
} 
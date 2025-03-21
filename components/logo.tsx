"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"

export default function Logo() {
  return (
    <Link href="/" className="flex items-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative flex items-center"
      >
        <div className="relative w-10 h-10 mr-3 overflow-hidden rounded-full border-2 border-primary/30 shadow-md">
          <Image 
            src="/Photo_Profile_3.jpg" 
            alt="Foto Profil Januar"
            fill
            sizes="40px"
            className="object-cover"
            priority
          />
        </div>
        <div>
          <span className="text-lg font-bold bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent">
            JANUAR
          </span>
          <span className="text-xs block -mt-1 text-foreground/70">GALUH PRABAKTI</span>
        </div>
      </motion.div>
    </Link>
  )
}


"use client"

import Link from "next/link"
import { Facebook, Twitter, Instagram, Linkedin, Github, MapPin, Phone, Mail } from "lucide-react"
import { motion } from "framer-motion"
import DownloadCVButton from "./download-cv-button"
import { useLanguage } from "./language-provider"

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const { t } = useLanguage()

  return (
    <footer className="bg-background/80 backdrop-blur-md border-t border-[hsl(var(--border)_/_0.2)] py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center mb-10">
          <div className="flex items-center mb-6">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary-foreground flex items-center justify-center mr-3">
              <span className="text-lg font-bold text-background">JGP</span>
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent">
                JANUAR
              </span>
              <span className="text-xs block -mt-1 text-foreground/70">GALUH PRABAKTI</span>
            </div>
          </div>
          <div className="h-px w-24 bg-gradient-to-r from-primary/50 to-primary-foreground/50 mb-6"></div>
          <p className="text-foreground/70 max-w-md text-center mb-6">
            Creating innovative IT solutions with a focus on cybersecurity and system administration. Committed to
            continuous learning and professional growth.
          </p>
          <div className="flex space-x-4 mb-8">
            <motion.a
              href="#"
              className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-foreground/70 hover:text-primary hover:bg-primary/20 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Facebook className="h-5 w-5" />
            </motion.a>
            <motion.a
              href="#"
              className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-foreground/70 hover:text-primary hover:bg-primary/20 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Twitter className="h-5 w-5" />
            </motion.a>
            <motion.a
              href="#"
              className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-foreground/70 hover:text-primary hover:bg-primary/20 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Instagram className="h-5 w-5" />
            </motion.a>
            <motion.a
              href="#"
              className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-foreground/70 hover:text-primary hover:bg-primary/20 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Linkedin className="h-5 w-5" />
            </motion.a>
            <motion.a
              href="#"
              className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-foreground/70 hover:text-primary hover:bg-primary/20 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Github className="h-5 w-5" />
            </motion.a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <div className="w-4 h-0.5 bg-primary/50 mr-2"></div>
              {t("services.title")}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-foreground/70 hover:text-primary transition-colors">
                  Linux Administration
                </Link>
              </li>
              <li>
                <Link href="#" className="text-foreground/70 hover:text-primary transition-colors">
                  System Security
                </Link>
              </li>
              <li>
                <Link href="#" className="text-foreground/70 hover:text-primary transition-colors">
                  Virtualization
                </Link>
              </li>
              <li>
                <Link href="#" className="text-foreground/70 hover:text-primary transition-colors">
                  IT Consulting
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <div className="w-4 h-0.5 bg-primary/50 mr-2"></div>
              {t("certifications.quickLinks")}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-foreground/70 hover:text-primary transition-colors">
                  {t("nav.home")}
                </Link>
              </li>
              <li>
                <Link href="/#services" className="text-foreground/70 hover:text-primary transition-colors">
                  {t("nav.services")}
                </Link>
              </li>
              <li>
                <Link href="/#portfolio" className="text-foreground/70 hover:text-primary transition-colors">
                  {t("nav.portfolio")}
                </Link>
              </li>
              <li>
                <Link href="/#certifications" className="text-foreground/70 hover:text-primary transition-colors">
                  {t("nav.certifications")}
                </Link>
              </li>
              <li>
                <Link href="/resume" className="text-foreground/70 hover:text-primary transition-colors">
                  {t("nav.resume")}
                </Link>
              </li>
              <li>
                <Link href="/#contact" className="text-foreground/70 hover:text-primary transition-colors">
                  {t("nav.contact")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <div className="w-4 h-0.5 bg-primary/50 mr-2"></div>
              {t("contact.title")}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center text-foreground/70">
                <MapPin className="h-4 w-4 mr-2 text-primary" />
                Bekasi, Indonesia
              </li>
              <li className="flex items-center text-foreground/70">
                <Phone className="h-4 w-4 mr-2 text-primary" />
                081290040769
              </li>
              <li className="flex items-center text-foreground/70">
                <Mail className="h-4 w-4 mr-2 text-primary" />
                januargaluh3099@gmail.com
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[hsl(var(--border)_/_0.2)] pt-8 text-center">
          <div className="flex justify-center mb-4">
            <DownloadCVButton variant="outline" className="rounded-full text-sm" />
          </div>
          <p className="text-foreground/60">© {currentYear} Januar Galuh Prabakti. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}


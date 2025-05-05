"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLanguage } from "./language-provider";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

// Interface untuk props
interface HeroSectionFallbackProps {
  mainHeadingText?: string;
}

export default function HeroSectionFallback({ mainHeadingText = "IT & Cyber Security Enthusiast" }: HeroSectionFallbackProps) {
  const { language, t } = useLanguage();

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 to-background z-0"></div>
      
      <div className="grid w-full max-w-6xl z-10 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-4"
        >
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            {t("hero.title") || mainHeadingText}
          </h1>
          
          <p className="text-xl md:text-2xl text-foreground/70 max-w-3xl mx-auto">
            {t("hero.subtitle") || "Fullstack Developer & UI/UX Designer"}
          </p>
          
          <div className="flex flex-wrap gap-3 justify-center mt-6">
            <Button asChild size="lg" className="gap-2">
              <Link href="/resume">
                {language === "en" ? "View Resume" : "Lihat Resume"} <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="#contact">
                {language === "en" ? "Contact Me" : "Hubungi Saya"}
              </a>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 
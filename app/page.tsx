import { Suspense } from "react"
import LoadingScreen from "@/components/loading-screen"

// Import client components yang menangani dynamic imports
import ClientHeroSection from "./components/client-hero-section"
import ClientSkillsChart from "./components/client-skills-chart"

// Regular imports for non-WebGL components
import ServicesSection from "@/components/services-section"
import PortfolioSection from "@/components/portfolio-section"
import CertificationSection from "@/components/certification-section"
import ContactSection from "@/components/contact-section"
import PremiumTestimonials from "@/components/premium-testimonials"
import PremiumAchievements from "@/components/premium-achievements"

// Mengubah judul yang ditampilkan pada section utama
export const mainHeadingText = "IT & Cyber Security Enthusiast"

// Halaman utama aplikasi
export default function Home() {
  return (
    <>
      <Suspense fallback={<LoadingScreen />}>
        <ClientHeroSection />
      </Suspense>
      <ServicesSection />
      <PortfolioSection />
      <CertificationSection />
      <Suspense fallback={<div className="h-screen flex items-center justify-center">Loading Skills...</div>}>
        <ClientSkillsChart />
      </Suspense>
      <PremiumAchievements />
      <PremiumTestimonials />
      <ContactSection />
    </>
  )
}


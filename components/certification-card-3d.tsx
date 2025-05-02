"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, FileText, Calendar, Award } from "lucide-react"
import { useLanguage } from "./language-provider"

interface CertificationCardProps {
  id: string
  title: string
  image: string
  issuedBy: string
  date: string
  category: string
  tags: string[]
  description: string
  onView: () => void
}

export default function CertificationCard3D({
  id,
  title,
  image,
  issuedBy,
  date,
  category,
  tags,
  description,
  onView
}: CertificationCardProps) {
  const { t } = useLanguage()
  const [isHovered, setIsHovered] = useState(false)
  
  // Untuk efek tilt
  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    // Kalkulasi rotasi berdasarkan posisi kursor
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    
    // Konversi ke rentang -15 sampai 15 derajat
    const rotX = ((y - centerY) / centerY) * -10
    const rotY = ((x - centerX) / centerX) * 10
    
    setRotateX(rotX)
    setRotateY(rotY)
  }
  
  const resetRotation = () => {
    setRotateX(0)
    setRotateY(0)
  }

  return (
    <motion.div
      className="group relative overflow-hidden rounded-xl glassmorphism-3d shadow-md hover:shadow-xl transition-all duration-500"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        setIsHovered(false)
        resetRotation()
      }}
      onMouseEnter={() => setIsHovered(true)}
      style={{
        perspective: "1000px",
        transformStyle: "preserve-3d"
      }}
    >
      <motion.div
        className="h-full w-full"
        style={{
          rotateX: rotateX,
          rotateY: rotateY,
          transformStyle: "preserve-3d",
          transition: "all 0.2s ease-out"
        }}
      >
        {/* Latar belakang dengan efek glassmorphism saat hover */}
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-primary/10 via-transparent to-primary-foreground/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 z-0 bg-grid-pattern opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
        
        {/* Gambar sertifikasi */}
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-all duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {/* Overlay transparan dengan efek glassmorphism */}
          <div className="absolute inset-0 bg-background/10 backdrop-blur-[2px] group-hover:backdrop-blur-[1px] transition-all duration-300" />
          
          {/* Badge kategori */}
          <Badge className="absolute top-4 right-4 glassmorphism text-foreground border-none">
            {category}
          </Badge>
        </div>
        
        {/* Konten sertifikasi */}
        <div className="p-5 backdrop-blur-[2px]">
          <h3 className="font-bold text-xl mb-2 line-clamp-2 group-hover:text-primary transition-colors duration-300">{title}</h3>
          
          <div className="flex items-center gap-1 text-muted-foreground text-sm mb-3">
            <Award className="h-4 w-4 text-primary/70" />
            <span>{issuedBy}</span>
          </div>
          
          <div className="flex items-center gap-1 text-muted-foreground text-sm mb-4">
            <Calendar className="h-4 w-4 text-primary/70" />
            <span>{date}</span>
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {description}
          </p>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs glassmorphism-dark">
                {tag}
              </Badge>
            ))}
            {tags.length > 3 && (
              <Badge variant="outline" className="text-xs glassmorphism-dark">
                {t("portfolio.moreTags").replace("{0}", String(tags.length - 3))}
              </Badge>
            )}
          </div>
          
          {/* Action buttons */}
          <div className="flex items-center justify-between gap-2 mt-auto">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 gap-1 font-medium glassmorphism border-primary/20 hover:border-primary/40 transition-all duration-300"
              onClick={(e) => {
                e.stopPropagation()
                onView()
              }}
            >
              <Eye className="h-4 w-4" />
              {t("certifications.viewDetails")}
            </Button>
            
            <Button
              size="sm"
              variant="default"
              className="flex-none aspect-square p-0 glassmorphism-dark hover:bg-primary/20 transition-all duration-300"
              onClick={(e) => {
                e.stopPropagation()
                onView()
              }}
            >
              <FileText className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Efek glint/shine saat hover */}
        <motion.div
          className="absolute inset-0 opacity-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
          style={{
            opacity: isHovered ? 0.5 : 0,
            left: isHovered ? "100%" : "-100%"
          }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </motion.div>
    </motion.div>
  )
} 
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { generateResumePDF } from "@/utils/generate-pdf"
import { motion } from "framer-motion"
import { toast } from "@/hooks/use-toast"

interface DownloadCVButtonProps {
  variant?: "default" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export default function DownloadCVButton({
  variant = "default",
  size = "default",
  className = "",
}: DownloadCVButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      await generateResumePDF()
      toast({
        title: "Success!",
        description: "Your CV has been downloaded successfully",
      })
    } catch (error) {
      console.error("Error downloading CV:", error)
      toast({
        title: "Error",
        description: "Failed to download CV. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Button
        variant={variant}
        size={size}
        className={`relative overflow-hidden cursor-button ${className}`}
        onClick={handleDownload}
        disabled={isDownloading}
      >
        {isHovered && (
          <motion.div
            className="absolute inset-0 bg-primary/10"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1, ease: "linear" }}
          />
        )}

        {isDownloading ? (
          <>
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
            Downloading...
          </>
        ) : (
          <>
            <Download className="mr-2 h-4 w-4" />
            Download CV
          </>
        )}
      </Button>
    </motion.div>
  )
}


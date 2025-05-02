"use client"

import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Terminal, ShieldCheck, Lock, Server, Code } from "lucide-react"

interface LoadingScreenProps {
  message?: string
}

export default function LoadingScreen({ message }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0)
  const [currentText, setCurrentText] = useState("")
  const [textIndex, setTextIndex] = useState(0)
  const [commandComplete, setCommandComplete] = useState(false)
  const terminalRef = useRef<HTMLDivElement>(null)

  // Terminal-style loading messages - Linux/cybersecurity themed
  const terminalTexts = [
    "Initializing secure environment...",
    "Loading kernel modules...",
    "Establishing encrypted connection...",
    "Running system diagnostics...",
    "Scanning for vulnerabilities...",
    "Setting up firewall rules...",
    "Mounting virtual filesystems...",
    "Configuring network interfaces...",
    "Verifying digital signatures...",
    "Optimizing system performance..."
  ]

  const securityIcons = [ShieldCheck, Lock, Terminal, Server, Code]
  const [currentIcon, setCurrentIcon] = useState(0)

  // Terminal typing effect
  useEffect(() => {
    if (textIndex >= terminalTexts.length) return
    
    let currentCommand = terminalTexts[textIndex]
    let charIndex = 0
    let typingInterval: NodeJS.Timeout

    const typeNextChar = () => {
      if (charIndex <= currentCommand.length) {
        setCurrentText(currentCommand.substring(0, charIndex))
        charIndex++
      } else {
        clearInterval(typingInterval)
        setTimeout(() => {
          setCommandComplete(true)
          setTimeout(() => {
            setCommandComplete(false)
            setTextIndex(prev => prev + 1)
            // Rotate icon
            setCurrentIcon(prev => (prev + 1) % securityIcons.length)
          }, 500)
        }, 300)
      }
    }

    typingInterval = setInterval(typeNextChar, 30 + Math.random() * 40)

    return () => clearInterval(typingInterval)
  }, [textIndex])

  // Auto scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [currentText])

  // Progress bar effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(100)
    }, 3500)

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + 0.5
      })
    }, 20)

    return () => {
      clearTimeout(timer)
      clearInterval(progressInterval)
    }
  }, [])

  // Random binary background effect (0s and 1s falling)
  const BinaryBackground = () => {
    const binaryDigits = Array.from({ length: 50 }).map((_, i) => ({
      value: Math.random() > 0.5 ? "0" : "1",
      x: Math.random() * 100,
      y: -(Math.random() * 100),
      speed: 0.5 + Math.random() * 2,
      opacity: 0.1 + Math.random() * 0.15,
      id: i
    }))

    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {binaryDigits.map(digit => (
          <motion.div
            key={digit.id}
            className="absolute text-primary/20 font-mono text-xs md:text-sm"
            initial={{ x: `${digit.x}%`, y: `${digit.y}%`, opacity: 0 }}
            animate={{ 
              y: ["0%", "100%"], 
              opacity: [0, digit.opacity, 0]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: digit.speed * 10, 
              repeatType: "loop",
              delay: Math.random() * 5,
              ease: "linear"
            }}
          >
            {digit.value}
          </motion.div>
        ))}
      </div>
    )
  }

  // Dynamic Icon Component
  const IconComponent = securityIcons[currentIcon]

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm">
      <BinaryBackground />
      
      <div className="max-w-md w-full px-6 relative">
        {/* Logo pulse effect */}
        <div className="absolute -top-20 left-1/2 transform -translate-x-1/2">
          <motion.div 
            className="relative"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div 
              className="absolute inset-0 rounded-full bg-primary/30"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.1, 0.3]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut" 
              }}
            />
            <div className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20">
              <IconComponent className="h-8 w-8 text-white" />
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 pt-12"
        >
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-foreground">
            JGP
          </h1>
          <p className="text-foreground/70 mt-2">
            {message || "Linux & Cybersecurity Expert"}
          </p>
        </motion.div>

        {/* Terminal window */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="w-full rounded-md border border-primary/20 bg-black/80 text-green-400 font-mono text-sm mb-6 overflow-hidden"
        >
          <div className="h-6 bg-gray-800/80 flex items-center px-3 gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
            <div className="text-center w-full text-xs text-gray-400 mr-8">terminal@jgp-system</div>
          </div>
          <div 
            ref={terminalRef}
            className="p-3 h-24 overflow-y-auto custom-scrollbar"
          >
            <div className="space-y-1">
              {terminalTexts.slice(0, textIndex).map((text, i) => (
                <div key={i} className="flex">
                  <span className="text-primary-foreground mr-2">$</span>
                  <span>{text}</span>
                  <span className="text-green-400 ml-2">✓</span>
                </div>
              ))}
              
              {textIndex < terminalTexts.length && (
                <div className="flex">
                  <span className="text-primary-foreground mr-2">$</span>
                  <span>{currentText}</span>
                  {commandComplete ? (
                    <span className="text-green-400 ml-2">✓</span>
                  ) : (
                    <motion.span 
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                      className="ml-0.5 inline-block w-2 h-4 bg-green-400"
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Progress bar with glowing effect */}
        <div className="relative">
          <div className="h-1.5 w-full bg-foreground/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary via-primary-foreground to-primary"
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
              style={{
                boxShadow: "0 0 10px rgba(var(--primary-rgb), 0.7)"
              }}
            />
          </div>
          <motion.div
            className="w-2 h-2 rounded-full bg-primary-foreground absolute top-1/2 -translate-y-1/2"
            initial={{ left: "0%" }}
            animate={{ left: `${progress}%` }}
            transition={{ duration: 0.5 }}
            style={{
              boxShadow: "0 0 10px rgba(var(--primary-rgb), 0.9)"
            }}
          />
        </div>

        <div className="mt-4 flex justify-between items-center text-sm">
          <div className="text-foreground/50 flex items-center">
            <Terminal className="h-3.5 w-3.5 mr-1.5" />
            <span>Secure loading...</span>
          </div>
          <motion.span 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-primary-foreground font-bold"
          >
            {Math.round(progress)}%
          </motion.span>
        </div>
      </div>
    </div>
  )
}


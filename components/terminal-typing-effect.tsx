"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useI18n } from "./i18n/context"
import LanguageSelector from "./language-selector"

interface TerminalTypingEffectProps {
  className?: string
  onComplete?: () => void
  commands?: string[]
  typingSpeed?: number 
  showPrompt?: boolean
  prompt?: string
  autoStart?: boolean
  loop?: boolean
  showLanguageSelector?: boolean
}

export default function TerminalTypingEffect({
  className = "",
  onComplete,
  commands,
  typingSpeed = 50,
  showPrompt = true,
  prompt = "visitor@portfolio:~$ ",
  autoStart = true,
  loop = false,
  showLanguageSelector = false
}: TerminalTypingEffectProps) {
  const { t } = useI18n()
  const [commandIndex, setCommandIndex] = useState(0)
  const [typedText, setTypedText] = useState("")
  const [isTyping, setIsTyping] = useState(autoStart)
  const [showCursor, setShowCursor] = useState(true)
  const [isPaused, setIsPaused] = useState(false)
  
  // Default commands dengan terjemahan
  const defaultCommands = [
    "uname -a",
    "Portfolio Linux 5.15.0-JGP #1 SMP PREEMPT Portfolio 2023",
    "cd ~/portfolio",
    "ls",
    t("terminal.ls.output"),
    "cat about.md | head -n 3",
    "# Januar Galuh Prabakti\n# IT & Cyber Security Enthusiast\n# Linux System Administrator",
    "./show-skills.sh",
    `${t("terminal.loading")}\n${t("terminal.skills.title")}`,
  ]
  
  // Gunakan commands dari props atau default commands
  const effectiveCommands = commands || defaultCommands
  
  // Blinking cursor effect
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor(prev => !prev)
    }, 500)
    
    return () => clearInterval(interval)
  }, [])
  
  // Typing effect
  useEffect(() => {
    if (!isTyping || isPaused) return
    
    const command = effectiveCommands[commandIndex]
    
    if (!command) {
      setIsTyping(false)
      onComplete?.()
      if (loop) {
        setTimeout(() => {
          setCommandIndex(0)
          setTypedText("")
          setIsTyping(true)
        }, 1000)
      }
      return
    }
    
    const isOutput = commandIndex % 2 !== 0
    
    // For command typing (every even index)
    if (!isOutput) {
      if (typedText.length < command.length) {
        const timer = setTimeout(() => {
          setTypedText(command.substring(0, typedText.length + 1))
        }, typingSpeed)
        return () => clearTimeout(timer)
      } else {
        // When command is fully typed, pause briefly then show output
        const timer = setTimeout(() => {
          setCommandIndex(prev => prev + 1)
          setTypedText("")
        }, 500)
        return () => clearTimeout(timer)
      }
    } 
    // For output display (every odd index)
    else {
      if (typedText.length < command.length) {
        const timer = setTimeout(() => {
          setTypedText(command.substring(0, typedText.length + 1))
        }, typingSpeed / 3) // Output displays faster than typing
        return () => clearTimeout(timer)
      } else {
        // When output is fully displayed, pause then move to next command
        const timer = setTimeout(() => {
          setCommandIndex(prev => prev + 1)
          setTypedText("")
        }, 1000)
        return () => clearTimeout(timer)
      }
    }
  }, [isTyping, isPaused, typedText, commandIndex, effectiveCommands, onComplete, typingSpeed, loop])
  
  // Update effect when language changes
  useEffect(() => {
    // Jika commands tidak diberikan melalui props, perbarui commands default
    if (!commands && commandIndex < effectiveCommands.length) {
      if (commandIndex === 4) { // ls output
        const updatedCommands = [...effectiveCommands]
        updatedCommands[4] = t("terminal.ls.output")
        // Jika sedang menampilkan output ls, perbarui tampilan
        if (commandIndex === 4 && typedText.length > 0) {
          setTypedText(t("terminal.ls.output").substring(0, typedText.length))
        }
      } else if (commandIndex === 8) { // skills loading
        const updatedCommands = [...effectiveCommands]
        updatedCommands[8] = `${t("terminal.loading")}\n${t("terminal.skills.title")}`
        // Jika sedang menampilkan skills, perbarui tampilan
        if (commandIndex === 8 && typedText.length > 0) {
          setTypedText(`${t("terminal.loading")}\n${t("terminal.skills.title")}`.substring(0, typedText.length))
        }
      }
    }
  }, [t, commands, commandIndex, effectiveCommands, typedText])
  
  // Render the terminal with typed content
  return (
    <div 
      className={`font-mono text-sm bg-zinc-900/95 text-green-500 p-4 rounded-lg border border-zinc-700/50 relative ${className}`}
      onClick={() => setIsTyping(true)}
    >
      {showLanguageSelector && (
        <div className="absolute top-2 right-2 z-10">
          <LanguageSelector variant="terminal" compact={true} />
        </div>
      )}
      
      <div className="space-y-2">
        {/* Previous commands and outputs */}
        {Array.from({ length: commandIndex }).map((_, index) => {
          const isCmd = index % 2 === 0
          const text = effectiveCommands[index]
          
          return (
            <div key={index} className="pb-2">
              {isCmd && showPrompt && (
                <span className="text-cyan-500">{prompt}</span>
              )}
              <span className={isCmd ? "text-white" : "text-green-400"}>
                {text || ""}
              </span>
            </div>
          )
        })}
        
        {/* Current line being typed */}
        <div>
          {commandIndex % 2 === 0 && showPrompt && (
            <span className="text-cyan-500">{prompt}</span>
          )}
          <span className={commandIndex % 2 === 0 ? "text-white" : "text-green-400"}>
            {typedText}
          </span>
          <span className={`inline-block w-2 h-4 bg-white ml-0.5 ${showCursor ? 'opacity-100' : 'opacity-0'}`}></span>
        </div>
      </div>
      
      {!isTyping && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 text-center"
        >
          <button 
            onClick={() => {
              setCommandIndex(0)
              setTypedText("")
              setIsTyping(true)
            }}
            className="bg-zinc-800 text-green-500 px-3 py-1 rounded-md text-xs hover:bg-zinc-700 transition-colors"
          >
            ↻ Replay Demo
          </button>
        </motion.div>
      )}
    </div>
  )
} 
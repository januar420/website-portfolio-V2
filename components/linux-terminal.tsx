"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Terminal as TerminalIcon, Maximize2, Minimize2, X, ChevronRight, ChevronsRight, Copy, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useI18n } from "./i18n/context"
import LanguageSelector from "./language-selector"

interface TerminalProps {
  className?: string
  showGlowEffect?: boolean
  initiallyOpen?: boolean
  compact?: boolean
}

export default function LinuxTerminal({ 
  className = "", 
  showGlowEffect = true,
  initiallyOpen = true,
  compact = false
}: TerminalProps) {
  const { t } = useI18n()
  const [isOpen, setIsOpen] = useState(initiallyOpen)
  const [isMaximized, setIsMaximized] = useState(false)
  const [currentCommand, setCurrentCommand] = useState("")
  const [history, setHistory] = useState<string[]>([])
  const [output, setOutput] = useState<{command: string, response: string, isError?: boolean}[]>([
    { 
      command: "", 
      response: t("terminal.welcome")
    }
  ])
  const [currentDirectory, setCurrentDirectory] = useState("~/portfolio")
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [isCopied, setIsCopied] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [typingText, setTypingText] = useState("")
  const [showCursor, setShowCursor] = useState(true)
  const terminalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Efek kedip kursor
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev)
    }, 500)
    return () => clearInterval(cursorInterval)
  }, [])

  // Auto focus pada input saat terminal terbuka
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Auto scroll ke bawah ketika output diperbarui
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [output, typingText])

  // Update terminal output ketika bahasa berubah
  useEffect(() => {
    // Perbarui welcome message
    if (output.length > 0 && output[0].command === "") {
      const updatedOutput = [...output]
      updatedOutput[0].response = t("terminal.welcome")
      setOutput(updatedOutput)
    }
  }, [t])

  // Efek mengetik untuk simulasi respons terminal
  useEffect(() => {
    if (isTyping && typingText.length > 0) {
      const typeNextChar = () => {
        const nextOutput = [...output]
        const last = nextOutput[nextOutput.length - 1]
        
        if (last) {
          const nextChar = typingText.charAt(last.response.length)
          last.response += nextChar
          setOutput(nextOutput)
          
          if (last.response.length < typingText.length) {
            const speed = Math.random() * 30 + 10 // Random typing speed between 10-40ms
            setTimeout(typeNextChar, speed)
          } else {
            setIsTyping(false)
            setTypingText("")
          }
        }
      }
      
      setTimeout(typeNextChar, 20)
    }
  }, [isTyping, typingText, output])

  const handleRun = () => {
    if (!currentCommand.trim()) return
    
    // Tambahkan perintah ke history
    setHistory(prev => [...prev, currentCommand])
    setHistoryIndex(-1)
    
    // Proses perintah
    processCommand(currentCommand)
    
    // Reset input field
    setCurrentCommand("")
  }

  const processCommand = (cmd: string) => {
    const commandLower = cmd.toLowerCase().trim()
    const args = commandLower.split(" ")
    const mainCommand = args[0]
    
    // Tambahkan perintah ke output terlebih dahulu
    const newOutputEntry = { command: cmd, response: "" }
    setOutput(prev => [...prev, newOutputEntry])
    
    // Simulasi pengetikan terminal
    setIsTyping(true)
    
    // Proses perintah-perintah yang tersedia
    switch (mainCommand) {
      case "help":
        setTypingText(t("terminal.help"))
        break
        
      case "about":
        setTypingText(
          " ▄▄▄██▀▀▀▄▄▄      ███▄    █  █    ██  ▄▄▄       ██▀███      ▄████  ██▓███  \n" +
          "   ▒██  ▒████▄    ██ ▀█   █  ██  ▓██▒▒████▄    ▓██ ▒ ██▒   ██▒ ▀█▒▓██░  ██▒\n" +
          "   ░██  ▒██  ▀█▄ ▓██  ▀█ ██▒▓██  ▒██░▒██  ▀█▄  ▓██ ░▄█ ▒  ▒██░▄▄▄░▓██░ ██▓▒\n" +
          "▓██▄██▓ ░██▄▄▄▄██▓██▒  ▐▌██▒▓▓█  ░██░░██▄▄▄▄██ ▒██▀▀█▄    ░▓█  ██▓▒██▄█▓▒ ▒\n" +
          "▓███▒   ▓█   ▓██▒██░   ▓██░▒▒█████▓  ▓█   ▓██▒░██▓ ▒██▒  ░▒▓███▀▒▒██▒ ░  ░\n" +
          "▒▓▒▒░   ▒▒   ▓▒█░ ▒░   ▒ ▒ ░▒▓▒ ▒ ▒  ▒▒   ▓▒█░░ ▒▓ ░▒▓░   ░▒   ▒ ▒▓▒░ ░  ░\n\n" +
          t("terminal.about.title")
        )
        break
        
      case "skills":
        setTypingText(
          `${t("terminal.skills.title")}\n` +
          "┌─────────────────────┬───────────────────────────────────────────┐\n" +
          "│ Linux               │ ████████████████████████░░░░░ 80%         │\n" +
          "│ System Admin        │ ███████████████████░░░░░░░░░░ 65%         │\n" +
          "│ Network Security    │ ██████████████████░░░░░░░░░░ 60%         │\n" +
          "│ IT Support          │ ███████████████████████░░░░░ 75%         │\n" +
          "│ Virtualization      │ █████████████████░░░░░░░░░░░ 55%         │\n" +
          "│ Bash Scripting      │ ████████████████░░░░░░░░░░░░ 50%         │\n" +
          "│ Windows             │ █████████████████████████░░░ 85%         │\n" +
          "└─────────────────────┴───────────────────────────────────────────┘\n\n" +
          `${t("terminal.skills.additional")}\n` +
          "┌─────────────────────┬───────────────────────────────────────────┐\n" +
          "│ Technical Writing   │ ███████████████████░░░░░░░░░ 65%         │\n" +
          "│ Documentation       │ ██████████████████████░░░░░░ 70%         │\n" +
          "│ Hardware Support    │ ████████████████████░░░░░░░░ 65%         │\n" +
          "│ Troubleshooting     │ ██████████████████████████░░ 85%         │\n" +
          "└─────────────────────┴───────────────────────────────────────────┘"
        )
        break
        
      case "experience":
        setTypingText(
          `${t("terminal.experience.title")}\n\n` +
          `[2022 - Present] ${t("terminal.experience.freelance")}\n` +
          `   ├─ ${t("terminal.experience.freelance.desc1")}\n` +
          `   ├─ ${t("terminal.experience.freelance.desc2")}\n` +
          `   ├─ ${t("terminal.experience.freelance.desc3")}\n` +
          `   └─ ${t("terminal.experience.freelance.desc4")}\n\n` +
          `[2019 - 2022] ${t("terminal.experience.notaris")}\n` +
          `   ├─ ${t("terminal.experience.notaris.position")}\n` +
          `   ├─ ${t("terminal.experience.notaris.desc1")}\n` +
          `   ├─ ${t("terminal.experience.notaris.desc2")}\n` +
          `   └─ ${t("terminal.experience.notaris.desc3")}\n\n` +
          `[2018 - 2019] ${t("terminal.experience.dcika")}\n` +
          `   ├─ ${t("terminal.experience.dcika.position")}\n` +
          `   ├─ ${t("terminal.experience.dcika.desc1")}\n` +
          `   └─ ${t("terminal.experience.dcika.desc2")}`
        )
        break
        
      case "education":
        setTypingText(
          `${t("terminal.education.title")}\n\n` +
          `[2015 - 2018] ${t("terminal.education.sma")}\n` +
          `   └─ ${t("terminal.education.sma.desc")}\n\n` +
          `[2012 - 2015] ${t("terminal.education.smp")}\n` +
          `   └─ ${t("terminal.education.smp.desc")}\n\n` +
          `[2006 - 2012] ${t("terminal.education.sd")}\n` +
          `   └─ ${t("terminal.education.sd.desc")}`
        )
        break
        
      case "projects":
        setTypingText(
          `${t("terminal.projects.title")}\n\n` +
          `[2023] ${t("terminal.projects.network")}\n` +
          `   ├─ ${t("terminal.projects.network.tech")}\n` +
          `   └─ ${t("terminal.projects.network.desc")}\n\n` +
          `[2023] ${t("terminal.projects.automation")}\n` +
          `   ├─ ${t("terminal.projects.automation.tech")}\n` +
          `   └─ ${t("terminal.projects.automation.desc")}\n\n` +
          `[2022] ${t("terminal.projects.server")}\n` +
          `   ├─ ${t("terminal.projects.server.tech")}\n` +
          `   └─ ${t("terminal.projects.server.desc")}`
        )
        break
        
      case "certifications":
        setTypingText(
          `${t("terminal.certifications.title")}\n\n` +
          `${t("terminal.certifications.cnsp")}\n` +
          `   ├─ ${t("terminal.certifications.cnsp.issuer")}\n` +
          `   └─ ${t("terminal.common.date")}: 2025\n\n` +
          `${t("terminal.certifications.cc")}\n` +
          `   ├─ ${t("terminal.certifications.cc.issuer")}\n` +
          `   └─ ${t("terminal.common.date")}: 2025\n\n` +
          `${t("terminal.certifications.secops")}\n` +
          `   ├─ ${t("terminal.certifications.secops.issuer")}\n` +
          `   └─ ${t("terminal.common.date")}: 2024\n\n` +
          `${t("terminal.certifications.network")}\n` +
          `   ├─ ${t("terminal.certifications.network.issuer")}\n` +
          `   └─ ${t("terminal.common.date")}: 2024\n\n` +
          `${t("terminal.certifications.access")}\n` +
          `   ├─ ${t("terminal.certifications.access.issuer")}\n` +
          `   └─ ${t("terminal.common.date")}: 2024\n\n` +
          `${t("terminal.certifications.incident")}\n` +
          `   ├─ ${t("terminal.certifications.incident.issuer")}\n` +
          `   └─ ${t("terminal.common.date")}: 2023\n\n` +
          `${t("terminal.certifications.principles")}\n` +
          `   ├─ ${t("terminal.certifications.principles.issuer")}\n` +
          `   └─ ${t("terminal.common.date")}: 2023`
        )
        break
        
      case "contact":
        setTypingText(
          `${t("terminal.contact.title")}\n\n` +
          `${t("terminal.contact.email")}\n` +
          `${t("terminal.contact.linkedin")}\n` +
          `${t("terminal.contact.location")}\n\n` +
          `${t("terminal.contact.note")}`
        )
        break
        
      case "clear":
        setOutput([])
        return
        
      case "date":
        setTypingText(new Date().toString())
        break
        
      case "whoami":
        setTypingText("visitor@portfolio")
        break
        
      case "ls":
        setTypingText(t("terminal.ls.output"))
        break
        
      case "pwd":
        setTypingText(currentDirectory)
        break
        
      case "echo":
        const echoText = cmd.slice(5) // Remove "echo " from the command
        setTypingText(echoText || "")
        break
        
      case "uname":
        if (args.includes("-a")) {
          setTypingText("Portfolio Linux 5.15.0-JGP #1 SMP PREEMPT Portfolio 2023")
        } else {
          setTypingText("Portfolio")
        }
        break
        
      case "exit":
        setIsOpen(false)
        break
        
      default:
        setTypingText(t("terminal.command.notfound").replace("{0}", cmd))
        // Tandai sebagai error
        const lastOutput = [...output]
        if (lastOutput.length > 0) {
          lastOutput[lastOutput.length - 1].isError = true
          setOutput(lastOutput)
        }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleRun()
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      if (history.length > 0 && historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1
        setHistoryIndex(newIndex)
        setCurrentCommand(history[history.length - 1 - newIndex])
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1
        setHistoryIndex(newIndex)
        setCurrentCommand(history[history.length - 1 - newIndex])
      } else if (historyIndex === 0) {
        setHistoryIndex(-1)
        setCurrentCommand("")
      }
    } else if (e.key === "Tab") {
      e.preventDefault()
      // Simple command completion
      const commands = ["help", "about", "skills", "experience", "education", "projects", 
                        "certifications", "contact", "clear", "date", "whoami", "ls", "pwd", 
                        "echo", "uname", "exit"]
      
      if (currentCommand) {
        const match = commands.find(cmd => cmd.startsWith(currentCommand))
        if (match) {
          setCurrentCommand(match)
        }
      }
    } else if (e.ctrlKey && e.key === "l") {
      e.preventDefault()
      setOutput([])
    } else if (e.ctrlKey && e.key === "c") {
      e.preventDefault()
      const cancelled = { command: currentCommand, response: "^C", isError: true }
      setOutput(prev => [...prev, cancelled])
      setCurrentCommand("")
    }
  }

  const copyToClipboard = () => {
    const text = output.map(entry => {
      const prompt = entry.command ? `${currentDirectory}$ ${entry.command}` : "";
      return `${prompt}\n${entry.response}`.trim();
    }).join('\n\n');
    
    navigator.clipboard.writeText(text)
      .then(() => {
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
      })
      .catch(err => console.error('Failed to copy text: ', err))
  }

  // Jika terminal ditutup, tampilkan hanya ikon untuk membukanya kembali
  if (!isOpen) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`fixed bottom-6 right-6 z-50 ${className}`}
      >
        <Button 
          onClick={() => setIsOpen(true)}
          className="rounded-full h-14 w-14 bg-zinc-800/90 text-zinc-200 hover:bg-zinc-700 hover:text-white shadow-lg backdrop-blur-md border border-zinc-700"
        >
          <TerminalIcon className="h-6 w-6" />
        </Button>
      </motion.div>
    )
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className={`${isMaximized ? 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70' : 'relative'} ${className}`}
      >
        <motion.div 
          className={`${isMaximized ? 'w-full max-w-5xl h-[80vh]' : compact ? 'w-full h-[50vh]' : 'w-full h-[70vh]'} 
                     bg-zinc-900/95 rounded-lg border border-zinc-700/50 overflow-hidden shadow-xl backdrop-blur-md 
                     flex flex-col ${showGlowEffect ? 'glow-terminal' : ''}`}
          style={{
            boxShadow: showGlowEffect ? '0 0 15px rgba(74, 222, 128, 0.15), 0 0 5px rgba(74, 222, 128, 0.1)' : undefined
          }}
          layout
        >
          {/* Terminal Header */}
          <div className="bg-zinc-800/95 border-b border-zinc-700/50 h-10 flex items-center justify-between px-4 drag-handle">
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 rounded-full bg-red-500 cursor-pointer" onClick={() => setIsOpen(false)}></div>
              <div className="h-3 w-3 rounded-full bg-yellow-500 cursor-pointer" onClick={() => {}}></div>
              <div className="h-3 w-3 rounded-full bg-green-500 cursor-pointer" onClick={() => {}}></div>
            </div>
            
            <div className="flex items-center text-xs font-mono text-gray-400">
              visitor@portfolio: ~{currentDirectory.replace('~', '')}
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Language Selector */}
              <LanguageSelector variant="terminal" compact={true} />
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 flex items-center justify-center" onClick={copyToClipboard}>
                      {isCopied ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4 text-gray-400 hover:text-gray-300" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>{isCopied ? 'Copied!' : 'Copy terminal output'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 flex items-center justify-center" onClick={() => setIsMaximized(!isMaximized)}>
                {isMaximized ? (
                  <Minimize2 className="h-4 w-4 text-gray-400 hover:text-gray-300" />
                ) : (
                  <Maximize2 className="h-4 w-4 text-gray-400 hover:text-gray-300" />
                )}
              </Button>
              
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 flex items-center justify-center" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4 text-gray-400 hover:text-gray-300" />
              </Button>
            </div>
          </div>
          
          {/* Terminal Output */}
          <div 
            ref={terminalRef}
            className="flex-1 overflow-auto p-4 font-mono text-sm text-green-500"
            onClick={() => inputRef.current?.focus()}
          >
            {output.map((entry, i) => (
              <div key={i} className="mb-4">
                {entry.command && (
                  <div className="flex items-center text-gray-400 mb-1">
                    <span>{currentDirectory}$</span>
                    <span className="ml-2 text-white">{entry.command}</span>
                  </div>
                )}
                <div className={`whitespace-pre-wrap ${entry.isError ? 'text-red-500' : 'text-green-400'}`}>
                  {entry.response}
                </div>
              </div>
            ))}
            
            {/* Input Line */}
            <div className="flex items-center text-gray-400">
              <span>{currentDirectory}$</span>
              <span className="flex items-center ml-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={currentCommand}
                  onChange={(e) => setCurrentCommand(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="bg-transparent outline-none border-none text-white w-full px-0 ml-0"
                  autoFocus
                />
                <span className={`h-5 w-2 bg-white ml-0.5 ${showCursor ? 'opacity-100' : 'opacity-0'}`}></span>
              </span>
            </div>
          </div>
          
          {/* Command Hints */}
          <div className="bg-zinc-800/95 border-t border-zinc-700/50 py-1 px-4 flex items-center text-xs text-gray-500 font-mono overflow-x-auto whitespace-nowrap">
            <span className="mr-3">{t("terminal.tips")}</span>
            <span className="mx-2">
              <span className="px-1.5 py-0.5 bg-zinc-700 rounded text-gray-300 text-xs mr-1">Tab</span> {t("terminal.tips.tab")}
            </span>
            <span className="mx-2">
              <span className="px-1.5 py-0.5 bg-zinc-700 rounded text-gray-300 text-xs mr-1">↑↓</span> {t("terminal.tips.arrows")}
            </span>
            <span className="mx-2">
              <span className="px-1.5 py-0.5 bg-zinc-700 rounded text-gray-300 text-xs mr-1">Ctrl+C</span> {t("terminal.tips.ctrlc")}
            </span>
            <span className="mx-2">
              <span className="px-1.5 py-0.5 bg-zinc-700 rounded text-gray-300 text-xs mr-1">Ctrl+L</span> {t("terminal.tips.ctrll")}
            </span>
            <span className="mx-2">
              <span className="px-1.5 py-0.5 bg-zinc-700 rounded text-gray-300 text-xs mr-1">help</span> {t("terminal.tips.help")}
            </span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
} 
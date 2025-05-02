"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { 
  Home, Briefcase, Award, User, Mail, FileText, 
  Sun, Moon, Languages, Search, Command, ExternalLink 
} from "lucide-react"
import { useTheme } from "next-themes"
import { useLanguage } from "./language-provider"

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const { language, changeLanguage, getAllLanguages, t } = useLanguage()

  // Buka command palette dengan keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  // Array navigasi utama
  const mainNavItems = [
    {
      icon: <Home className="mr-2 h-4 w-4" />,
      name: t("nav.home"),
      href: "/#top"
    },
    {
      icon: <Briefcase className="mr-2 h-4 w-4" />,
      name: t("nav.services"),
      href: "/#services"
    },
    {
      icon: <FileText className="mr-2 h-4 w-4" />,
      name: t("nav.portfolio"),
      href: "/#portfolio"
    },
    {
      icon: <Award className="mr-2 h-4 w-4" />,
      name: t("nav.certifications"),
      href: "/#certifications"
    },
    {
      icon: <User className="mr-2 h-4 w-4" />,
      name: t("nav.resume"),
      href: "/resume"
    },
    {
      icon: <Mail className="mr-2 h-4 w-4" />,
      name: t("nav.contact"),
      href: "/#contact"
    }
  ]

  // Fungsi untuk navigasi
  const runCommand = (command: () => void) => {
    setOpen(false)
    command()
  }

  // Daftar bahasa yang tersedia
  const availableLanguages = getAllLanguages()

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border bg-background hover:bg-accent hover:text-accent-foreground h-10 py-2 px-4 ${
          theme === 'light' ? 'border-input/60 shadow-sm hover:border-primary/30 hover:shadow' : 'border-input'
        }`}
      >
        <Search className="mr-2 h-4 w-4" />
        <span className="hidden md:inline-flex">Cari cepat...</span>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground ml-auto hidden md:inline-flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>
      <CommandDialog 
        open={open} 
        onOpenChange={setOpen}
        title={t("nav.command_menu") || "Menu Perintah"}
      >
        <CommandInput placeholder={`${t("nav.search") || "Ketik perintah atau cari"}...`} />
        <CommandList>
          <CommandEmpty>{t("nav.no_results") || "Tidak ada hasil"}</CommandEmpty>
          
          <CommandGroup heading={t("nav.navigation") || "Navigasi"}>
            {mainNavItems.map((item) => (
              <CommandItem
                key={item.href}
                onSelect={() => runCommand(() => router.push(item.href))}
              >
                {item.icon}
                <span>{item.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          
          <CommandSeparator />
          
          <CommandGroup heading={t("nav.theme") || "Tema"}>
            <CommandItem onSelect={() => runCommand(() => setTheme("light"))}>
              <Sun className="mr-2 h-4 w-4" />
              <span>{t("nav.light_mode") || "Mode Terang"}</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme("dark"))}>
              <Moon className="mr-2 h-4 w-4" />
              <span>{t("nav.dark_mode") || "Mode Gelap"}</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme("system"))}>
              <Command className="mr-2 h-4 w-4" />
              <span>{t("nav.system") || "Sistem"}</span>
            </CommandItem>
          </CommandGroup>
          
          <CommandSeparator />
          
          <CommandGroup heading={t("language.selectLanguage")}>
            {availableLanguages.map((lang) => (
              <CommandItem
                key={lang.code}
                onSelect={() => runCommand(() => changeLanguage(lang.code))}
              >
                <Languages className="mr-2 h-4 w-4" />
                <span>{lang.name}</span>
                {language === lang.code && (
                  <span className="ml-auto text-sm text-primary">✓</span>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
          
          <CommandSeparator />
          
          <CommandGroup heading="Social">
            <CommandItem
              onSelect={() =>
                runCommand(() => window.open("https://github.com/januar420", "_blank"))
              }
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              <span>GitHub</span>
            </CommandItem>
            <CommandItem
              onSelect={() =>
                runCommand(() => window.open("https://linkedin.com/in/januar-galuh", "_blank"))
              }
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              <span>LinkedIn</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
} 
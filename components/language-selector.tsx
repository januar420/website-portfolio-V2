"use client"

import { useState, useEffect } from "react"
import { Check, ChevronsUpDown, Globe } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { useI18n, SupportedLanguage } from "./i18n/context"

const languages = [
  { value: "en", label: "English", flag: "🇺🇸" },
  { value: "id", label: "Bahasa Indonesia", flag: "🇮🇩" },
  { value: "ja", label: "日本語", flag: "🇯🇵" },
  { value: "es", label: "Español", flag: "🇪🇸" },
  { value: "fr", label: "Français", flag: "🇫🇷" },
]

interface LanguageSelectorProps {
  variant?: "default" | "terminal"
  compact?: boolean
}

export default function LanguageSelector({ 
  variant = "default",
  compact = false 
}: LanguageSelectorProps) {
  const [open, setOpen] = useState(false)
  const { language, setLanguage } = useI18n()
  const [selectedLanguage, setSelectedLanguage] = useState(
    languages.find((lang) => lang.value === language) || languages[0]
  )

  // Update selected language when context language changes
  useEffect(() => {
    setSelectedLanguage(languages.find((lang) => lang.value === language) || languages[0])
  }, [language])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={variant === "terminal" ? "outline" : "ghost"}
          role="combobox"
          aria-expanded={open}
          className={cn(
            "flex items-center gap-1",
            variant === "terminal" && "border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100",
            compact && "h-8 px-2 text-xs"
          )}
        >
          <span className="mr-1">{selectedLanguage.flag}</span>
          {!compact && (
            <span className="hidden sm:inline-block">{selectedLanguage.label}</span>
          )}
          <ChevronsUpDown className={cn("ml-1", compact ? "h-3 w-3" : "h-4 w-4")} />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className={cn(
          "p-0", 
          variant === "terminal" && "border-zinc-700 bg-zinc-800"
        )}
        align="end"
      >
        <Command className={cn(variant === "terminal" && "bg-zinc-800")}>
          <CommandInput 
            placeholder="Search language..." 
            className={cn(variant === "terminal" && "border-zinc-700")}
          />
          <CommandEmpty>No language found.</CommandEmpty>
          <CommandGroup>
            {languages.map((lang) => (
              <CommandItem
                key={lang.value}
                value={lang.value}
                onSelect={(currentValue) => {
                  const value = currentValue as SupportedLanguage
                  setLanguage(value)
                  setOpen(false)
                }}
                className={cn(
                  variant === "terminal" && "text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100",
                  language === lang.value && variant === "terminal" && "bg-zinc-700"
                )}
              >
                <span className="mr-2">{lang.flag}</span>
                {lang.label}
                <Check
                  className={cn(
                    "ml-auto h-4 w-4",
                    language === lang.value ? "opacity-100" : "opacity-0"
                  )}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
} 
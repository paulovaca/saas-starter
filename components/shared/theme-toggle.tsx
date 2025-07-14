"use client"

import * as React from "react"
import { Monitor, Moon, Sun } from "lucide-react"
import { useTheme } from "@/hooks/use-theme"
import { THEMES, THEME_LABELS } from "@/lib/constants/theme"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const getThemeIcon = () => {
    switch (theme) {
      case THEMES.LIGHT:
        return <Sun className="h-4 w-4" />
      case THEMES.DARK:
        return <Moon className="h-4 w-4" />
      default:
        return <Monitor className="h-4 w-4" />
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon"
          className="h-9 w-9"
          aria-label="Alterar tema"
        >
          {getThemeIcon()}
          <span className="sr-only">Alterar tema</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[8rem]">
        <DropdownMenuItem 
          onClick={() => setTheme(THEMES.LIGHT)}
          className="flex items-center gap-2"
        >
          <Sun className="h-4 w-4" />
          {THEME_LABELS[THEMES.LIGHT]}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme(THEMES.DARK)}
          className="flex items-center gap-2"
        >
          <Moon className="h-4 w-4" />
          {THEME_LABELS[THEMES.DARK]}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme(THEMES.SYSTEM)}
          className="flex items-center gap-2"
        >
          <Monitor className="h-4 w-4" />
          {THEME_LABELS[THEMES.SYSTEM]}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

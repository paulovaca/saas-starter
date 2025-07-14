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
import styles from "./theme-toggle.module.css"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" className={styles.themeToggleButton}>
        <Sun 
          className={styles.themeIcon} 
          style={{
            color: 'hsl(var(--foreground))',
            fill: 'currentColor',
            stroke: 'currentColor',
            opacity: 1
          }} 
        />
      </Button>
    )
  }

  const getThemeIcon = () => {
    const iconStyle = {
      color: 'hsl(var(--foreground))',
      fill: 'currentColor',
      stroke: 'currentColor',
      opacity: 1
    }
    
    switch (theme) {
      case THEMES.LIGHT:
        return <Sun className={styles.themeIcon} style={iconStyle} />
      case THEMES.DARK:
        return <Moon className={styles.themeIcon} style={iconStyle} />
      default:
        return <Monitor className={styles.themeIcon} style={iconStyle} />
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon"
          className={styles.themeToggleButton}
          aria-label="Alterar tema"
        >
          {getThemeIcon()}
          <span className={styles.screenReaderOnly}>Alterar tema</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={styles.dropdownContent}>
        <DropdownMenuItem 
          onClick={() => setTheme(THEMES.LIGHT)}
          className={styles.dropdownItem}
        >
          <Sun className={styles.itemIcon} />
          {THEME_LABELS[THEMES.LIGHT]}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme(THEMES.DARK)}
          className={styles.dropdownItem}
        >
          <Moon className={styles.itemIcon} />
          {THEME_LABELS[THEMES.DARK]}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme(THEMES.SYSTEM)}
          className={styles.dropdownItem}
        >
          <Monitor className={styles.itemIcon} />
          {THEME_LABELS[THEMES.SYSTEM]}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

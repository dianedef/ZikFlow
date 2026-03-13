"use client"

import * as React from "react"
import { Moon, Sun } from 'lucide-react'
import { Button } from "@/components/ui/button"

type Theme = "light" | "dark"

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light"
  const stored = window.localStorage.getItem("theme")
  if (stored === "light" || stored === "dark") return stored
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
  return prefersDark ? "dark" : "light"
}

function applyTheme(theme: Theme) {
  const root = document.documentElement
  if (theme === "dark") {
    root.classList.add("dark")
  } else {
    root.classList.remove("dark")
  }
  window.localStorage.setItem("theme", theme)
}

export function ThemeToggle() {
  const [theme, setTheme] = React.useState<Theme>(() => getInitialTheme())
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    // Ensure class is applied on mount (and after hard refresh)
    applyTheme(theme)
    setMounted(true)
  }, [])

  const nextTheme: Theme = theme === "dark" ? "light" : "dark"

  const handleClick = () => {
    const t = theme === "dark" ? "light" : "dark"
    setTheme(t)
    applyTheme(t)
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      className="h-8 px-2.5 text-xs"
      aria-label={`Switch to ${nextTheme} theme`}
      title={`Switch to ${nextTheme} theme`}
    >
      {mounted && theme === "dark" ? (
        <>
          <Sun className="mr-1.5 size-3.5" />
          {"Light"}
        </>
      ) : (
        <>
          <Moon className="mr-1.5 size-3.5" />
          {"Dark"}
        </>
      )}
    </Button>
  )
}

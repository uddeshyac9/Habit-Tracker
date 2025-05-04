"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

type ThemeContextType = {
  darkMode: boolean
  toggleDarkMode: () => void
  setDarkMode: (isDark: boolean) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [darkMode, setDarkMode] = useState(() => {
    // Initialize from localStorage if available
    if (typeof window !== "undefined") {
      return localStorage.getItem("darkMode") === "true"
    }
    return false
  })

  // Apply dark mode class to HTML element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }

    // Save to localStorage
    localStorage.setItem("darkMode", darkMode.toString())
  }, [darkMode])

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  return <ThemeContext.Provider value={{ darkMode, toggleDarkMode, setDarkMode }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

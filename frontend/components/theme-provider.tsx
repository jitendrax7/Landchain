'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
  useTheme as useNextTheme,
} from 'next-themes'

export function useTheme() {
  const { theme, setTheme, systemTheme } = useNextTheme()
  const currentTheme = theme === 'system' ? systemTheme : theme

  const toggleTheme = () => {
    setTheme(currentTheme === 'light' ? 'dark' : 'light')
  }

  return {
    theme: currentTheme,
    toggleTheme,
    setTheme,
  }
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider attribute="data-theme" defaultTheme="dark" enableSystem {...props}>
      {children}
    </NextThemesProvider>
  )
}

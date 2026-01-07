import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type Theme = 'dark' | 'light'

type ThemeContextType = {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const THEME_STORAGE_KEY = 'pathfinder-theme'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname
      const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup')
      if (!isAuthPage) {
        const saved = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null
        if (saved === 'light' || saved === 'dark') {
          return saved
        }
      }
    }
    return 'light'
  })

  // Apply theme to document root
  useEffect(() => {
    const root = document.documentElement
    // Remove both classes first to avoid conflicts
    root.classList.remove('light-mode', 'dark-mode')
    // Add the appropriate class
    if (theme === 'light') {
      root.classList.add('light-mode')
    } else {
      root.classList.add('dark-mode')
    }
  }, [theme])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
  }

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

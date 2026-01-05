import { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from 'react'
import { translations, type TranslationKey } from '../lib/translations'

export type Language = 'en' | 'my'

type LanguageContextType = {
  language: Language
  toggleLanguage: () => void
  setLanguage: (language: Language) => void
  t: (key: TranslationKey) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const LANGUAGE_STORAGE_KEY = 'pathfinder-language'

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    // Read from localStorage on mount
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language | null
      if (saved === 'en' || saved === 'my') {
        return saved
      }
    }
    return 'my' // Default to Bahasa Melayu
  })

  // Save to localStorage whenever language changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
    }
  }, [language])

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage)
  }

  const toggleLanguage = () => {
    setLanguageState((prev) => (prev === 'en' ? 'my' : 'en'))
  }

  // Translation function - memoized to ensure it updates when language changes
  const t = useMemo(() => {
    return (key: TranslationKey): string => {
      return translations[language][key] || key
    }
  }, [language])

  const contextValue = useMemo(() => ({
    language,
    toggleLanguage,
    setLanguage,
    t,
  }), [language, t])

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

// Convenience hook for translations
export function useTranslation() {
  const { t, language } = useLanguage()
  return { t, language }
}

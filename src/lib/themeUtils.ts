import { cn } from './cn'
import type { Theme } from '../context/ThemeContext'

/**
 * Utility function to apply theme-aware classes
 * @param darkClasses - Classes to apply in dark mode
 * @param lightClasses - Classes to apply in light mode
 * @param theme - Current theme
 */
export function themeClass(darkClasses: string, lightClasses: string, theme: Theme): string {
  return theme === 'light' ? lightClasses : darkClasses
}

/**
 * Combine theme-aware classes with cn utility
 */
export function themeCn(
  darkClasses: string,
  lightClasses: string,
  theme: Theme,
  ...additionalClasses: (string | undefined | null | false)[]
): string {
  return cn(theme === 'light' ? lightClasses : darkClasses, ...additionalClasses)
}

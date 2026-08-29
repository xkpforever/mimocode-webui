import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { Locale } from '../lib/i18n'
import { getBrowserLocale } from '../lib/i18n'
import { dict as enDict } from '../lib/i18n/en'
import { dict as zhDict } from '../lib/i18n/zh'

interface I18nContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, params?: Record<string, string | number>) => string
}

const I18nContext = createContext<I18nContextValue>(null!)

const dictionaries: Record<Locale, Record<string, string>> = {
  en: enDict,
  zh: zhDict,
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getBrowserLocale)

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem('mimocode-locale', newLocale)
    document.documentElement.lang = newLocale === 'zh' ? 'zh-CN' : 'en'
  }, [])

  const tFn = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const dict = dictionaries[locale]
      let template = dict[key]
      if (template === undefined) {
        // Fallback to English for missing keys
        template = dictionaries.en[key]
      }
      if (template === undefined) return key

      if (!params) return template
      return template.replace(/\{\{(.+?)\}\}/g, (_, k: string) => {
        const value = params[k.trim()]
        return value !== undefined ? String(value) : `{{${k}}}`
      })
    },
    [locale],
  )

  return (
    <I18nContext.Provider value={{ locale, setLocale, t: tFn }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}

import { dict as enDict } from './en'
import { dict as zhDict } from './zh'

export type Locale = 'en' | 'zh'

const dictionaries: Record<Locale, Record<string, string>> = {
  en: enDict,
  zh: zhDict,
}

/**
 * Interpolate {{variables}} in a template string.
 * Supports dot-path values in the params object.
 */
function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template
  return template.replace(/\{\{(.+?)\}\}/g, (_, key: string) => {
    const value = params[key.trim()]
    return value !== undefined ? String(value) : `{{${key}}}`
  })
}

/**
 * Translate a key with optional interpolation params.
 * Falls back to the key itself if not found.
 */
export function t(key: string, locale: Locale, params?: Record<string, string | number>): string {
  const dict = dictionaries[locale]
  const template = dict[key]
  if (template === undefined) return key
  return interpolate(template, params)
}

export function getBrowserLocale(): Locale {
  const stored = localStorage.getItem('mimocode-locale') as Locale | null
  if (stored === 'en' || stored === 'zh') return stored

  // Auto-detect from browser
  const langs = navigator.languages || [navigator.language]
  for (const lang of langs) {
    if (lang.startsWith('zh')) return 'zh'
  }
  return 'en'
}

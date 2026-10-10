import { de, type I18nKey } from './de'

const dictionaries: Record<string, Record<I18nKey, string>> = { de }
let locale = 'de'

export function setLocale(next: string) {
  if (dictionaries[next]) locale = next
}

/** Translate a key, replacing `{param}` placeholders. */
export function t(key: I18nKey, params?: Record<string, string | number>): string {
  let s: string = dictionaries[locale][key] ?? key
  if (params) for (const [k, v] of Object.entries(params)) s = s.replaceAll(`{${k}}`, String(v))
  return s
}

export type { I18nKey }

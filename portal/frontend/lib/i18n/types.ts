export type Locale = 'en' | 'ru' | 'ka';

export const LOCALES: Locale[] = ['en', 'ru', 'ka'];

export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'EN',
  ru: 'RU',
  ka: 'KA',
};

export const LOCALE_NATIVE: Record<Locale, string> = {
  en: 'English',
  ru: 'Русский',
  ka: 'ქართული',
};

export const DEFAULT_LOCALE: Locale = 'en';
export const LOCALE_STORAGE_KEY = 'ast.locale';

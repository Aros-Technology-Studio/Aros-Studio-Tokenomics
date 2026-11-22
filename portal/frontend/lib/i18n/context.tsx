'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { translate } from './messages';
import { KA_TEXT } from './ka-text';
import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  type Locale,
} from './types';

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  /** English source text → Georgian when ka is active (falls back to English). */
  tx: (text: string) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

/**
 * Locale comes from the `ast.locale` cookie written by LangSwitch, so client
 * UI and server-rendered content packs agree. Only en/ka are offered.
 */
function readStoredLocale(): Locale {
  const m = document.cookie.match(new RegExp(`(?:^|; )${LOCALE_STORAGE_KEY.replace('.', '\\.')}=(en|ka)`));
  return (m?.[1] as Locale | undefined) ?? DEFAULT_LOCALE;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setLocaleState(readStoredLocale());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.lang = locale;
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    } catch {
      /* ignore */
    }
  }, [locale, ready]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
  }, []);

  const t = useCallback((key: string) => translate(locale, key), [locale]);
  const tx = useCallback(
    (text: string) => (locale === 'ka' ? KA_TEXT[text.replace(/\s+/g, ' ').trim()] ?? text : text),
    [locale],
  );

  const value = useMemo(
    () => ({ locale, setLocale, t, tx }),
    [locale, setLocale, t, tx],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return ctx;
}

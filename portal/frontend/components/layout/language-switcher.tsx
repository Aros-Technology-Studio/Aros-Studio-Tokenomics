'use client';

import { useI18n } from '../../lib/i18n/context';
import { LOCALES, LOCALE_LABELS, LOCALE_NATIVE, type Locale } from '../../lib/i18n/types';

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();

  return (
    <div className="lang-switch" role="group" aria-label={t('lang.label')}>
      <span className="lang-switch-label">{t('lang.label')}</span>
      {LOCALES.map((code: Locale) => (
        <button
          key={code}
          type="button"
          className={locale === code ? 'lang-btn on' : 'lang-btn'}
          title={LOCALE_NATIVE[code]}
          aria-pressed={locale === code}
          onClick={() => setLocale(code)}
        >
          <span className="lang-code">{LOCALE_LABELS[code]}</span>
          <span className="lang-native">{LOCALE_NATIVE[code]}</span>
        </button>
      ))}
    </div>
  );
}

'use client';

import { useI18n } from '../../lib/i18n/context';
import { LOCALES, LOCALE_LABELS, LOCALE_NATIVE, type Locale } from '../../lib/i18n/types';

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();

  return (
    <div className="lang-switch" role="group" aria-label={t('lang.label')}>
      {LOCALES.map((code: Locale) => (
        <button
          key={code}
          type="button"
          className={locale === code ? 'lang-btn on' : 'lang-btn'}
          title={LOCALE_NATIVE[code]}
          onClick={() => setLocale(code)}
        >
          {LOCALE_LABELS[code]}
        </button>
      ))}
    </div>
  );
}

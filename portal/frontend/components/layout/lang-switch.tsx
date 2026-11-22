'use client';

import { useRouter } from 'next/navigation';
import { useI18n } from '../../lib/i18n/context';
import { LOCALE_STORAGE_KEY, type Locale } from '../../lib/i18n/types';

const OPTIONS: { locale: Locale; label: string }[] = [
  { locale: 'en', label: 'EN' },
  { locale: 'ka', label: 'ქარ' },
];

/** EN / Georgian toggle. The cookie lets server pages pick the content pack. */
export function LangSwitch() {
  const { locale, setLocale } = useI18n();
  const router = useRouter();

  const pick = (next: Locale) => {
    if (next === locale) return;
    document.cookie = `${LOCALE_STORAGE_KEY}=${next}; path=/; max-age=31536000; samesite=lax`;
    setLocale(next);
    router.refresh();
  };

  return (
    <div className="lang-switch" role="group" aria-label="Language">
      {OPTIONS.map((o) => (
        <button
          key={o.locale}
          type="button"
          aria-pressed={o.locale === locale}
          onClick={() => pick(o.locale)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

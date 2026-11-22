'use client';

import type { ReactNode } from 'react';
import { useI18n } from '../../lib/i18n/context';

/** Translates its English text child via the ka dictionary (lib/i18n/ka-text.ts). */
export function T({ children }: { children: string }) {
  return <>{useI18n().tx(children)}</>;
}

/** Picks a whole localized fragment, for sentences with inline markup. */
export function L({ en, ka }: { en: ReactNode; ka: ReactNode }) {
  return <>{useI18n().locale === 'ka' ? ka : en}</>;
}

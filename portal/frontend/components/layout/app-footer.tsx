'use client';

import Link from 'next/link';
import { useI18n } from '../../lib/i18n/context';

export function AppFooter() {
  const { t } = useI18n();
  return (
    <footer className="footer">
      <span>{t('footer.tagline')}</span>
      <span>
        <Link href="/explore">{t('nav.explore')}</Link>
        {' · '}
        <Link href="/nodechain">{t('nav.nodechain')}</Link>
        {' · '}
        <Link href="/system">{t('nav.system')}</Link>
        {' · '}
        {t('footer.sot')}
      </span>
    </footer>
  );
}

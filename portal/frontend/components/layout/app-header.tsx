'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  clearSession,
  loadSession,
  portalFetch,
  type PortalSession,
} from '../../lib/auth';
import { useI18n } from '../../lib/i18n/context';
import { LanguageSwitcher } from './language-switcher';

export function AppHeader() {
  const [session, setSession] = useState<PortalSession | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useI18n();

  useEffect(() => {
    setSession(loadSession());
  }, [pathname]);

  function logout() {
    const s = loadSession();
    if (s) {
      void portalFetch('/v1/auth/logout', {
        method: 'POST',
        sessionId: s.sessionId,
      });
    }
    clearSession();
    setSession(null);
    router.push('/login');
  }

  return (
    <header className="topbar">
      <Link href="/" style={{ textDecoration: 'none' }}>
        <div className="brand">
          <span className="brand-title">Aros Studio Tokenomics (AST)</span>
          <span className="brand-sub">{t('nav.brandSub')}</span>
        </div>
      </Link>
      <div className="topbar-right">
        {/* Always visible: EN · RU · KA */}
        <LanguageSwitcher />
        <nav className="nav" aria-label="Main">
          <Link href="/about">{t('nav.about')}</Link>
          <Link href="/system">{t('nav.system')}</Link>
          <Link href="/explore">{t('nav.explore')}</Link>
          <Link href="/nodechain">{t('nav.nodechain')}</Link>
          {session ? (
            <>
              <Link href="/dashboard">{t('nav.cabinet')}</Link>
              <Link href="/tokenization">{t('nav.tokenization')}</Link>
              <Link href="/assets">{t('nav.assets')}</Link>
              <span className="pill">{session.institutionId}</span>
              <button type="button" className="linkish" onClick={logout}>
                {t('nav.logout')}
              </button>
            </>
          ) : (
            <Link href="/login">
              <button type="button" className="primary" style={{ padding: '0.45rem 0.9rem' }}>
                {t('nav.login')}
              </button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

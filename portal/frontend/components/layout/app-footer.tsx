'use client';

import Link from 'next/link';

/**
 * Shared dark footer — visible on every page, sits above the global backdrop.
 */
export function AppFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <span className="footer-brand" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <img
          className="footer-logo"
          src="/brand/ast-mark-white.png"
          alt="Aros Studio Tokenomics"
          width={102}
          height={54}
        />
        <span>&copy; {year} Aros Studio Tokenomics</span>
      </span>
      <span style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
        <Link href="/technologic">TECHNOlogic</Link>
        <Link href="/institutions">Institutions</Link>
        <Link href="/investment">Investment</Link>
        <Link href="/resources">Resources</Link>
        <Link href="/about">About</Link>
        <Link href="/contact">Contact</Link>
      </span>
    </footer>
  );
}

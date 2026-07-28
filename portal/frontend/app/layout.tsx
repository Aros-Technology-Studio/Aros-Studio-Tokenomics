import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '../styles/globals.css';
import { AppHeader } from '../components/layout/app-header';
import { AppFooter } from '../components/layout/app-footer';
import { Providers } from '../components/providers';

export const metadata: Metadata = {
  title: {
    default: 'Aros Studio Tokenomics (AST) — Institutional Portal',
    template: '%s · AST',
  },
  description:
    'Institutional portal for Aros Studio Tokenomics (AST). Edge admission → Core Orchestrator. No mint on the portal.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <div className="shell">
            <AppHeader />
            <main className="shell-main">{children}</main>
            <AppFooter />
          </div>
        </Providers>
      </body>
    </html>
  );
}

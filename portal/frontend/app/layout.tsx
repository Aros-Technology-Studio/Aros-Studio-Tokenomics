import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '../styles/globals.css';
import { AppHeader } from '../components/layout/app-header';

export const metadata: Metadata = {
  title: {
    default: 'Aros Financial Core — Institutional Portal',
    template: '%s · Aros Financial Core',
  },
  description:
    'Institutional client portal for primary tokenization. Edge admission → Core Orchestrator. No mint on the portal.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="shell">
          <AppHeader />
          <main className="shell-main">{children}</main>
          <footer className="footer">
            <span>
              Aros Financial Core · public site + institutional edge
            </span>
            <span>
              <a href="/explore">Explore</a>
              {' · '}
              <a href="/system">System</a>
              {' · '}
              NodeChain is SoT
            </span>
          </footer>
        </div>
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { AppHeader } from './app-header';

export const metadata: Metadata = {
  title: 'AST Institutional Portal',
  description:
    'Institutional client portal for Aros Studio Tokenomics — submit primary tokenization to Core Orchestrator',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="shell">
          <AppHeader />
          {children}
        </div>
      </body>
    </html>
  );
}

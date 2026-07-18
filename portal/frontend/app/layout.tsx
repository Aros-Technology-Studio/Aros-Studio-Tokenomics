import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'AST Institutional Portal',
  description:
    'Institutional process submission edge for Aros Studio Tokenomics — valuation and qualified signatures only; Core remains SoT',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="banner">
          <strong>AST Institutional Portal</strong>
          <span className="muted">edge · mint only after Core PoT · Core Canon SoT</span>
        </header>
        <main className="main">{children}</main>
      </body>
    </html>
  );
}

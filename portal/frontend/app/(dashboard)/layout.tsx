'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loadSession } from '../../lib/auth';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    if (!loadSession()) router.replace('/login');
  }, [router]);

  return <div className="dashboard-shell">{children}</div>;
}

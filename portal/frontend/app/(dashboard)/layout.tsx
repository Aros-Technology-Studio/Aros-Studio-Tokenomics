'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loadSession } from '../../lib/auth';
import { CabinetSidebar } from '../../components/layout/cabinet-sidebar';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    if (!loadSession()) router.replace('/login');
  }, [router]);

  return (
    <div className="cabinet-layout">
      <CabinetSidebar />
      <div className="dashboard-shell">{children}</div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useI18n } from '../../lib/i18n/context';

export default function AboutPage() {
  const { t } = useI18n();
  return (
    <>
      <section className="card hero">
        <p className="eyebrow">{t('about.eyebrow')}</p>
        <h1>{t('about.h1')}</h1>
        <p className="lead lead-wide">{t('about.lead')}</p>
      </section>

      <div className="card">
        <h2>{t('about.who.h')}</h2>
        <p className="lead">{t('about.who.p1')}</p>
        <p className="lead">{t('about.who.p2')}</p>
      </div>

      <div className="grid2">
        <div className="card flat">
          <h2>{t('about.mission.h')}</h2>
          <p className="muted">{t('about.mission.d')}</p>
        </div>
        <div className="card flat">
          <h2>{t('about.site.h')}</h2>
          <p className="muted">{t('about.site.d')}</p>
        </div>
      </div>

      <div className="actions" style={{ marginTop: '0.5rem' }}>
        <Link href="/system">
          <button type="button" className="primary">
            {t('about.cta.system')}
          </button>
        </Link>
        <Link href="/explore">
          <button type="button" className="secondary">
            {t('about.cta.explore')}
          </button>
        </Link>
      </div>
    </>
  );
}

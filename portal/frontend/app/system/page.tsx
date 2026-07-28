'use client';

import Link from 'next/link';
import { useI18n } from '../../lib/i18n/context';

export default function SystemPage() {
  const { t } = useI18n();
  return (
    <>
      <section className="card hero">
        <p className="eyebrow">{t('system.eyebrow')}</p>
        <h1>{t('system.h1')}</h1>
        <p className="lead lead-wide">{t('system.lead')}</p>
      </section>

      <div className="grid2">
        <div className="card can">
          <h2 className="ok">{t('system.can.h')}</h2>
          <ul className="plain-list">
            <li>{t('system.can.1')}</li>
            <li>{t('system.can.2')}</li>
            <li>{t('system.can.3')}</li>
            <li>{t('system.can.4')}</li>
            <li>{t('system.can.5')}</li>
            <li>{t('system.can.6')}</li>
          </ul>
        </div>
        <div className="card cannot">
          <h2 className="err" style={{ marginTop: 0 }}>
            {t('system.cannot.h')}
          </h2>
          <ul className="plain-list">
            <li>{t('system.cannot.1')}</li>
            <li>{t('system.cannot.2')}</li>
            <li>{t('system.cannot.3')}</li>
            <li>{t('system.cannot.4')}</li>
            <li>{t('system.cannot.5')}</li>
            <li>{t('system.cannot.6')}</li>
          </ul>
        </div>
      </div>

      <div className="card">
        <h2>{t('system.how.h')}</h2>
        <div className="timeline">
          <div className="item done">
            <div className="t">{t('system.how.portal.t')}</div>
            <div className="d">{t('system.how.portal.d')}</div>
          </div>
          <div className="item done">
            <div className="t">{t('system.how.core.t')}</div>
            <div className="d">{t('system.how.core.d')}</div>
          </div>
          <div className="item active">
            <div className="t">{t('system.how.pot.t')}</div>
            <div className="d">{t('system.how.pot.d')}</div>
          </div>
          <div className="item">
            <div className="t">{t('system.how.nc.t')}</div>
            <div className="d">{t('system.how.nc.d')}</div>
          </div>
        </div>
      </div>

      <div className="callout">
        <strong>NodeChain.</strong> {t('system.callout')}
      </div>

      <div className="actions">
        <Link href="/explore">
          <button type="button" className="primary">
            {t('system.cta.explore')}
          </button>
        </Link>
        <Link href="/nodechain">
          <button type="button" className="secondary">
            {t('system.cta.nodechain')}
          </button>
        </Link>
      </div>
    </>
  );
}

'use client';

import Link from 'next/link';
import { useI18n } from '../lib/i18n/context';

export default function HomePage() {
  const { t } = useI18n();
  return (
    <>
      <section className="card hero hero-public">
        <p className="eyebrow">{t('home.eyebrow')}</p>
        <h1>{t('home.h1')}</h1>
        <p className="lead lead-wide">{t('home.lead')}</p>
        <div className="actions">
          <Link href="/explore">
            <button type="button" className="primary">
              {t('home.cta.explore')}
            </button>
          </Link>
          <Link href="/nodechain">
            <button type="button" className="secondary">
              {t('home.cta.nodechain')}
            </button>
          </Link>
          <Link href="/system">
            <button type="button" className="ghost">
              {t('home.cta.system')}
            </button>
          </Link>
          <Link href="/login">
            <button type="button" className="ghost">
              {t('home.cta.cabinet')}
            </button>
          </Link>
        </div>
      </section>

      <div className="kpis kpis-public">
        <div className="kpi">
          <div className="label">{t('home.kpi.public.label')}</div>
          <div className="value" style={{ fontSize: '1.1rem' }}>
            {t('home.kpi.public.value')}
          </div>
          <div className="hint">{t('home.kpi.public.hint')}</div>
        </div>
        <div className="kpi">
          <div className="label">{t('home.kpi.inst.label')}</div>
          <div className="value" style={{ fontSize: '1.1rem' }}>
            {t('home.kpi.inst.value')}
          </div>
          <div className="hint">{t('home.kpi.inst.hint')}</div>
        </div>
        <div className="kpi">
          <div className="label">{t('home.kpi.sot.label')}</div>
          <div className="value" style={{ fontSize: '1.1rem' }}>
            <a href="/nodechain" style={{ color: 'inherit' }}>
              NodeChain
            </a>
          </div>
          <div className="hint">{t('home.kpi.sot.hint')}</div>
        </div>
        <div className="kpi">
          <div className="label">{t('home.kpi.never.label')}</div>
          <div className="value" style={{ fontSize: '1.1rem' }}>
            {t('home.kpi.never.value')}
          </div>
          <div className="hint">{t('home.kpi.never.hint')}</div>
        </div>
      </div>

      <ul className="feature-list">
        <li>
          <strong>{t('home.f1.t')}</strong>
          <span>{t('home.f1.d')}</span>
        </li>
        <li>
          <strong>{t('home.f2.t')}</strong>
          <span>{t('home.f2.d')}</span>
        </li>
        <li>
          <strong>{t('home.f3.t')}</strong>
          <span>{t('home.f3.d')}</span>
        </li>
        <li>
          <strong>{t('home.f4.t')}</strong>
          <span>{t('home.f4.d')}</span>
        </li>
      </ul>

      <section className="card flat" style={{ marginTop: '1rem' }}>
        <h2>{t('home.doors')}</h2>
        <div className="grid2">
          <div className="door">
            <h3>{t('home.public.h')}</h3>
            <p className="muted">{t('home.public.d')}</p>
            <div className="actions">
              <Link href="/about">
                <button type="button" className="secondary">
                  {t('home.public.about')}
                </button>
              </Link>
              <Link href="/explore">
                <button type="button" className="primary">
                  {t('nav.explore')}
                </button>
              </Link>
              <Link href="/nodechain">
                <button type="button" className="secondary">
                  NodeChain
                </button>
              </Link>
            </div>
          </div>
          <div className="door">
            <h3>{t('home.inst.h')}</h3>
            <p className="muted">{t('home.inst.d')}</p>
            <div className="actions">
              <Link href="/login">
                <button type="button" className="primary">
                  {t('home.inst.signin')}
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

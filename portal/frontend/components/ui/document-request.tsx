'use client';

import { useState, type FormEvent } from 'react';
import { useI18n } from '../../lib/i18n/context';
import { checkWorkEmail } from '../../lib/work-email';
import { OrbitArt } from './orbit-art';

const TEAM = 'info@arosstudio.com';

/**
 * Gated document page (owner direction 2026-11-22): white paper, deep dive and
 * documentation are not published; an institution requests them and the team
 * sends them to a verified work address.
 * shortcut: the request leaves through the visitor's mail app (mailto), no
 * server inbox; move to a portal edge endpoint if requests need tracking.
 */
export function DocumentRequest({ title }: { title: string }) {
  const { tx } = useI18n();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [institution, setInstitution] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  function submit(e: FormEvent) {
    e.preventDefault();
    const check = checkWorkEmail(email);
    if (check === 'invalid') return setError(tx('Enter a valid email address.'));
    if (check === 'personal')
      return setError(tx('Use your institutional email. Personal mailboxes (Gmail, Outlook, iCloud…) are not accepted.'));
    if (!institution.trim()) return setError(tx('Enter your institution.'));
    setError(null);
    const body = [
      `Document: ${title}`,
      `Name: ${name.trim() || '—'}`,
      `Institution: ${institution.trim()}`,
      `Work email (send to): ${email.trim()}`,
    ].join('\n');
    window.location.href = `mailto:${TEAM}?subject=${encodeURIComponent(`Document request: ${title}`)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  }

  return (
    <section className="page">
      <div className="pad">
        <p className="page__eyebrow">{tx('Documents on request')}</p>
        <h1 className="page__title">{title}</h1>
        <p className="page__lead">
          {tx('Available to institutions on request. We send it only to a verified institutional email address.')}
        </p>

        <form className="glass doc-request" onSubmit={submit} noValidate>
          <OrbitArt index={1} />
          <label htmlFor="dr-email">{tx('Work email')}</label>
          <input
            id="dr-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@institution.org"
            required
          />
          <label htmlFor="dr-name">{tx('Full name')}</label>
          <input id="dr-name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
          <label htmlFor="dr-inst">{tx('Institution')}</label>
          <input
            id="dr-inst"
            autoComplete="organization"
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
            required
          />
          {error ? (
            <p className="err" role="alert">
              {error}
            </p>
          ) : null}
          {sent ? (
            <p className="ok" role="status">
              {tx('Your mail app opened with the request. Send it, and we will reply to the verified address.')}
            </p>
          ) : null}
          <button type="submit" className="primary">
            {tx('Request the document')}
          </button>
        </form>
      </div>
    </section>
  );
}

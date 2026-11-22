import Link from 'next/link';
import { Reveal } from '../components/ui/reveal';
import { ChainDiagram } from '../components/ui/chain-diagram';
import { OrbitArt } from '../components/ui/orbit-art';
import { getLocale } from '../lib/i18n/server';

/**
 * Home (Welcome) in the light "Starks" look (styles/starks.css): centred
 * tight type, black pill buttons, iridescent frames. Copy unchanged from the
 * previous home. The PoT diagram keeps its dark panel inside the frame.
 */
// Georgian: headings stay English, body copy and buttons translate (owner direction).
const COPY = {
  en: {
    enter: 'Enter the portal',
    how: 'How it works',
    gate: (
      <>
        No positive <strong>Proof of Transaction</strong> verdict, no value. There is no
        pre-mine and no free issuance — every AST token earns its place on NodeChain through
        the same confirmed path.
      </>
    ),
    records: (
      <>
        AST records <strong>already-confirmed institutional value</strong> as a living token —
        and <strong>NodeChain</strong> remembers every move of it.
      </>
    ),
  },
  ka: {
    enter: 'პორტალში შესვლა',
    how: 'როგორ მუშაობს',
    gate: (
      <>
        დადებითი <strong>Proof of Transaction</strong> ვერდიქტის გარეშე ღირებულება არ
        არსებობს. არც წინასწარი გამოშვებაა და არც უფასო ემისია — ყოველი AST ტოკენი თავის
        ადგილს NodeChain-ზე ერთი და იმავე დადასტურებული გზით იმსახურებს.
      </>
    ),
    records: (
      <>
        AST <strong>უკვე დადასტურებულ ინსტიტუციურ ღირებულებას</strong> ცოცხალ ტოკენად
        აღრიცხავს — <strong>NodeChain</strong> კი მის ყოველ მოძრაობას იმახსოვრებს.
      </>
    ),
  },
};

export default async function HomePage() {
  const t = COPY[await getLocale()];
  return (
    <div className="sk">
      {/* HERO */}
      <section className="sk-hero">
        <div className="pad">
          <Reveal as="div">
            <h1>Any institutional asset in any jurisdiction</h1>
          </Reveal>
          <Reveal as="div" delay={1} className="sk-actions">
            <Link href="/login" className="sk-btn sk-btn--dark">
              {t.enter}
            </Link>
            <Link href="/technologic" className="sk-btn sk-btn--light">
              {t.how}
            </Link>
          </Reveal>
        </div>
      </section>

      {/* POT CHAIN */}
      <section className="sk-section">
        <div className="pad">
          <Reveal as="div">
            <h2>One gate. Every token, the same five steps.</h2>
          </Reveal>
          <Reveal as="div" delay={1}>
            <p>{t.gate}</p>
          </Reveal>
          <Reveal as="div" delay={2} className="sk-frame">
            <div className="sk-frame__panel">
              <ChainDiagram />
            </div>
          </Reveal>
        </div>
      </section>

      {/* CLOSING */}
      <section className="sk-section">
        <div className="pad">
          <Reveal as="div" className="sk-card">
            <OrbitArt index={0} />
            <h2>Lifecycle logic for institutional assets.</h2>
            <p>{t.records}</p>
            <div className="sk-actions">
              <Link href="/login" className="sk-btn sk-btn--dark">
                {t.enter}
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

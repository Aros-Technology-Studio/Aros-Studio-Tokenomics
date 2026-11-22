import { Reveal } from '../components/ui/reveal';

/**
 * Home (Welcome). Hero only: mark, tagline and the positioning statement
 * underneath — per owner direction (2026-11-22) everything else was removed.
 * Navigation + footer come from the shared shell, not from this page.
 */
export default function HomePage() {
  return (
    <section className="home-hero home-hero--landing">
      <div className="pad">
        <Reveal as="div" className="home-hero__mark">
          <img src="/brand/aros-infinity-white.png" alt="Aros Studio" width={414} height={258} />
        </Reveal>
        <div className="home-hero__copy">
          <Reveal as="div" delay={1}>
            <h1 className="home-hero__title">
              Any institutional asset
              <br />
              in any jurisdiction
            </h1>
          </Reveal>
          <Reveal as="div" delay={2} className="home-hero__lead">
            <p>
              Institutional process infrastructure: it takes value from one form and jurisdiction
              and delivers it in the desired form and jurisdiction.
            </p>
            <p>
              A neutral, secure and institutionally compatible process infrastructure that provides:
            </p>
            <ul>
              <li>managed, fast interaction between fiat and tokenized assets;</li>
              <li>simplified integration for internal and external financial institutions;</li>
              <li>deployment without legislative, regulatory or architectural changes.</li>
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

import Link from 'next/link';
import type { Metadata } from 'next';
import { OrbitArt } from '../../components/ui/orbit-art';
import { getLocale } from '../../lib/i18n/server';

export const metadata: Metadata = { title: 'TECHNOlogic' };

/**
 * TECHNOlogic — brand hub. Splits into AST and AFC, each with About + Resources.
 */
// Georgian: brand names and card titles stay English, the rest translates.
const COPY = {
  en: {
    lead: 'The lifecycle logic behind institutional assets — two engines under one method.',
    sim: 'The same process today and with AFC / AST, side by side.',
    simGo: 'Open the simulator →',
    ast: 'Process token-economy: valuation recorded after confirmed work. NodeChain is the source of truth.',
    afc: 'The process of executing the Aros API Contract between independent, licensed parties. It coordinates — it never holds funds.',
    go: 'About · Resources →',
  },
  ka: {
    lead: 'ინსტიტუციური აქტივების სასიცოცხლო ციკლის ლოგიკა — ორი ძრავა, ერთი მეთოდი.',
    sim: 'ერთი და იგივე პროცესი დღეს და AFC / AST-ით — გვერდიგვერდ.',
    simGo: 'სიმულატორის გახსნა →',
    ast: 'პროცესული ტოკენ-ეკონომიკა: შეფასება აღირიცხება დადასტურებული სამუშაოს შემდეგ. NodeChain ჭეშმარიტების წყაროა.',
    afc: 'Aros API კონტრაქტის შესრულების პროცესი დამოუკიდებელ, ლიცენზირებულ მხარეებს შორის. ის კოორდინაციას უწევს — სახსრებს არასოდეს ინახავს.',
    go: 'შესახებ · რესურსები →',
  },
};

export default async function TechnologicPage() {
  const t = COPY[await getLocale()];
  return (
    <section className="home-hero">
      <div className="pad">
        <p className="page__eyebrow">Aros Studio</p>
        <h1 className="home-hero__title" style={{ fontWeight: 800 }}>
          TECHNO<span style={{ fontStyle: 'italic', fontWeight: 400 }}>logic</span>
        </h1>
        <p className="home-hero__lead">
          {t.lead}
        </p>

        <div className="tl-grid">
          <Link href="/simulator" className="tl-card tl-card--feature glass">
            <OrbitArt index={2} />
            <div>
              <h3>Settlement Simulator</h3>
              <p>{t.sim}</p>
              <span className="tl-card__go">{t.simGo}</span>
            </div>
          </Link>
          <Link href="/technologic/ast" className="tl-card glass">
            <OrbitArt index={0} />
            <img
              src="/brand/ast-mark-white.png"
              alt="AST"
              className="tl-card__mark"
              width={28}
              height={15}
            />
            <h3>Aros Studio Tokenomics</h3>
            <p>{t.ast}</p>
            <span className="tl-card__go">{t.go}</span>
          </Link>
          <Link href="/technologic/afc" className="tl-card glass">
            <OrbitArt index={3} />
            <img
              src="/brand/afc-mark-white.png"
              alt="AFC"
              className="tl-card__mark"
              width={28}
              height={16}
            />
            <h3>Aros Financial Core</h3>
            <p>{t.afc}</p>
            <span className="tl-card__go">{t.go}</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

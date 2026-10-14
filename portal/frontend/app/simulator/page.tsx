import type { Metadata } from 'next';
import { SimulatorWindow } from '../../components/ui/simulator-window';

export const metadata: Metadata = {
  title: 'Settlement Simulator',
  description:
    'The same institutional process today and with AFC / AST, side by side. Illustrative model: no quotes, service levels or performance claims.',
};

/** Spec: docs/portal/SETTLEMENT-SIMULATOR.md. The simulator itself is public/embed/settlement-simulator.html. */
export default function SimulatorPage() {
  return (
    <section className="page">
      <div className="pad">
        <p className="page__eyebrow">TECHNOlogic · Simulator</p>
        <h1 className="page__title">Settlement Simulator</h1>
        <p className="page__lead">
          One institutional process, two routes: how it runs today, and how it runs when the same institutions are
          connected through AFC. Illustrative model.
        </p>
        <SimulatorWindow src="/embed/settlement-simulator.html" title="settlement-simulator · illustrative model" />
      </div>
    </section>
  );
}

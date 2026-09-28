import { useInvoices } from '@/hooks/useDemo';
import { fcfa } from '@/domain/format';
import { riskClass } from '@/domain/lexique';
import type { Risk } from '@/domain/types';
import { SectionHead } from '@/components/ui';

const LEVELS: Risk[] = ['Critique', 'Élevé', 'Modéré', 'Faible'];
const COLOR: Record<Risk, string> = { Critique: 'var(--red)', Élevé: 'var(--amber)', Modéré: 'var(--mid)', Faible: 'var(--low)' };

/** Répartition des créances ouvertes par niveau de risque (risk_level). */
export function RiskBreakdown({ width = 360 }: { width?: number }) {
  const { open } = useInvoices();
  const total = open.reduce((s, i) => s + i.amount, 0);
  const rows = LEVELS.map((r) => {
    const items = open.filter((i) => i.risk === r);
    const amount = items.reduce((s, i) => s + i.amount, 0);
    return { r, count: items.length, amount, pct: Math.round((amount / total) * 100) };
  });
  const exposed = rows.filter((x) => x.r === 'Critique' || x.r === 'Élevé');

  return (
    <section className="vq-card" style={{ width, flexShrink: 0 }} aria-label="Risque">
      <SectionHead eyebrow="2 · Risque" title="Exposition par niveau de risque" />
      <div>
        <div className="vq-sub">Exposé · Élevé + Critique</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--heading)', marginTop: 4 }}>
          {fcfa(exposed.reduce((s, x) => s + x.amount, 0))} <span className="vq-sub">FCFA · {exposed.reduce((s, x) => s + x.count, 0)} factures</span>
        </div>
      </div>
      <div style={{ display: 'flex', height: 12, borderRadius: 999, overflow: 'hidden', gap: 2 }} aria-hidden>
        {rows.map((x) => <div key={x.r} style={{ width: `${x.pct}%`, background: COLOR[x.r] }} />)}
      </div>
      {rows.map((x) => (
        <div key={x.r} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5 }}>
          <span className={`vq-risk ${riskClass(x.r)}`} style={{ flex: 1 }}>{x.r}</span>
          <span className="vq-muted">{x.count} fact.</span>
          <strong style={{ width: 96, textAlign: 'right', color: 'var(--heading)' }}>{fcfa(x.amount)}</strong>
        </div>
      ))}
      <p className="vq-sub" style={{ borderTop: '1px solid var(--line)', paddingTop: 12, lineHeight: 1.5 }}>
        Le risque est un signal d’analyse. Il ne fixe ni la priorité, ni le niveau de recouvrement : ces valeurs viennent séparément du Rule Engine.
      </p>
    </section>
  );
}

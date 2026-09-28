import { useClients, useInvoices } from '@/hooks/useDemo';
import { useDrawer } from '@/hooks/useDrawer';
import { fcfa } from '@/domain/format';
import { riskClass } from '@/domain/lexique';
import type { Risk } from '@/domain/types';
import { DecisionDrawer } from '@/components/decision';
import { DimensionsLegend, InvoiceOutcome, LevelChip, PageHeader, PriorityPill, RankTag, RiskBadge, SectionHead } from '@/components/ui';

const ORDER: Risk[] = ['Critique', 'Élevé', 'Modéré', 'Faible'];

/** Risque : exposition par niveau, détail par facture, concentration par client. */
export default function Risque() {
  const { open } = useInvoices();
  const { clients, byId } = useClients();
  const drawer = useDrawer();
  const total = open.reduce((s, i) => s + i.amount, 0);
  const levels = ORDER.map((r) => { const items = open.filter((i) => i.risk === r); const amount = items.reduce((s, i) => s + i.amount, 0); return { r, count: items.length, amount, pct: Math.round((amount / total) * 100) }; });
  const rows = [...open].sort((a, b) => ORDER.indexOf(a.risk!) - ORDER.indexOf(b.risk!) || b.amount - a.amount);
  const conc = [...clients].sort((a, b) => (b.outstanding ?? 0) - (a.outstanding ?? 0));

  return (
    <>
      <PageHeader title="Risque" sub="Exposition de vos créances par niveau de risque (risk_level)." />
      <div className="vq-grid cols-4">
        {levels.map((l) => (
          <div key={l.r} className="vq-kpi" style={{ borderTop: `4px solid var(--${l.r === 'Critique' ? 'red' : l.r === 'Élevé' ? 'amber' : l.r === 'Modéré' ? 'mid' : 'low'})` }}>
            <span className={`vq-risk ${riskClass(l.r)}`} style={{ fontSize: 14, fontWeight: 800 }}>{l.r}</span>
            <div className="value">{fcfa(l.amount)} <span className="unit">FCFA</span></div>
            <div className="hint">{l.count} facture(s) · {l.pct} % des créances ouvertes</div>
          </div>
        ))}
      </div>
      <div className="vq-row">
        <section className="vq-card grow">
          <SectionHead eyebrow="Détail" title="Factures ouvertes par niveau de risque" sub="Comparez : le risque ne fixe ni le rang, ni la priorité, ni le niveau de recouvrement." />
          <div className="vq-table-wrap">
            <table className="vq-table">
              <thead><tr><th>Risque</th><th>Facture</th><th className="num">Montant</th><th>Priorité · rang</th><th>Niveau</th><th>Décision</th><th /></tr></thead>
              <tbody>
                {rows.map((i) => (
                  <tr key={i.id}>
                    <td><RiskBadge value={i.risk} /></td>
                    <td><div className="strong">{byId(i.clientId)?.name}</div><div className="small">{i.id} · {i.delayLabel}</div></td>
                    <td className="num">{fcfa(i.amount)}</td>
                    <td><span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}><PriorityPill value={i.priority} /><RankTag rank={i.rank} /></span></td>
                    <td><LevelChip value={i.level} /></td>
                    <td><InvoiceOutcome invoice={i} /></td>
                    <td><button type="button" className="vq-btn sm" onClick={() => drawer.open(i.id)}>Pourquoi ?</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="vq-card" style={{ width: 340, flexShrink: 0 }}>
          <SectionHead eyebrow="Concentration" title="Encours par client" sub={`Part des créances ouvertes (${fcfa(total)} FCFA).`} />
          {conc.map((c) => {
            const p = Math.round(((c.outstanding ?? 0) / total) * 100);
            return (
              <div key={c.id} style={{ display: 'flex', flexDirection: 'column', gap: 6, borderTop: '1px solid var(--line)', paddingTop: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5 }}><strong style={{ color: 'var(--heading)' }}>{c.name}</strong><span className="vq-muted">{fcfa(c.outstanding ?? 0)} · {p} %</span></div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div style={{ flex: 1, height: 8, borderRadius: 999, background: 'var(--line)' }}><div style={{ width: `${p}%`, height: 8, borderRadius: 999, background: '#97F201' }} /></div>
                  <RiskBadge value={c.risk} />
                </div>
              </div>
            );
          })}
          <div className="vq-callout dashed"><strong>Facteurs de risque :</strong> [fournis par le moteur de risque — non affichés dans ce prototype]</div>
        </section>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
        <p className="vq-sub" style={{ maxWidth: 600, lineHeight: 1.5 }}>Le risque est un signal d’analyse. Il ne fixe ni la priorité, ni le niveau de recouvrement : ces valeurs viennent séparément du Rule Engine.</p>
        <DimensionsLegend />
      </div>
      <DecisionDrawer invoiceId={drawer.selected} onClose={drawer.close} />
    </>
  );
}

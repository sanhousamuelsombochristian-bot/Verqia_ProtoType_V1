import { Link } from 'react-router-dom';
import { useData } from '@/services/DataProvider';
import { useClients, useInvoices } from '@/hooks/useDemo';
import { dateFr, daysBetween, fcfa, millions } from '@/domain/format';
import { KpiCard, PageHeader, SectionHead } from '@/components/ui';

/** Trésorerie : solde, encaissements attendus semaine par semaine, mouvements. */
export default function Tresorerie() {
  const { data } = useData();
  const { open, all } = useInvoices();
  const { byId } = useClients();
  const k = data.kpis;

  // Semaines à partir d'aujourd'hui (lundi 28/09/2026), factures en retard isolées.
  const weeks = [0, 1, 2, 3, 4].map((w) => {
    const from = w * 7, to = from + 6;
    const amount = open.filter((i) => i.dueStatus !== 'late').filter((i) => { const d = daysBetween(data.today, i.dueDate); return d >= from && d <= to; }).reduce((s, i) => s + i.amount, 0);
    return { label: `Sem. ${40 + w}`, amount, late: false };
  });
  const late = { label: 'En retard', amount: open.filter((i) => i.dueStatus === 'late').reduce((s, i) => s + i.amount, 0), late: true };
  const bars = [...weeks, late];
  const max = Math.max(...bars.map((b) => b.amount));
  const moves = [
    ...open.filter((i) => i.dueStatus !== 'late').map((i) => ({ date: i.dueDate, who: `${byId(i.clientId)?.name} · ${i.id}`, what: i.dueStatus === 'near' ? 'Attendu · proche' : 'Attendu · à venir', amount: i.amount, paid: false })),
    ...all.filter((i) => i.dueStatus === 'paid').map((i) => ({ date: i.paidOn!, who: `${byId(i.clientId)?.name} · ${i.id}`, what: 'Encaissé', amount: i.amount, paid: true })),
  ];

  return (
    <>
      <PageHeader title="Trésorerie" sub="Ce qui est en caisse, ce qui doit rentrer, et quand." />
      <div className="vq-grid cols-4">
        <KpiCard label="Solde de trésorerie · aujourd’hui" value={fcfa(k.cashToday.value)} unit="FCFA" hint="Valeur de démonstration" />
        <KpiCard label="Encaissements attendus · 30 j" value={fcfa(k.expected30d.value)} unit="FCFA" hint="4 factures proches ou à venir" />
        <KpiCard label="Encours en retard" value={fcfa(k.late.value)} unit="FCFA" hint="3 factures · date incertaine" tone="red" />
        <KpiCard label="Trésorerie prévisionnelle · 30 j" value={fcfa(k.forecast30d.value)} unit="FCFA" hint="Scénario base · estimation" />
      </div>
      <div className="vq-row">
        <section className="vq-card grow">
          <SectionHead eyebrow="Plan d’encaissement" title="Encaissements attendus par semaine" sub="Les factures en retard sont isolées : leur date d’encaissement est incertaine." />
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, height: 240 }} role="img" aria-label="Encaissements attendus par semaine">
            {bars.map((b) => (
              <div key={b.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, justifyContent: 'flex-end', height: '100%' }}>
                <strong style={{ fontSize: 12.5, color: 'var(--heading)' }}>{b.amount ? millions(b.amount / 1e6, 2) : '0'}</strong>
                <div style={{ width: '100%', maxWidth: 88, height: Math.max(4, (b.amount / max) * 160), borderRadius: '8px 8px 2px 2px', background: b.late ? 'var(--red-bg)' : b.amount ? '#97F201' : 'var(--line)', border: b.late ? '1.5px dashed var(--red)' : 'none' }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--soft)' }}>{b.label}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="vq-card" style={{ width: 420, flexShrink: 0 }}>
          <SectionHead eyebrow="Mouvements" title="Encaissements récents et attendus" />
          {moves.map((m) => (
            <div key={m.who} className="vq-event" style={{ alignItems: 'center' }}>
              <span className="vq-sub" style={{ width: 90 }}>{dateFr(m.date)}</span>
              <div style={{ flex: 1 }}><div className="title">{m.who}</div><div className="detail">{m.what}</div></div>
              <strong style={{ color: m.paid ? 'var(--accent)' : 'var(--heading)' }}>+ {fcfa(m.amount)}</strong>
            </div>
          ))}
        </section>
      </div>
      <section className="vq-card" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
        <SectionHead eyebrow="Décaissements" title="Charges, salaires, fournisseurs" sub="Saisie ou import des décaissements : à venir. La trésorerie prévisionnelle affichée est une estimation de démonstration." />
        <Link className="vq-btn" to="/app/previsions">Voir les prévisions →</Link>
      </section>
    </>
  );
}

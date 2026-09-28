import { useState } from 'react';
import { useData } from '@/services/DataProvider';
import { dateTimeShort } from '@/domain/format';
import type { EventCat } from '@/domain/types';
import { PageHeader, Tabs } from '@/components/ui';

const NAMES: Record<EventCat, string> = { decision: 'Décision du moteur', action: 'Action', hold: 'Mise en attente', promesse: 'Promesse', paiement: 'Paiement', facture: 'Facture' };
const TABS: { key: 'tous' | EventCat; label: string }[] = [
  { key: 'tous', label: 'Tous' }, { key: 'decision', label: 'Décisions' }, { key: 'action', label: 'Actions' }, { key: 'hold', label: 'Mises en attente' },
  { key: 'promesse', label: 'Promesses' }, { key: 'paiement', label: 'Paiements' }, { key: 'facture', label: 'Factures' },
];

/** Événements : journal complet, filtrable par catégorie. */
export default function Evenements() {
  const { data } = useData();
  const [cat, setCat] = useState<'tous' | EventCat>('tous');
  const events = data.events.filter((e) => cat === 'tous' || e.cat === cat);

  return (
    <>
      <PageHeader title="Événements" sub="Le journal complet : décisions du moteur, actions, promesses, paiements et factures." actions={<button type="button" className="vq-btn">Exporter le journal</button>} />
      <section className="vq-card" style={{ gap: 0 }}>
        <Tabs label="Filtrer les événements" value={cat} onChange={setCat} tabs={TABS.map((t) => ({ ...t, count: t.key === 'tous' ? data.events.length : data.events.filter((e) => e.cat === t.key).length }))} />
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {events.map((e, i) => (
            <li key={i} style={{ display: 'flex', gap: 14, alignItems: 'center', borderBottom: '1px solid var(--line)', padding: '11px 4px', flexWrap: 'wrap' }}>
              <time style={{ width: 110, fontSize: 12.5, color: 'var(--muted)' }}>{dateTimeShort(e.at)}</time>
              <span className={`vq-dot tone-${e.tone}`} style={{ width: 9, height: 9 }} />
              <div style={{ flex: 1, minWidth: 200 }}><strong style={{ color: 'var(--heading)' }}>{e.title}</strong><span className="vq-muted"> — {e.detail}</span></div>
              <span className="vq-chip">{NAMES[e.cat]}</span>
            </li>
          ))}
        </ul>
        <p className="vq-sub" style={{ paddingTop: 10 }}>Journal en lecture seule. Les événements métier alimentent le Rule Engine, qui recalcule ses décisions.</p>
      </section>
    </>
  );
}

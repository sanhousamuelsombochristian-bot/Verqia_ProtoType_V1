import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LEXIQUE } from '@/domain/lexique';
import { PageHeader, Tabs } from '@/components/ui';

type GroupKey = keyof typeof LEXIQUE.groups;

/** Lexique VERQIA : le vocabulaire métier (source : shared/lexique.json). */
export default function Lexique() {
  const [g, setG] = useState<'tous' | GroupKey>('tous');
  const groups = Object.entries(LEXIQUE.groups) as [GroupKey, string][];
  const rows = LEXIQUE.entries.filter((e) => g === 'tous' || e.group === g);

  return (
    <>
      <PageHeader title="Lexique VERQIA" sub="Le vocabulaire métier : un terme affiché, un code moteur, une définition." actions={<Link className="vq-btn" to="/app/aide">← Retour à l’aide</Link>} />
      <div className="vq-grid cols-3">
        {[['Un terme = un sens', 'Le même libellé partout : site, espace client, e-mails, support.'], ['Libellé en français, code en détail', 'Les codes moteur n’apparaissent que dans les panneaux de décision.'], ['Aucun terme inventé', 'Ce qui n’est pas encore défini reste entre crochets : [à définir].']].map(([t, d]) => (
          <div key={t} className="vq-tile"><strong style={{ color: 'var(--heading)' }}>{t}</strong><span className="vq-sub">{d}</span></div>
        ))}
      </div>
      <section className="vq-card" style={{ gap: 0 }}>
        <Tabs label="Groupes du lexique" value={g} onChange={setG} tabs={[{ key: 'tous' as const, label: 'Tous', count: LEXIQUE.entries.length }, ...groups.map(([k, l]) => ({ key: k, label: l, count: LEXIQUE.entries.filter((e) => e.group === k).length }))]} />
        <div className="vq-table-wrap">
          <table className="vq-table">
            <thead><tr><th>Terme affiché</th><th>Code moteur</th><th>Définition</th><th>À ne pas dire</th></tr></thead>
            <tbody>
              {rows.map((e) => (
                <tr key={e.group + e.term}>
                  <td><div className="strong">{e.term}</div><div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--accent)' }}>{LEXIQUE.groups[e.group as GroupKey]}</div></td>
                  <td className="vq-mono" style={{ fontSize: 12.5, color: 'var(--muted2)' }}>{e.code || '—'}</td>
                  <td style={{ lineHeight: 1.5 }}>{e.definition}</td>
                  <td style={{ color: 'var(--red-text)', textDecoration: e.avoid ? 'line-through' : 'none' }}>{e.avoid}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

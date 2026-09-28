import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/ui';

export const FAQ = [
  { q: 'Pourquoi une facture à risque critique n’est-elle pas la première à traiter ?', a: 'Risque, priorité et niveau de recouvrement sont trois dimensions indépendantes. L’ordre « À traiter maintenant » suit le rang (rank_score), puis la priorité, puis l’échéance — jamais le montant, ni le risque seul.' },
  { q: 'Que signifie « Différée » ?', a: 'Le Rule Engine a retourné DEFER : l’action attend, par exemple à cause d’une mise en attente active. Elle sera réévaluée à la date de réessai prévue (retry_at).' },
  { q: 'Une action « Supprimée » est-elle une erreur ?', a: 'Non. SUPPRESS est une décision métier du moteur, expliquée par un code de suppression. Rien n’a échoué techniquement ; l’état « Échouée » (FAILED) est distinct.' },
  { q: 'Qu’est-ce qu’un override ?', a: 'Un utilisateur autorisé peut overrider une exception. L’override est une preuve, pas une autorité : il est revérifié au moment de l’exécution.' },
  { q: 'Que se passe-t-il quand une approbation est requise ?', a: 'L’action n’est pas exécutée automatiquement. Elle apparaît dans Recouvrement › Approbations jusqu’à la décision d’un utilisateur habilité.' },
  { q: 'Que représente le niveau de recouvrement (L1, L2…) ?', a: 'C’est le collection_level retourné par le moteur. Pour une facture en retard, il ne descend pas sous L3 (plancher) et ne régresse pas.' },
  { q: 'Quelle différence entre « Prendre en charge » et « Clôturer » ?', a: '« Prendre en charge » (ClaimTask) vous attribue une tâche manuelle : son état devient Prise en charge. « Clôturer » (CompleteTask) la termine : son état devient Clôturée.' },
  { q: 'Les tarifs sont-ils définitifs ?', a: 'Non. Les tarifs de lancement sont indicatifs et temporaires ; ils peuvent changer à tout moment.' },
];

/** Aide : guides, FAQ du vocabulaire métier, lien vers le lexique. */
export default function Aide() {
  const [open, setOpen] = useState(0);
  return (
    <>
      <PageHeader title="Aide" sub="Guides, questions fréquentes et lexique du vocabulaire métier." />
      <div className="vq-grid cols-3">
        <Link to="/app/lexique" className="vq-card" style={{ textDecoration: 'none', background: 'var(--a12)', borderColor: 'var(--a-border)' }}>
          <div className="vq-eyebrow">Référence</div><div className="vq-h2" style={{ fontSize: 19 }}>Lexique VERQIA →</div><div className="vq-sub">Chaque terme affiché, son code moteur et sa définition.</div>
        </Link>
        <Link to="/app" className="vq-card" style={{ textDecoration: 'none' }}>
          <div className="vq-eyebrow">Guide</div><div className="vq-h2" style={{ fontSize: 19 }}>Lire une décision →</div><div className="vq-sub">Ouvrez « Pourquoi ? » sur une action de la vue d’ensemble.</div>
        </Link>
        <div className="vq-card"><div className="vq-eyebrow">Contact</div><div className="vq-h2" style={{ fontSize: 19 }}>Équipe VERQIA</div><div className="vq-sub">E-mail : à compléter · Téléphone : à compléter</div></div>
      </div>
      <section className="vq-card" style={{ gap: 0 }}>
        <div className="vq-eyebrow" style={{ marginBottom: 8 }}>Questions fréquentes</div>
        {FAQ.map((f, i) => (
          <div key={f.q} style={{ borderTop: '1px solid var(--line)' }}>
            <button type="button" aria-expanded={open === i} onClick={() => setOpen(open === i ? -1 : i)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', gap: 16, padding: '16px 0', border: 'none', background: 'none', fontSize: 15.5, fontWeight: 700, color: 'var(--heading)', textAlign: 'left', cursor: 'pointer' }}>
              {f.q}<span style={{ color: 'var(--accent)', fontSize: 20 }}>{open === i ? '−' : '+'}</span>
            </button>
            {open === i && <p style={{ padding: '0 0 16px', lineHeight: 1.6, maxWidth: 860, color: 'var(--soft)' }}>{f.a}</p>}
          </div>
        ))}
      </section>
    </>
  );
}

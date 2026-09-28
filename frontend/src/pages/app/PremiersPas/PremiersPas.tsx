import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/ui';

const STEPS = [
  { k: 'imp', title: 'Importez vos factures', desc: 'Un fichier Excel ou CSV suffit. Vos outils actuels restent en place.', cta: 'Importer', to: '/app/import' },
  { k: 'canaux', title: 'Choisissez vos canaux', desc: 'WhatsApp, SMS, e-mail : activez ceux que vos clients utilisent.', cta: 'Paramètres', to: '/app/parametres' },
  { k: 'seq', title: 'Activez votre séquence de relance', desc: 'Chaque envoi reste soumis à la décision du Rule Engine.', cta: 'Automatisations', to: '/app/automatisations' },
  { k: 'vue', title: 'Voyez ce qu’il faut traiter maintenant', desc: 'Les actions classées par priorité calculée — le moment magique.', cta: 'Vue d’ensemble', to: '/app' },
];

/** Premiers pas : parcours d'accueil après l'inscription. */
export default function PremiersPas() {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const n = STEPS.filter((s) => done[s.k]).length;
  return (
    <>
      <PageHeader title="Bienvenue sur VERQIA PILOT" sub="Quatre étapes pour passer de vos factures à ce qu’il faut traiter maintenant." />
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, marginBottom: 8 }}><span className="vq-muted">Progression</span><strong>{n} / 4 étapes</strong></div>
        <div className="vq-progress" role="progressbar" aria-valuenow={n} aria-valuemin={0} aria-valuemax={4}><div style={{ width: `${n * 25}%` }} /></div>
      </div>
      {STEPS.map((s, i) => (
        <div key={s.k} className="vq-card" style={{ flexDirection: 'row', alignItems: 'center', gap: 18, flexWrap: 'wrap', borderColor: done[s.k] ? 'var(--a-border)' : undefined }}>
          <span style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid var(--a-border)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, background: done[s.k] ? '#97F201' : 'transparent', color: done[s.k] ? '#1C1C1C' : 'var(--accent)' }}>{done[s.k] ? '✓' : i + 1}</span>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--heading)', textDecoration: done[s.k] ? 'line-through' : 'none' }}>{s.title}</div>
            <div className="vq-muted">{s.desc}</div>
          </div>
          <button type="button" className="vq-btn" aria-pressed={!!done[s.k]} onClick={() => setDone({ ...done, [s.k]: !done[s.k] })}>{done[s.k] ? 'Marquer à faire' : 'Marquer comme fait'}</button>
          <Link className="vq-btn primary" to={s.to}>{s.cta} →</Link>
        </div>
      ))}
      <p className="vq-sub">Programme pilote : quelques semaines d’utilisation réelle sur vos propres créances, avec une mesure avant / après.</p>
    </>
  );
}

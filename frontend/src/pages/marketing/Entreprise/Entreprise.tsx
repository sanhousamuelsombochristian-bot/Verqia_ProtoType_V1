import { Link } from 'react-router-dom';

const VALUES = [
  ['Précision', 'Des chiffres exacts, jamais approximatifs.'], ['Contrôle', 'Le dirigeant garde la main sur chaque action.'],
  ['Visibilité', 'Voir ce qui doit rentrer, d’un coup d’œil.'], ['Mouvement', 'Faire avancer chaque créance vers l’encaissement.'],
  ['Décision', 'Savoir quoi faire, pour qui, et quand.'], ['Trésorerie', 'L’argent encaissé, pas seulement l’argent vendu.'],
  ['Intelligence', 'Des indicateurs utiles, pas décoratifs.'], ['Fiabilité', 'Des données traçables et bien protégées.'],
];
const PROOF = [
  ['Problème', 'L’entreprise reconnaît une douleur réelle et fréquente.'], ['Intérêt', 'Elle veut voir ou tester une solution.'],
  ['Utilisation', 'Elle utilise réellement le produit plusieurs semaines.'], ['Paiement', 'Elle paie et accepte de continuer : le signal le plus fort.'],
];
const ROADMAP = ['Comprendre', 'Choisir', 'Prototyper', 'Tester', 'Mesurer', 'Monétiser', 'Stabiliser', 'Scaler'];
const COMMITMENTS = [
  ['Pas de promesse chiffrée sans mesure', 'Les gains seront mesurés chez nos entreprises pilotes, avant et après.'],
  ['Des tarifs annoncés clairement', 'Nos tarifs actuels sont indicatifs et peuvent évoluer : nous le disons.'],
  ['Vos données, sérieusement', 'Une gestion rigoureuse des accès et des données, dès le MVP.'],
];

/** Entreprise : mission, vision, valeurs, démarche, feuille de route. */
export default function Entreprise() {
  return (
    <>
      <section className="vq-section">
        <div className="vq-eyebrow">L’entreprise</div>
        <h2 className="xl">La couche de pilotage entre la facture et <span className="vq-hl">l’encaissement.</span></h2>
        <p className="lead">VERQIA est une startup SaaS B2B née en Côte d’Ivoire. Nous construisons VERQIA PILOT, un outil de pilotage des créances, des échéances, des relances et de la récupération de trésorerie pour les PME.</p>
        <div style={{ background: '#1C1C1C', borderRadius: 20, padding: 40, display: 'flex', justifyContent: 'center' }}>
          <img src="/brand/logo-slogan.png" alt="VERQIA PILOT — Pilotage de trésorerie & intelligence financière" style={{ maxHeight: 280, width: 'auto' }} />
        </div>
      </section>
      <section className="vq-section">
        <div className="vq-grid cols-2">
          <div className="vq-card"><div className="vq-eyebrow">Notre mission</div><div className="vq-h2" style={{ fontSize: 24 }}>Aider les PME à transformer leurs factures en trésorerie encaissée.</div><p className="vq-muted">Rendre la gestion des créances organisée, mesurable et progressivement automatisée, pour libérer du temps et récupérer l’argent plus vite.</p></div>
          <div className="vq-card"><div className="vq-eyebrow">Notre vision</div><div className="vq-h2" style={{ fontSize: 24 }}>Devenir une référence de la gestion du cycle d’encaissement pour les PME d’Afrique francophone.</div><p className="vq-muted">La Côte d’Ivoire est notre terrain de validation initial. L’expansion régionale viendra après validation du problème, de l’usage et du paiement.</p></div>
        </div>
        <blockquote className="vq-card" style={{ margin: 0, fontSize: 24, lineHeight: 1.4, color: 'var(--heading)' }}>
          « Nous ne voulons pas créer un logiciel que les entreprises trouvent intéressant. Nous voulons créer un outil dont elles constatent la valeur financière et qu’elles choisissent de <span className="vq-hl">payer chaque mois.</span> »
          <footer className="vq-sub" style={{ marginTop: 12 }}>— Principe fondateur de VERQIA</footer>
        </blockquote>
      </section>
      <section className="vq-section">
        <div className="vq-eyebrow">Nos valeurs</div>
        <h2>Ce qui guide chacune de nos décisions.</h2>
        <div className="vq-grid cols-4">{VALUES.map(([t, d]) => <div key={t} className="vq-card"><div className="vq-label" style={{ color: 'var(--accent)' }}>{t}</div><p>{d}</p></div>)}</div>
      </section>
      <section className="vq-section">
        <div className="vq-eyebrow">Notre démarche</div>
        <h2>Construire sur des preuves, pas sur des promesses.</h2>
        <div className="vq-grid cols-4">{PROOF.map(([t, d], i) => <div key={t} className="vq-card" style={i === 3 ? { background: 'var(--a12)', borderColor: 'var(--a-border)' } : undefined}><div className="vq-label">Étape {i + 1}</div><div className="vq-h2" style={{ fontSize: 22 }}>{t}</div><p className="vq-muted">{d}</p></div>)}</div>
      </section>
      <section className="vq-section">
        <div className="vq-eyebrow">Feuille de route</div>
        <h2>Huit étapes, chacune validée par la précédente.</h2>
        <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10 }}>
          {ROADMAP.map((r, i) => <li key={r} className="vq-tile" style={i === 0 ? { borderColor: 'var(--a-border)', background: 'var(--a12)' } : undefined}><strong style={{ color: 'var(--heading)' }}>{r}</strong><span className="vq-sub">{i === 0 ? 'Nous sommes ici' : 'À venir'}</span></li>)}
        </ol>
      </section>
      <section className="vq-section">
        <div className="vq-eyebrow">Nos engagements</div>
        <h2>Transparents dès le premier jour.</h2>
        <div className="vq-grid cols-3">{COMMITMENTS.map(([t, d]) => <div key={t} className="vq-card"><div className="vq-h2">{t}</div><p className="vq-muted">{d}</p></div>)}</div>
      </section>
      <section className="vq-section">
        <div className="vq-card" style={{ padding: 40, gap: 16 }}>
          <h2>Construisons la preuve ensemble.</h2>
          <p className="lead">Entreprise, partenaire ou investisseur : rejoignez le programme pilote ou prenez contact avec l’équipe.</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}><Link to="/inscription" className="vq-btn primary">Rejoindre le programme pilote</Link><Link to="/tarifs" className="vq-btn">Voir les tarifs</Link></div>
        </div>
      </section>
    </>
  );
}

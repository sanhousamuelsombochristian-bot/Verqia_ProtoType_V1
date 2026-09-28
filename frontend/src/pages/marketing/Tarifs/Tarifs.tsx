import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Tarifs.css';

const PLANS = [
  { name: 'Pilote', target: 'Premiers clients, phase de validation', price: '10 000 – 15 000', unit: 'FCFA / mois', cta: 'Rejoindre le pilote', highlight: true },
  { name: 'Starter', target: 'Petites structures', price: '≈ 15 000', unit: 'FCFA / mois', cta: 'Choisir' },
  { name: 'Business', target: 'PME avec plusieurs utilisateurs', price: '≈ 30 000', unit: 'FCFA / mois', cta: 'Choisir' },
  { name: 'Pro', target: 'Entreprises plus complexes', price: '50 000 – 75 000', unit: 'FCFA / mois', cta: 'Choisir' },
  { name: 'Enterprise', target: 'Multi-sites, besoins spécifiques', price: 'Sur devis', unit: '', cta: 'Nous contacter' },
];
const FAQ = [
  { q: 'Les tarifs sont-ils définitifs ?', a: 'Non. Ce sont des tarifs de lancement indicatifs, en cours de validation avec nos premières entreprises pilotes. Ils peuvent changer à tout moment.' },
  { q: 'Dois-je changer de logiciel de gestion ?', a: 'Non. VERQIA PILOT est une couche spécialisée qui fonctionne à côté de vos outils actuels : ERP, comptabilité, caisse.' },
  { q: 'Le produit est-il déjà disponible ?', a: 'VERQIA PILOT est en cours de développement. Le programme pilote permet de participer à sa construction et d’orienter ses priorités.' },
];
const AFTER = [
  ['1', 'Distribution Exemple A', '1 250 000 FCFA · 12 jours de retard', 'WhatsApp'],
  ['2', 'BTP Exemple B', '2 100 000 FCFA · échéance demain', 'E-mail'],
  ['3', 'Cabinet Exemple C', '780 000 FCFA · promesse non tenue', 'Appel'],
  ['4', 'Maintenance Exemple D', '450 000 FCFA · 21 jours de retard', 'WhatsApp'],
];

/** Moment magique (avant / après) et tarifs de lancement temporaires. */
export default function Tarifs() {
  const [after, setAfter] = useState(false);
  const [open, setOpen] = useState(0);
  return (
    <>
      <section className="vq-section">
        <div className="vq-eyebrow">Le moment magique</div>
        <h2 className="xl">Du chaos à la clarté, <span className="vq-hl">en un clic.</span></h2>
        <p className="lead">Voici la journée d’un dirigeant avant et avec VERQIA PILOT. Cliquez sur le bouton pour voir la différence.</p>
        <div className="vq-seg" role="group" aria-label="Avant ou après" style={{ alignSelf: 'flex-start' }}>
          <button type="button" aria-pressed={!after} onClick={() => setAfter(false)}>Avant</button>
          <button type="button" aria-pressed={after} onClick={() => setAfter(true)}>Avec VERQIA PILOT</button>
        </div>
        <div className="vq-magic">
          <span className="vq-sub">Données fictives de démonstration</span>
          {!after ? (
            <div className="chaos">
              <div className="vq-tile"><div className="vq-label">Excel</div><strong>Factures_2026_v3_FINAL.xlsx</strong><span>Client A · 1 250 000 · ?</span><span>Client B · ?? · moitié ?</span><span>Client C · 780 000 · à voir</span></div>
              <div className="vq-tile"><div className="vq-label">WhatsApp</div><span>« Bonjour, je vous paie la semaine prochaine. »</span><span>« C’était déjà prévu la semaine dernière… »</span><span>« Vous pouvez renvoyer la facture ? »</span></div>
              <div className="vq-tile"><div className="vq-label">Cahier</div><span>Relancer Client B ??</span><span>Client A a payé la moitié ?</span><span>Appeler lundi (ou mardi)</span></div>
              <div className="vq-tile"><div className="vq-label">E-mails</div><span>RE: RE: Facture n°0142</span><span>Relance facture — urgent</span><span>+ 23 non lus</span></div>
              <div className="questions">{['Combien va rentrer ce mois-ci ?', 'Qui relancer en premier ?', 'Qui a promis de payer ?'].map((q) => <span key={q} className="vq-chip">{q}</span>)}</div>
              <button type="button" className="vq-btn primary" onClick={() => setAfter(true)}>Activer VERQIA PILOT →</button>
            </div>
          ) : (
            <div className="clarity">
              <div className="vq-grid cols-3">
                <div className="vq-kpi"><div className="label">À recevoir · 30 jours</div><div className="value">7 640 000 <span className="unit">FCFA</span></div></div>
                <div className="vq-kpi"><div className="label red">Dont en retard</div><div className="value">2 480 000 <span className="unit">FCFA</span></div></div>
                <div className="vq-kpi"><div className="label">À traiter maintenant</div><div className="value">4 <span className="unit">clients</span></div></div>
              </div>
              <div className="vq-eyebrow">À traiter maintenant — par priorité calculée</div>
              {AFTER.map(([n, c, d, ch]) => (
                <div key={n} className="vq-event" style={{ alignItems: 'center' }}>
                  <span className="vq-rank">{n}</span>
                  <div style={{ flex: 1 }}><div className="title">{c}</div><div className="detail">{d}</div></div>
                  <span className="vq-chip ok">{ch}</span>
                </div>
              ))}
              <strong style={{ color: 'var(--heading)' }}>Combien, quand, que faire : tout est clair.</strong>
              <button type="button" className="vq-btn" onClick={() => setAfter(false)}>Revoir l’avant</button>
            </div>
          )}
        </div>
      </section>

      <section className="vq-section">
        <h2>Et tout cela, avec un abonnement mensuel simple.</h2>
        <div className="vq-callout amber filled"><span className="title-amber">Tarifs de lancement indicatifs et temporaires.</span> Ils sont en cours de validation avec nos premières entreprises et peuvent changer à tout moment.</div>
        <div className="vq-plans">
          {PLANS.map((p) => (
            <div key={p.name} className={`vq-card ${p.highlight ? 'hl' : ''}`}>
              <div className="vq-h2" style={{ fontSize: 22 }}>{p.name}</div>
              <div className="vq-sub">{p.target}</div>
              <div className="price">{p.price} <span className="vq-sub">{p.unit}</span></div>
              <Link to="/inscription" className={`vq-btn ${p.highlight ? 'primary' : ''}`}>{p.cta}</Link>
            </div>
          ))}
        </div>
        <p className="vq-sub">Le contenu détaillé de chaque offre sera précisé à l’issue du programme pilote.</p>
      </section>

      <section className="vq-section">
        <div className="vq-eyebrow">Questions fréquentes</div>
        <h2>Ce que vous voulez savoir.</h2>
        <div className="vq-card" style={{ gap: 0 }}>
          {FAQ.map((f, i) => (
            <div key={f.q} style={{ borderTop: i ? '1px solid var(--line)' : 'none' }}>
              <button type="button" aria-expanded={open === i} onClick={() => setOpen(open === i ? -1 : i)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', padding: '18px 0', border: 'none', background: 'none', fontSize: 17, fontWeight: 700, color: 'var(--heading)', cursor: 'pointer', textAlign: 'left' }}>
                {f.q}<span style={{ color: 'var(--accent)' }}>{open === i ? '−' : '+'}</span>
              </button>
              {open === i && <p style={{ paddingBottom: 18, color: 'var(--soft)', lineHeight: 1.6 }}>{f.a}</p>}
            </div>
          ))}
        </div>
      </section>

      <section className="vq-section">
        <div className="vq-card" style={{ padding: 40, gap: 16 }}>
          <h2>Prêt à vivre le moment magique chez vous ?</h2>
          <p className="lead">Rejoignez le programme pilote et mesurez la différence sur vos propres créances.</p>
          <div><Link to="/inscription" className="vq-btn primary">Devenir entreprise pilote</Link></div>
        </div>
      </section>
    </>
  );
}

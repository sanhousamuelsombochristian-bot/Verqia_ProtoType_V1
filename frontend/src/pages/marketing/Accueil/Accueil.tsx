import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Accueil.css';

const QUESTIONS = ['Combien vais-je encaisser ?', 'Quand vais-je l’encaisser ?', 'Que dois-je faire maintenant ?'];
const PAINS = [
  ['Factures dispersées', 'Suivies à la main ou dans plusieurs outils à la fois.'],
  ['Échéances suivies trop tard', 'Oubliées, ou traitées une fois le retard installé.'],
  ['Relances manuelles', 'Une par une, par téléphone, WhatsApp, SMS ou e-mail.'],
  ['Informations éclatées', 'Entre Excel, WhatsApp, les e-mails, les cahiers et les logiciels.'],
  ['Faible visibilité', 'Pas de vue simple de l’argent réellement attendu.'],
  ['Temps perdu', 'Des heures d’équipe absorbées par un suivi répétitif.'],
];
const FEATURES = [
  ['Clients', 'Fiches, coordonnées et historique au même endroit.'],
  ['Factures', 'Montant, échéance, statut, paiement partiel ou complet.'],
  ['Relances', 'Planifiées, puis automatisées progressivement.'],
  ['Priorisation', 'Les actions à traiter maintenant, classées par priorité calculée.'],
  ['Prévision', 'Les encaissements attendus à court terme.'],
  ['Historique', 'Relances, promesses et paiements tracés.'],
  ['Paiements · à venir', 'Connexion progressive aux moyens de paiement disponibles.'],
  ['Analytique', 'Délai moyen d’encaissement, retards, évolution.'],
];
const STEPS = [
  ['Centralisez', 'Importez ou saisissez vos clients et vos factures.'],
  ['Suivez', 'Chaque échéance a un statut : à venir, proche, en retard, payée.'],
  ['Relancez au bon moment', 'Des actions classées par priorité calculée, avec vos modèles de messages.'],
  ['Encaissez et prévoyez', 'Constatez les paiements et anticipez la trésorerie à venir.'],
];
const SEGMENTS = [
  ['Distributeurs et grossistes', 'Beaucoup de clients, ventes à crédit fréquentes'],
  ['Services B2B', 'Facturation récurrente, échéances multiples'],
  ['BTP et fournisseurs', 'Factures importantes, délais parfois longs'],
  ['Maintenance et location', 'Contrats et paiements récurrents'],
  ['Agences et cabinets', 'Factures de prestations, suivi client'],
  ['PME avec commerciaux', 'Relances à centraliser'],
];

/** Accueil du site vitrine. */
export default function Accueil() {
  const [video, setVideo] = useState(false);
  return (
    <>
      <section className="vq-hero">
        <div className="copy">
          <span className="vq-pill-badge">Programme pilote ouvert · Côte d’Ivoire</span>
          <h1>De la facture à la <span className="vq-hl">trésorerie.</span></h1>
          <p>VERQIA PILOT centralise vos factures, suit vos échéances, priorise vos relances et vous montre ce qui va réellement rentrer — sans remplacer vos outils actuels.</p>
          <div className="ctas">
            <Link to="/inscription" className="vq-btn primary lg">Rejoindre le programme pilote →</Link>
            <Link to="/tarifs" className="vq-btn lg">Voir le moment magique</Link>
          </div>
          <small className="vq-muted">Pour les PME et TPE B2B qui vendent à crédit.</small>
        </div>
        <div className="mock" aria-label="Aperçu de la vue d’ensemble (données d’exemple)">
          <div className="mock-head">VERQIA PILOT — Vue d’ensemble <span className="vq-sub">Aperçu · données d’exemple</span></div>
          <div className="vq-grid cols-2">
            <div className="vq-kpi"><div className="label">À recevoir · 30 j</div><div className="value">7,6 M <span className="unit">FCFA</span></div></div>
            <div className="vq-kpi"><div className="label red">En retard</div><div className="value">2,5 M <span className="unit">FCFA</span></div></div>
          </div>
          <div className="vq-eyebrow">À traiter maintenant</div>
          {[['#01', 'Distribution Exemple A', '1 250 000', '12 j de retard'], ['#02', 'BTP Exemple B', '2 100 000', 'Échéance demain'], ['#03', 'Cabinet Exemple C', '780 000', '5 j de retard']].map(([r, c, m, d]) => (
            <div key={r} className="mock-row"><span className="vq-rank">{r}</span><strong>{c}</strong><span>{m}</span><span className="vq-sub">{d}</span></div>
          ))}
        </div>
      </section>

      <section className="vq-section">
        <div className="vq-grid cols-3">
          {QUESTIONS.map((q, i) => <div key={q} className="vq-card"><span className="vq-rank">0{i + 1}</span><div className="vq-h2" style={{ fontSize: 22 }}>{q}</div></div>)}
        </div>
      </section>

      <section className="vq-section">
        <div className="vq-eyebrow">Le problème</div>
        <h2>Vous avez vendu. Mais savez-vous ce qui va vraiment rentrer ?</h2>
        <p className="lead">Dans beaucoup de PME, une vente ne devient pas tout de suite de la trésorerie. Entre la facture et l’encaissement, l’information se disperse.</p>
        <div className="vq-grid cols-3">{PAINS.map(([t, d]) => <div key={t} className="vq-card"><div className="vq-h2">{t}</div><p className="vq-muted">{d}</p></div>)}</div>
      </section>

      <section className="vq-section">
        <div className="vq-eyebrow">En vidéo</div>
        <h2>Découvrez VERQIA PILOT en action</h2>
        <p className="lead">La vidéo de présentation arrive bientôt.</p>
        <button type="button" className="vq-video" onClick={() => setVideo(true)} aria-label="Lire la vidéo de présentation">
          <span className="play" aria-hidden>▶</span>
          <span>De la facture à la trésorerie, en quelques minutes</span>
        </button>
        {video && (
          <div className="vq-callout lime" role="dialog" aria-label="Vidéo">
            Emplacement réservé : votre vidéo sera intégrée ici. <button type="button" className="vq-btn sm" onClick={() => setVideo(false)}>Fermer</button>
          </div>
        )}
      </section>

      <section className="vq-section">
        <div className="vq-eyebrow">Fonctionnalités</div>
        <h2>Tout le cycle d’encaissement, dans un seul outil.</h2>
        <div className="vq-grid cols-4">{FEATURES.map(([t, d]) => <div key={t} className="vq-card"><span className="vq-dot tone-lime" style={{ borderRadius: 2 }} /><div className="vq-h2">{t}</div><p className="vq-muted">{d}</p></div>)}</div>
      </section>

      <section className="vq-section">
        <div className="vq-eyebrow">Comment ça marche</div>
        <h2>Quatre étapes, de la facture à l’encaissement.</h2>
        <div className="vq-grid cols-4">{STEPS.map(([t, d], i) => <div key={t} className="vq-card"><span className="vq-rank">0{i + 1}</span><div className="vq-h2">{t}</div><p className="vq-muted">{d}</p></div>)}</div>
      </section>

      <section className="vq-section">
        <div className="vq-eyebrow">Pour qui</div>
        <h2>Pensé pour les PME B2B qui vendent à crédit.</h2>
        <p className="lead">Des entreprises avec des factures, des échéances, des créances clients et des relances à organiser.</p>
        <div className="vq-grid cols-3">{SEGMENTS.map(([t, d]) => <div key={t} className="vq-card"><div className="vq-h2">{t}</div><p className="vq-muted">{d}</p></div>)}</div>
      </section>

      <section className="vq-section">
        <div className="vq-eyebrow">Le moment magique</div>
        <h2>Voyez vos créances passer du chaos à la clarté.</h2>
        <p className="lead">Un clic, et vos factures éparpillées deviennent une liste claire : qui relancer, combien, et quand.</p>
        <div><Link to="/tarifs" className="vq-btn primary lg">Vivre le moment magique →</Link></div>
      </section>

      <section className="vq-section">
        <div className="vq-eyebrow">Notre mission</div>
        <h2>« Nous aidons les PME à transformer leurs factures en <span className="vq-hl">trésorerie encaissée</span>. »</h2>
        <Link to="/entreprise" className="vq-link">Découvrir l’entreprise, sa mission et sa vision →</Link>
      </section>

      <section className="vq-section">
        <div className="vq-card vq-cta">
          <h2>Rejoignez le programme pilote.</h2>
          <p className="lead">Nous recherchons des PME B2B en Côte d’Ivoire pour tester VERQIA PILOT pendant quelques semaines et mesurer ensemble l’évolution de leurs encaissements.</p>
          <div className="ctas"><Link to="/inscription" className="vq-btn primary lg">Devenir entreprise pilote</Link><Link to="/connexion" className="vq-btn lg">J’ai déjà un compte</Link></div>
        </div>
      </section>
    </>
  );
}

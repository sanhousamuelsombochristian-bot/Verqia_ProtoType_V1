import { Link, useNavigate } from 'react-router-dom';
import { AuthShell } from '../AuthShell';

const SECTORS = ['Distribution / grossiste', 'Services B2B', 'BTP / fournisseur', 'Maintenance / location', 'Agence / cabinet', 'Autre'];
const SIZES = ['1 à 5 personnes', '6 à 20 personnes', '21 à 50 personnes', 'Plus de 50 personnes'];

/** Inscription au programme pilote → Premiers pas. */
export default function Inscription() {
  const navigate = useNavigate();
  return (
    <AuthShell>
      <form onSubmit={(e) => { e.preventDefault(); navigate('/app/premiers-pas'); }}>
        <span className="vq-chip ok" style={{ alignSelf: 'flex-start' }}>Programme pilote</span>
        <div><h1>Créer votre compte</h1><p className="vq-muted">Quelques semaines d’utilisation réelle sur vos propres créances, avec une mesure avant / après.</p></div>
        <div className="vq-grid cols-2">
          <div className="vq-field"><label htmlFor="nom">Nom complet</label><input id="nom" className="vq-input" placeholder="Prénom Nom" autoComplete="name" /></div>
          <div className="vq-field"><label htmlFor="ent">Entreprise</label><input id="ent" className="vq-input" placeholder="Nom de l’entreprise" autoComplete="organization" /></div>
          <div className="vq-field"><label htmlFor="sec">Secteur d’activité</label><select id="sec" className="vq-input">{SECTORS.map((s) => <option key={s}>{s}</option>)}</select></div>
          <div className="vq-field"><label htmlFor="taille">Taille de l’équipe</label><select id="taille" className="vq-input">{SIZES.map((s) => <option key={s}>{s}</option>)}</select></div>
          <div className="vq-field"><label htmlFor="mail">E-mail professionnel</label><input id="mail" type="email" className="vq-input" placeholder="vous@entreprise.ci" autoComplete="email" /></div>
          <div className="vq-field"><label htmlFor="tel">Téléphone / WhatsApp</label><input id="tel" type="tel" className="vq-input" placeholder="+225 …" autoComplete="tel" /></div>
          <div className="vq-field"><label htmlFor="mdp">Mot de passe</label><input id="mdp" type="password" className="vq-input" autoComplete="new-password" /></div>
          <div className="vq-field"><label htmlFor="mdp2">Confirmer le mot de passe</label><input id="mdp2" type="password" className="vq-input" autoComplete="new-password" /></div>
        </div>
        <p className="vq-sub">Tarif temporaire, susceptible de changer à tout moment.</p>
        <button type="submit" className="vq-btn primary" style={{ height: 54, fontSize: 17 }}>Créer mon compte →</button>
        <div style={{ textAlign: 'center', color: 'var(--muted2)' }}>Déjà inscrit ? <Link to="/connexion" className="vq-link">Connexion</Link></div>
      </form>
    </AuthShell>
  );
}

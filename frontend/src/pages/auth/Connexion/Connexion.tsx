import { Link, useNavigate } from 'react-router-dom';
import { AuthShell } from '../AuthShell';

/** Connexion (prototype : aucune authentification réelle). */
export default function Connexion() {
  const navigate = useNavigate();
  return (
    <AuthShell>
      <form onSubmit={(e) => { e.preventDefault(); navigate('/app'); }}>
        <div><h1>Connexion</h1><p className="vq-muted">Accédez à votre espace VERQIA PILOT. Votre vue d’ensemble répond à ces trois questions, chaque jour.</p></div>
        <div className="vq-field"><label htmlFor="email">E-mail professionnel</label><input id="email" type="email" className="vq-input" placeholder="vous@entreprise.ci" autoComplete="email" /></div>
        <div className="vq-field"><label htmlFor="mdp">Mot de passe</label><input id="mdp" type="password" className="vq-input" placeholder="••••••••" autoComplete="current-password" /></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
          <label style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--muted2)' }}><input type="checkbox" style={{ accentColor: '#97F201', width: 18, height: 18 }} />Se souvenir de moi</label>
          <a href="#" className="vq-link">Mot de passe oublié ?</a>
        </div>
        <button type="submit" className="vq-btn primary" style={{ height: 54, fontSize: 17 }}>Se connecter</button>
        <div style={{ textAlign: 'center', color: 'var(--muted2)' }}>Pas encore de compte ? <Link to="/inscription" className="vq-link">Créer un compte</Link></div>
        <Link to="/" style={{ textAlign: 'center', color: 'var(--muted)', textDecoration: 'none', fontSize: 14 }}>← Retour au site</Link>
      </form>
    </AuthShell>
  );
}

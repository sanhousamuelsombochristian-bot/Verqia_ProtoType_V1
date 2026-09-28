import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ForgotPasswordDialog } from '@/components/forms';
import { AuthShell } from '../AuthShell';

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/** Connexion (prototype : vérifie le format, sans authentification réelle). */
export default function Connexion() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [forgot, setForgot] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!EMAIL.test(email)) return setError('Saisissez une adresse e-mail valide.');
    if (!pwd) return setError('Saisissez votre mot de passe.');
    setError(null);
    navigate('/app');
  };

  return (
    <AuthShell>
      <form onSubmit={submit} noValidate>
        <div><h1>Connexion</h1><p className="vq-muted">Accédez à votre espace VERQIA PILOT. Votre vue d’ensemble répond à ces trois questions, chaque jour.</p></div>
        <div className="vq-field"><label htmlFor="email">E-mail professionnel</label><input id="email" type="email" className="vq-input" placeholder="vous@entreprise.ci" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div className="vq-field"><label htmlFor="mdp">Mot de passe</label><input id="mdp" type="password" className="vq-input" placeholder="••••••••" autoComplete="current-password" value={pwd} onChange={(e) => setPwd(e.target.value)} /></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
          <label style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--muted2)' }}><input type="checkbox" style={{ accentColor: '#97F201', width: 18, height: 18 }} />Se souvenir de moi</label>
          <button type="button" className="vq-link" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 14 }} onClick={() => setForgot(true)}>Mot de passe oublié ?</button>
        </div>
        {error && <div role="alert" className="vq-callout amber filled">{error}</div>}
        <button type="submit" className="vq-btn primary" style={{ height: 54, fontSize: 17 }}>Se connecter</button>
        <div style={{ textAlign: 'center', color: 'var(--muted2)' }}>Pas encore de compte ? <Link to="/inscription" className="vq-link">Créer un compte</Link></div>
        <Link to="/" style={{ textAlign: 'center', color: 'var(--muted)', textDecoration: 'none', fontSize: 14 }}>← Retour au site</Link>
      </form>
      <ForgotPasswordDialog open={forgot} onClose={() => setForgot(false)} />
    </AuthShell>
  );
}

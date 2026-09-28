import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { saveSettings } from '@/services/settings';
import { AuthShell } from '../AuthShell';

const SECTORS = ['Distribution / grossiste', 'Services B2B', 'BTP / fournisseur', 'Maintenance / location', 'Agence / cabinet', 'Autre'];
const SIZES = ['1 à 5 personnes', '6 à 20 personnes', '21 à 50 personnes', 'Plus de 50 personnes'];
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/** Inscription au programme pilote → Premiers pas (prototype : aucun compte réel n'est créé). */
export default function Inscription() {
  const navigate = useNavigate();
  const [f, setF] = useState({ nom: '', ent: '', sec: SECTORS[0], taille: SIZES[0], mail: '', tel: '', mdp: '', mdp2: '' });
  const [error, setError] = useState<string | null>(null);
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (f.nom.trim().length < 2) return setError('Indiquez votre nom complet.');
    if (f.ent.trim().length < 2) return setError('Indiquez le nom de votre entreprise.');
    if (!EMAIL.test(f.mail)) return setError('Saisissez une adresse e-mail professionnelle valide.');
    if (f.mdp.length < 8) return setError('Le mot de passe doit contenir au moins 8 caractères.');
    if (f.mdp !== f.mdp2) return setError('Les deux mots de passe ne correspondent pas.');
    setError(null);
    // Pré-remplit Paramètres et Profil avec les informations saisies (sans le mot de passe).
    saveSettings('entreprise', { name: f.ent.trim(), sector: f.sec, address: '', currency: 'FCFA (XOF)', email: f.mail, whatsapp: f.tel });
    const [prenom, ...rest] = f.nom.trim().split(' ');
    saveSettings('profil', { prenom, nom: rest.join(' '), mail: f.mail, tel: f.tel, org: f.ent.trim(), role: '[rôle à définir]' });
    navigate('/app/premiers-pas');
  };

  return (
    <AuthShell>
      <form onSubmit={submit} noValidate>
        <span className="vq-chip ok" style={{ alignSelf: 'flex-start' }}>Programme pilote</span>
        <div><h1>Créer votre compte</h1><p className="vq-muted">Quelques semaines d’utilisation réelle sur vos propres créances, avec une mesure avant / après.</p></div>
        <div className="vq-grid cols-2">
          <div className="vq-field"><label htmlFor="nom">Nom complet *</label><input id="nom" className="vq-input" placeholder="Prénom Nom" autoComplete="name" value={f.nom} onChange={set('nom')} /></div>
          <div className="vq-field"><label htmlFor="ent">Entreprise *</label><input id="ent" className="vq-input" placeholder="Nom de l’entreprise" autoComplete="organization" value={f.ent} onChange={set('ent')} /></div>
          <div className="vq-field"><label htmlFor="sec">Secteur d’activité</label><select id="sec" className="vq-input" value={f.sec} onChange={set('sec')}>{SECTORS.map((s) => <option key={s}>{s}</option>)}</select></div>
          <div className="vq-field"><label htmlFor="taille">Taille de l’équipe</label><select id="taille" className="vq-input" value={f.taille} onChange={set('taille')}>{SIZES.map((s) => <option key={s}>{s}</option>)}</select></div>
          <div className="vq-field"><label htmlFor="mail">E-mail professionnel *</label><input id="mail" type="email" className="vq-input" placeholder="vous@entreprise.ci" autoComplete="email" value={f.mail} onChange={set('mail')} /></div>
          <div className="vq-field"><label htmlFor="tel">Téléphone / WhatsApp</label><input id="tel" type="tel" className="vq-input" placeholder="+225 …" autoComplete="tel" value={f.tel} onChange={set('tel')} /></div>
          <div className="vq-field"><label htmlFor="mdp">Mot de passe *</label><input id="mdp" type="password" className="vq-input" autoComplete="new-password" value={f.mdp} onChange={set('mdp')} /></div>
          <div className="vq-field"><label htmlFor="mdp2">Confirmer le mot de passe *</label><input id="mdp2" type="password" className="vq-input" autoComplete="new-password" value={f.mdp2} onChange={set('mdp2')} /></div>
        </div>
        <p className="vq-sub">Tarif temporaire, susceptible de changer à tout moment. Prototype : aucun compte réel n’est créé.</p>
        {error && <div role="alert" className="vq-callout amber filled">{error}</div>}
        <button type="submit" className="vq-btn primary" style={{ height: 54, fontSize: 17 }}>Créer mon compte →</button>
        <div style={{ textAlign: 'center', color: 'var(--muted2)' }}>Déjà inscrit ? <Link to="/connexion" className="vq-link">Connexion</Link></div>
      </form>
    </AuthShell>
  );
}

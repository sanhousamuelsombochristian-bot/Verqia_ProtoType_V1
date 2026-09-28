import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 }}>
      <div className="vq-eyebrow">Erreur 404</div>
      <h1 className="vq-h1">Cette page n’existe pas.</h1>
      <Link to="/" className="vq-btn primary">Retour à l’accueil</Link>
    </div>
  );
}

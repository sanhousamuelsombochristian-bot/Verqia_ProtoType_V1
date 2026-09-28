import { Link } from 'react-router-dom';

/** Logo VERQIA PILOT. Le symbole lime est toujours posé sur fond sombre (tuile onyx en mode clair). */
export function Logo({ to = '/', size = 36 }: { to?: string; size?: number }) {
  return (
    <Link to={to} className="vq-logo" aria-label="VERQIA PILOT — accueil">
      <span className="vq-logo-tile" style={{ width: size, height: size }}>
        <img src="/brand/symbole.png" alt="" style={{ width: size * 0.78, height: size * 0.7 }} />
      </span>
      <span className="vq-logo-text">
        VERQIA <span>PILOT</span>
      </span>
    </Link>
  );
}

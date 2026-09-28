import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { SunIcon } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import './auth.css';

/** Mise en page commune Connexion / Inscription : panneau de marque (toujours sombre) + formulaire. */
export function AuthShell({ children }: { children: ReactNode }) {
  const { mode, toggle } = useTheme();
  return (
    <div className="vq-auth">
      <aside className="brand-panel">
        <img className="watermark" src="/brand/symbole.png" alt="" />
        <Link to="/" className="vq-logo" style={{ position: 'relative' }}>
          <img src="/brand/symbole.png" alt="" style={{ width: 36, height: 32, objectFit: 'contain' }} />
          <span className="vq-logo-text">VERQIA <span>PILOT</span></span>
        </Link>
        <div className="q">Combien vais-je encaisser, quand, et que dois-je faire <span>maintenant ?</span></div>
        <div className="tagline" style={{ color: '#9A9A9A', position: 'relative' }}>Pilotage de trésorerie &amp; intelligence financière</div>
      </aside>
      <div className="form-side">
        <button type="button" className="vq-btn sm mode" onClick={toggle}><SunIcon /> {mode === 'sombre' ? 'Mode clair' : 'Mode sombre'}</button>
        {children}
      </div>
    </div>
  );
}

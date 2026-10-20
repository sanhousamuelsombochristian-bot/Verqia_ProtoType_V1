import { Link, NavLink, Outlet } from 'react-router-dom';
import { Logo } from '../Logo';
import { SunIcon } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import './MarketingLayout.css';

/** Coquille du site vitrine : barre de navigation + pied de page. */
export function MarketingLayout() {
  const { mode, toggle } = useTheme();
  return (
    <div className="vq-site">
      <a href="#contenu" className="skip-link">Aller au contenu</a>
      <header className="vq-site-nav">
        <Logo />
        <nav aria-label="Navigation du site" className="links">
          <NavLink to="/fonctionnalites">Fonctionnalités</NavLink>
          <NavLink to="/solutions">Solutions</NavLink>
          <NavLink to="/tarifs">Tarifs</NavLink>
          <NavLink to="/ressources">Ressources</NavLink>
        </nav>
        <div className="actions">
          <button type="button" className="vq-btn sm" onClick={toggle} aria-label="Changer de mode">
            <SunIcon /> <span className="hide-sm">{mode === 'sombre' ? 'Mode clair' : 'Mode sombre'}</span>
          </button>
          <Link to="/connexion" className="vq-btn sm">Connexion</Link>
          <Link to="/inscription" className="vq-btn sm primary">Inscription</Link>
        </div>
      </header>
      <main id="contenu" tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="vq-site-footer">
        <div className="cols">
          <div>
            <Logo />
            <p>Pilotage de trésorerie &amp; intelligence financière.</p>
          </div>
          <div>
            <div className="vq-label">Produit</div>
            <Link to="/fonctionnalites">Fonctionnalités</Link>
            <Link to="/solutions">Solutions</Link>
            <Link to="/tarifs">Tarifs</Link>
            <Link to="/securite">Sécurité et confiance</Link>
            <Link to="/connexion">Espace client</Link>
          </div>
          <div>
            <div className="vq-label">Entreprise</div>
            <Link to="/entreprise">Mission &amp; vision</Link>
            <Link to="/ressources">Ressources</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/inscription">Programme pilote</Link>
          </div>
          <div>
            <div className="vq-label">Contact</div>
            <Link to="/confidentialite">Confidentialité</Link>
            <Link to="/conditions">Conditions d’utilisation</Link>
            <span>Coordonnées officielles à configurer avant publication.</span>
            <span>Côte d’Ivoire</span>
          </div>
        </div>
        <div className="legal">© 2026 VERQIA. Produit en développement — prototype.</div>
      </footer>
    </div>
  );
}

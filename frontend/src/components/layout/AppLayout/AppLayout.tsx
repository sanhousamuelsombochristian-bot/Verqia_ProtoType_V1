import { useState, type FormEvent } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Logo } from '../Logo';
import { BellIcon, MenuIcon, SunIcon } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { useData } from '@/services/DataProvider';
import { BOTTOM_NAV, MAIN_NAV, type NavItem } from './navigation';
import './AppLayout.css';

const Item = ({ item, onClick }: { item: NavItem; onClick?: () => void }) => (
  <NavLink to={item.to} end={item.to === '/app'} className="vq-nav-item" onClick={onClick}>
    <span className="dot" aria-hidden />
    {item.label}
  </NavLink>
);

/** Coquille de l'espace client : menu latéral, barre du haut, barre d'onglets mobile. */
export function AppLayout() {
  const { mode, toggle } = useTheme();
  const { source } = useData();
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  /** Recherche globale : ouvre la liste des factures filtrée (numéro ou client). */
  const search = (e: FormEvent) => {
    e.preventDefault();
    navigate(`/app/factures${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ''}`);
  };

  return (
    <div className="vq-app">
      <a href="#contenu" className="skip-link">Aller au contenu</a>

      <aside className={`vq-sidebar ${menuOpen ? 'open' : ''}`} aria-label="Menu de l’espace client">
        <Logo to="/" />
        <nav className="vq-nav" aria-label="Navigation principale">
          {MAIN_NAV.map((i) => <Item key={i.to} item={i} onClick={() => setMenuOpen(false)} />)}
        </nav>
        <div style={{ flex: 1, minHeight: 16 }} />
        <nav className="vq-nav" aria-label="Compte">
          {BOTTOM_NAV.map((i) => <Item key={i.to} item={i} onClick={() => setMenuOpen(false)} />)}
        </nav>
        <button type="button" className="vq-btn vq-mode-btn" onClick={toggle}>
          <SunIcon /> {mode === 'sombre' ? 'Mode clair' : 'Mode sombre'}
        </button>
        <div className="vq-user">
          <span className="avatar">ME</span>
          <div>
            <div className="name">Mon entreprise</div>
            <Link to="/" className="logout">Déconnexion</Link>
          </div>
        </div>
      </aside>

      <div className="vq-main">
        <header className="vq-topbar">
          <button type="button" className="vq-btn sm vq-burger" aria-label="Ouvrir le menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((o) => !o)}>
            <MenuIcon />
          </button>
          <form role="search" onSubmit={search} className="vq-search-form">
            <input type="search" className="vq-input vq-search" aria-label="Rechercher un client ou une facture" placeholder="Rechercher un client, une facture… (Entrée)" value={q} onChange={(e) => setQ(e.target.value)} />
          </form>
          <div className="vq-topbar-right">
            <span className="vq-badge-proto" title={source === 'api' ? 'Données servies par l’API Python' : 'Données locales (API non lancée)'}>
              Prototype · démo · {source === 'api' ? 'API' : 'local'}
            </span>
            <Link to="/app/evenements" className="vq-btn sm" aria-label="Notifications : voir les événements">
              <BellIcon />
            </Link>
          </div>
        </header>
        <main id="contenu" tabIndex={-1} className="vq-content" key={pathname}>
          <Outlet />
        </main>
      </div>

      <nav className="vq-tabbar" aria-label="Navigation mobile">
        {MAIN_NAV.filter((i) => i.mobile).map((i) => (
          <NavLink key={i.to} to={i.to} end={i.to === '/app'}>
            <span className="bar" aria-hidden />
            {i.label}
          </NavLink>
        ))}
        <button type="button" onClick={() => setMenuOpen(true)}>
          <span className="bar" aria-hidden />
          Plus
        </button>
      </nav>
      {menuOpen && <div className="vq-scrim" onClick={() => setMenuOpen(false)} aria-hidden />}
    </div>
  );
}

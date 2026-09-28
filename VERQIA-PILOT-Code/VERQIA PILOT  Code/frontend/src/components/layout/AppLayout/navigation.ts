/** Navigation de l'espace client — libellés du vocabulaire métier. */
export interface NavItem {
  to: string;
  label: string;
  mobile?: boolean;
}

export const MAIN_NAV: NavItem[] = [
  { to: '/app', label: 'Vue d’ensemble', mobile: true },
  { to: '/app/tresorerie', label: 'Trésorerie' },
  { to: '/app/factures', label: 'Factures', mobile: true },
  { to: '/app/clients', label: 'Clients' },
  { to: '/app/recouvrement', label: 'Recouvrement', mobile: true },
  { to: '/app/risque', label: 'Risque' },
  { to: '/app/previsions', label: 'Prévisions' },
  { to: '/app/paiements', label: 'Paiements' },
  { to: '/app/automatisations', label: 'Automatisations' },
  { to: '/app/evenements', label: 'Événements' },
];

export const BOTTOM_NAV: NavItem[] = [
  { to: '/app/parametres', label: 'Paramètres' },
  { to: '/app/profil', label: 'Profil' },
  { to: '/app/aide', label: 'Aide' },
];

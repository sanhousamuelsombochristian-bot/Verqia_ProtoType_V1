import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { MarketingLayout } from '@/components/layout/MarketingLayout';
import { AppLayout } from '@/components/layout/AppLayout';

// Chargement différé : chaque page est un morceau (chunk) séparé → premier affichage plus rapide.
const Accueil = lazy(() => import('@/pages/marketing/Accueil'));
const Entreprise = lazy(() => import('@/pages/marketing/Entreprise'));
const Tarifs = lazy(() => import('@/pages/marketing/Tarifs'));
const Connexion = lazy(() => import('@/pages/auth/Connexion'));
const Inscription = lazy(() => import('@/pages/auth/Inscription'));
const VueEnsemble = lazy(() => import('@/pages/app/VueEnsemble'));
const Tresorerie = lazy(() => import('@/pages/app/Tresorerie'));
const Factures = lazy(() => import('@/pages/app/Factures'));
const FactureDetail = lazy(() => import('@/pages/app/FactureDetail'));
const Import = lazy(() => import('@/pages/app/Import'));
const Clients = lazy(() => import('@/pages/app/Clients'));
const Recouvrement = lazy(() => import('@/pages/app/Recouvrement'));
const Risque = lazy(() => import('@/pages/app/Risque'));
const Previsions = lazy(() => import('@/pages/app/Previsions'));
const Paiements = lazy(() => import('@/pages/app/Paiements'));
const Automatisations = lazy(() => import('@/pages/app/Automatisations'));
const Evenements = lazy(() => import('@/pages/app/Evenements'));
const Parametres = lazy(() => import('@/pages/app/Parametres'));
const Profil = lazy(() => import('@/pages/app/Profil'));
const Aide = lazy(() => import('@/pages/app/Aide'));
const Lexique = lazy(() => import('@/pages/app/Lexique'));
const PremiersPas = lazy(() => import('@/pages/app/PremiersPas'));
const NotFound = lazy(() => import('@/pages/NotFound'));

const Loading = () => <div className="vq-sub" style={{ padding: 32 }} role="status">Chargement…</div>;

export default function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route element={<MarketingLayout />}>
          <Route index element={<Accueil />} />
          <Route path="entreprise" element={<Entreprise />} />
          <Route path="tarifs" element={<Tarifs />} />
        </Route>
        <Route path="connexion" element={<Connexion />} />
        <Route path="inscription" element={<Inscription />} />
        <Route path="app" element={<AppLayout />}>
          <Route index element={<VueEnsemble />} />
          <Route path="tresorerie" element={<Tresorerie />} />
          <Route path="factures" element={<Factures />} />
          <Route path="factures/:id" element={<FactureDetail />} />
          <Route path="import" element={<Import />} />
          <Route path="clients" element={<Clients />} />
          <Route path="recouvrement" element={<Recouvrement />} />
          <Route path="risque" element={<Risque />} />
          <Route path="previsions" element={<Previsions />} />
          <Route path="paiements" element={<Paiements />} />
          <Route path="automatisations" element={<Automatisations />} />
          <Route path="evenements" element={<Evenements />} />
          <Route path="parametres" element={<Parametres />} />
          <Route path="profil" element={<Profil />} />
          <Route path="aide" element={<Aide />} />
          <Route path="lexique" element={<Lexique />} />
          <Route path="premiers-pas" element={<PremiersPas />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

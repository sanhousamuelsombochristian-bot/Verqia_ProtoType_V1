# Architecture

## Vue d’ensemble

```
Navigateur ──► frontend (React + TS, Vite :5173)
                   │  /api/*  (proxy Vite en dev)
                   ▼
               backend (FastAPI :8000) ──► repository.py ──► shared/demo-data.json
                                                          └► shared/lexique.json
```

- **shared/** est la source unique des données de démonstration et du vocabulaire.
  Le frontend l’importe à la compilation ; le backend le lit au démarrage.
- **Bascule locale** : `services/DataProvider.tsx` teste `/api/health`. Si l’API répond, les tâches
  (ClaimTask / CompleteTask) passent par elle ; sinon, les mêmes transitions s’exécutent localement.

## Frontend

| Dossier | Contenu |
|---|---|
| `pages/<zone>/<Page>/` | `Page.tsx` (composant), `Page.css` (styles propres), `index.ts` (export) |
| `components/layout` | `MarketingLayout` (site), `AppLayout` (menu, barre du haut, onglets mobiles) |
| `components/ui` | `PriorityPill`, `RiskBadge`, `LevelChip`, `OutcomeTag`, `KpiCard`, `Tabs`, `Toggle`… |
| `components/decision` | `DecisionDrawer` (« Pourquoi ? »), `TaskCard` (tâches manuelles) |
| `components/charts` | `ForecastChart` (SVG, sans dépendance) |
| `domain` | `types.ts`, `lexique.ts`, `format.ts` + tests |

- Routage : `react-router-dom`, chargement différé de chaque page (`React.lazy`) → un fichier JS par page.
- Thème : attribut `data-theme="sombre|clair"` sur `<html>`, jetons CSS dans `styles/tokens.css`.
- Responsive : sous 900 px, le menu devient un tiroir et une barre d’onglets apparaît en bas.
- Accessibilité : lien « Aller au contenu », focus visible, rôles ARIA (onglets, dialogue), fermeture par Échap.

## Actions des boutons

Toutes les actions passent par `services/DataProvider.tsx` :

1. validation sur l’état courant avec `services/store.ts` (messages d’erreur en français) ;
2. si l’API Python répond : appel `POST /api/...` puis rechargement de `GET /api/state` ;
3. sinon : même fonction pure de `store.ts`, état sauvegardé dans le navigateur (`localStorage`).

`backend/app/services.py` est le miroir Python de `store.ts` (mêmes règles, mêmes messages).
Ces actions enregistrent des **faits** ; elles ne calculent jamais risque, priorité, rang ni niveau :
une facture créée reste « En attente d’évaluation par le Rule Engine ».

| Écran | Bouton | Effet |
|---|---|---|
| Barre du haut | Recherche (Entrée) | Ouvre Factures filtrées (`?q=`) |
| Clients | + Nouveau client · + Nouvelle facture (fiche) | Crée le client / la facture |
| Factures | + Nouvelle facture · Importer · Pourquoi ? | Formulaire · assistant d’import · panneau de décision |
| Fiche facture | Enregistrer un paiement · Placer une mise en attente · Ajouter la note | Paiement partiel ou total, hold, note |
| Recouvrement | Décider · Examiner · + Placer une mise en attente · Prendre en charge · Clôturer | Approbation, hold, ClaimTask / CompleteTask |
| Panneau « Pourquoi ? » | Voir la demande · Décider | Onglet Approbations · décision |
| Paiements | + Enregistrer un paiement | Paiement sur n’importe quelle facture ouverte |
| Événements | Exporter le journal (CSV) | Téléchargement lisible dans Excel |
| Paramètres | Enregistrer (entreprise, calendrier, modèle, canaux) · Réinitialiser | Préférences sauvegardées · données de démo |
| Profil | Enregistrer · Modifier le mot de passe · interrupteurs | Profil, sécurité, notifications |
| Connexion / Inscription | Se connecter · Mot de passe oublié ? · Créer mon compte | Validation des champs (prototype) |

## Backend

| Route | Rôle |
|---|---|
| `GET /api/health` | Santé du service |
| `GET /api/dashboard` | Indicateurs, file « À traiter maintenant », répartition du risque |
| `GET /api/invoices?status=` | Factures (`late`, `near`, `future`, `paid`, `open`) |
| `GET /api/invoices/queue` | File triée par rang |
| `GET /api/invoices/{id}/decision` | Décision du Rule Engine (« Pourquoi ? ») |
| `GET /api/clients`, `/api/clients/{id}` | Clients et encours |
| `GET /api/events?cat=`, `/api/promises` | Journal et promesses |
| `GET /api/tasks`, `POST /api/tasks/{id}/claim`, `/complete` | ClaimTask / CompleteTask |
| `GET /api/lexique`, `/api/scenarios` | Vocabulaire, scénarios de prévision |
| `GET /api/state` | État complet (utilisé par le frontend après chaque action) |
| `POST /api/clients` | Bouton « + Nouveau client » |
| `POST /api/invoices` | Bouton « + Nouvelle facture » (facture non évaluée par le moteur) |
| `POST /api/invoices/{id}/payments`, `GET /api/payments` | « Enregistrer un paiement » (total ou partiel) |
| `POST /api/holds`, `GET /api/holds` | « Placer une mise en attente » (facture, client, organisation) |
| `POST /api/invoices/{id}/approval` | « Décider » (approbation accordée / refusée, motif obligatoire) |
| `POST /api/invoices/{id}/notes` | « Ajouter la note » (notes internes) |
| `POST /api/_reset` | Paramètres › Réinitialiser les données de démonstration |

## Étapes suivantes suggérées

1. Remplacer `repository.py` par une base de données (PostgreSQL + SQLAlchemy).
2. Brancher le vrai Rule Engine derrière `GET /api/invoices/{id}/decision`.
3. Authentification (Connexion / Inscription sont des maquettes).
4. Import réel de fichiers Excel/CSV (backend : `openpyxl` / `pandas`).

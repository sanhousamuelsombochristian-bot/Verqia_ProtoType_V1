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

## Étapes suivantes suggérées

1. Remplacer `repository.py` par une base de données (PostgreSQL + SQLAlchemy).
2. Brancher le vrai Rule Engine derrière `GET /api/invoices/{id}/decision`.
3. Authentification (Connexion / Inscription sont des maquettes).
4. Import réel de fichiers Excel/CSV (backend : `openpyxl` / `pandas`).

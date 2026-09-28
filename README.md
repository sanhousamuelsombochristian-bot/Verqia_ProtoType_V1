# VERQIA PILOT — code source

> Pilotage de trésorerie & intelligence financière pour les PME.
> **Prototype** : toutes les données sont fictives. Les codes entre crochets (`[primary_exception]`, `[rule_ref]`…) sont des emplacements réservés au futur Rule Engine.

## Structure

```
VERQIA PILOT  Code/
├── frontend/            Application web — React 18 + TypeScript + Vite
│   ├── public/brand/    Logos (symbole, logo, logo + slogan)
│   └── src/
│       ├── pages/       UNE PAGE = UN DOSSIER (Page.tsx + Page.css + index.ts)
│       │   ├── marketing/   Accueil · Entreprise · Tarifs
│       │   ├── auth/        Connexion · Inscription
│       │   └── app/         Vue d’ensemble · Trésorerie · Factures · Fiche facture · Import
│       │                    Clients · Recouvrement · Risque · Prévisions · Paiements
│       │                    Automatisations · Événements · Paramètres · Profil · Aide
│       │                    Lexique · Premiers pas
│       ├── components/  layout/ (menus), ui/ (badges, onglets…), decision/ (« Pourquoi ? »), charts/
│       ├── domain/      Types métier, vocabulaire (lexique.ts), formatage FCFA
│       ├── services/    Client API + fournisseur de données (bascule locale si l’API est arrêtée)
│       ├── hooks/       Sélecteurs de données
│       ├── theme/       Mode sombre / clair
│       └── styles/      Jetons de design, base, composants
├── backend/             API — Python 3.11+ · FastAPI · Pydantic
│   ├── app/             main.py, models.py, repository.py, routers/
│   └── tests/           pytest (24 tests)
├── shared/              SOURCE UNIQUE : demo-data.json + lexique.json (lus par le front ET le back)
├── docs/                Architecture, vocabulaire, API
├── scripts/             installer.ps1 · demarrer.ps1 · tester.ps1 (Windows) · demarrer.sh
└── prototype-design/    Fichiers du prototype visuel (référence, lecture seule)
```

## Démarrer (Windows)

Prérequis : **Node.js 20+** et **Python 3.11+**.

```powershell
cd "C:\Users\HP\Documents\VERQIA PILOT  Code"
powershell -ExecutionPolicy Bypass -File scripts\installer.ps1   # une seule fois
powershell -ExecutionPolicy Bypass -File scripts\demarrer.ps1
```

- Site : http://localhost:5173 — espace client : http://localhost:5173/app
- API : http://127.0.0.1:8000/docs (documentation interactive)

Sans Python, le site fonctionne quand même : `cd frontend`, `npm install`, `npm run dev`.
Il utilise alors directement `shared/demo-data.json` (badge « local » en haut à droite).

## Commandes utiles

| Où | Commande | Rôle |
|---|---|---|
| frontend | `npm run dev` | Serveur de développement |
| frontend | `npm run build` | Build de production (`dist/`) |
| frontend | `npm run typecheck` | Vérification TypeScript |
| frontend | `npm test` | Tests unitaires (Vitest) |
| backend | `python -m uvicorn app.main:app --reload` | API |
| backend | `python -m pytest -q` | Tests de l’API |
| racine | `python shared/build_shared.py` | Régénère les JSON partagés |

## Règles métier respectées dans le code

1. **Le Rule Engine est l’autorité** : l’interface et l’API affichent ses décisions, ne les recalculent jamais.
2. **Risque ≠ priorité ≠ niveau de recouvrement** : trois champs, trois composants visuels distincts.
3. **Tri « À traiter maintenant »** : rang → priorité → échéance, jamais par montant (testé).
4. **Vocabulaire unique** : libellés français à l’écran, codes moteur en détail (`shared/lexique.json`).
5. **Tâches manuelles** : `ClaimTask` puis `CompleteTask` ; bloquées si une approbation est requise (testé).
6. **Boutons d’action** : nouveau client, nouvelle facture, paiement, mise en attente, approbation, notes, export CSV —
   ils enregistrent des faits et ne recalculent jamais la décision du moteur (voir `docs/ARCHITECTURE.md`).
7. **Tarifs** : indicatifs et temporaires, peuvent changer à tout moment.

Voir `docs/ARCHITECTURE.md` et `docs/VOCABULAIRE.md`.

# Vocabulaire métier VERQIA

Source : `shared/lexique.json` (40 termes). Règle : **un terme = un sens**.

| Affiché | Code moteur | Ne pas dire |
|---|---|---|
| Risque (Faible, Modéré, Élevé, Critique) | `risk_level` | urgence, gravité |
| Priorité (Basse, Moyenne, Haute, Urgente) | `priority_level` | importance du client |
| Rang | `rank_score` | classement par montant |
| Niveau de recouvrement (L1, L2…) | `collection_level` | niveau de risque, étape |
| À exécuter | `PROCEED` | validée |
| Différée | `DEFER` | en pause, bloquée |
| Supprimée | `SUPPRESS` | erreur, échec |
| Override · à revalider | `OVERRIDDEN` | forcée |
| Approbation requise | `requires_approval = true` | en attente |
| Mise en attente | `hold` (Facture / Client / Organisation) | pause, gel |
| Prendre en charge / Clôturer | `ClaimTask` / `CompleteTask` | accepter / valider |
| Statut d’échéance | À venir, Proche, En retard, Payée | overdue |

Le lexique complet est consultable dans l’application : **Aide › Lexique VERQIA** (`/app/lexique`).

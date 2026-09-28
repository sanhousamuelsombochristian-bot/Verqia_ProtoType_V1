"""Génère shared/demo-data.json et shared/lexique.json.

Source unique des données de démonstration et du vocabulaire métier VERQIA,
lue à la fois par le backend Python et par le frontend TypeScript.
Toutes les valeurs sont FICTIVES (prototype). Les codes entre crochets
(ex. [primary_exception]) sont des emplacements réservés : ils proviendront
du vrai Rule Engine.

Usage :  python shared/build_shared.py
"""
import json
from pathlib import Path

HERE = Path(__file__).parent

TODAY = "2026-09-28"

# --------------------------------------------------------------------------- factures
INVOICES = [
    dict(id="F-0142", clientId="A", amount=1250000, dueDate="2026-09-16", dueStatus="late", delayLabel="12 j de retard",
         rank=1, priority="Urgente", risk="Élevé", level="L4", outcome="PROCEED", requiresApproval=False, actionState="SCHEDULED",
         action="Relance WhatsApp · aujourd’hui", channel="WhatsApp", note="Relance WhatsApp planifiée aujourd’hui"),
    dict(id="F-0143", clientId="B", amount=2100000, dueDate="2026-09-29", dueStatus="near", delayLabel="demain",
         rank=2, priority="Haute", risk="Élevé", level="L2", outcome="PROCEED", requiresApproval=False, actionState="PROPOSED",
         action="Rappel avant échéance · e-mail", channel="E-mail", note="Promesse de paiement au 29/09"),
    dict(id="F-0144", clientId="C", amount=780000, dueDate="2026-09-23", dueStatus="late", delayLabel="5 j de retard",
         rank=3, priority="Haute", risk="Critique", level="L3", outcome="PROCEED", requiresApproval=True, actionState="PROPOSED",
         action="Appel manuel · en attente d’approbation", channel="Appel", note="Promesse rompue le 27/09"),
    dict(id="F-0145", clientId="D", amount=450000, dueDate="2026-09-07", dueStatus="late", delayLabel="21 j de retard",
         rank=4, priority="Moyenne", risk="Modéré", level="L3", outcome="DEFER", requiresApproval=False, actionState="PROPOSED",
         action="Relance différée jusqu’au 02/10/2026", channel="WhatsApp", note="Mise en attente · Négociation · portée Client"),
    dict(id="F-0146", clientId="E", amount=960000, dueDate="2026-10-02", dueStatus="near", delayLabel="dans 4 j",
         rank=5, priority="Basse", risk="Faible", level="L1", outcome="SUPPRESS", requiresApproval=False, actionState="SUPPRESSED",
         action="Rappel supprimé par le moteur", channel="E-mail", note="Code de suppression : [suppression_code]"),
    dict(id="F-0147", clientId="A", amount=1480000, dueDate="2026-10-22", dueStatus="future", delayLabel="dans 24 j",
         rank=None, priority=None, risk="Faible", level="L1", outcome=None, requiresApproval=False, actionState=None,
         action="Aucune action retournée à ce jour", channel=None, note="Aucune action retournée à ce jour"),
    dict(id="F-0148", clientId="F", amount=620000, dueDate="2026-10-24", dueStatus="future", delayLabel="dans 26 j",
         rank=6, priority="Basse", risk="Faible", level="L1", outcome="OVERRIDDEN", requiresApproval=False, actionState="RESCHEDULED",
         action="Relance manuelle replanifiée", channel="Appel", note="Override accordé · revalidé à l’exécution"),
    dict(id="F-0141", clientId="C", amount=300000, dueDate="2026-09-20", dueStatus="paid", delayLabel="payée le 26/09", paidOn="2026-09-26",
         rank=None, priority=None, risk=None, level=None, outcome=None, requiresApproval=False, actionState=None, action="Encaissée le 26/09/2026", channel=None, note="Encaissée le 26/09/2026"),
    dict(id="F-0140", clientId="E", amount=540000, dueDate="2026-09-15", dueStatus="paid", delayLabel="payée le 18/09", paidOn="2026-09-18",
         rank=None, priority=None, risk=None, level=None, outcome=None, requiresApproval=False, actionState=None, action="Encaissée le 18/09/2026", channel=None, note="Encaissée le 18/09/2026"),
    dict(id="F-0139", clientId="B", amount=1900000, dueDate="2026-09-10", dueStatus="paid", delayLabel="payée le 12/09", paidOn="2026-09-12",
         rank=None, priority=None, risk=None, level=None, outcome=None, requiresApproval=False, actionState=None, action="Encaissée le 12/09/2026", channel=None, note="Encaissée le 12/09/2026"),
]

CLIENTS = [
    dict(id="A", rank=1, name="Distribution Exemple A", priority="Urgente", risk="Élevé", level="L4"),
    dict(id="B", rank=2, name="BTP Exemple B", priority="Haute", risk="Élevé", level="L2"),
    dict(id="C", rank=3, name="Cabinet Exemple C", priority="Haute", risk="Critique", level="L3"),
    dict(id="D", rank=4, name="Maintenance Exemple D", priority="Moyenne", risk="Modéré", level="L3"),
    dict(id="E", rank=5, name="Services Exemple E", priority="Basse", risk="Faible", level="L1"),
    dict(id="F", rank=6, name="Agence Exemple F", priority="Basse", risk="Faible", level="L1"),
]

EVENTS = [
    dict(cat="decision", title="Approbation requise", detail="F-0144 · Cabinet Exemple C · appel manuel", at="2026-09-28T09:12", tone="amber"),
    dict(cat="decision", title="Action supprimée", detail="F-0146 · Services Exemple E · [suppression_code]", at="2026-09-28T08:40", tone="muted"),
    dict(cat="action", title="Relance planifiée", detail="F-0142 · Distribution Exemple A · WhatsApp", at="2026-09-28T08:30", tone="lime"),
    dict(cat="action", title="Rappel proposé", detail="F-0143 · BTP Exemple B · e-mail", at="2026-09-28T08:30", tone="mid"),
    dict(cat="decision", title="Action différée", detail="F-0145 · mise en attente Négociation jusqu’au 02/10", at="2026-09-27T17:05", tone="amber"),
    dict(cat="hold", title="Mise en attente placée", detail="Maintenance Exemple D · Négociation · portée Client", at="2026-09-27T17:00", tone="amber"),
    dict(cat="promesse", title="Promesse rompue", detail="Cabinet Exemple C · F-0144", at="2026-09-27T10:00", tone="red"),
    dict(cat="paiement", title="Paiement reçu", detail="F-0141 · Cabinet Exemple C · 300 000 FCFA", at="2026-09-26T15:22", tone="lime"),
    dict(cat="decision", title="Override accordé", detail="F-0148 · Agence Exemple F · à revalider à l’exécution", at="2026-09-26T10:30", tone="heading"),
    dict(cat="action", title="Relance manuelle replanifiée", detail="F-0148 · Agence Exemple F", at="2026-09-26T10:31", tone="mid"),
    dict(cat="promesse", title="Promesse créée", detail="BTP Exemple B · paiement annoncé le 29/09", at="2026-09-25T11:48", tone="lime"),
    dict(cat="facture", title="Facture passée en retard", detail="F-0144 · Cabinet Exemple C", at="2026-09-24T00:00", tone="red"),
    dict(cat="paiement", title="Paiement reçu", detail="F-0140 · Services Exemple E · 540 000 FCFA", at="2026-09-18T09:40", tone="lime"),
    dict(cat="facture", title="Facture passée en retard", detail="F-0142 · Distribution Exemple A", at="2026-09-17T00:00", tone="red"),
    dict(cat="paiement", title="Paiement reçu", detail="F-0139 · BTP Exemple B · 1 900 000 FCFA", at="2026-09-12T16:05", tone="lime"),
    dict(cat="facture", title="Facture passée en retard", detail="F-0145 · Maintenance Exemple D", at="2026-09-08T00:00", tone="red"),
]

# Explications « Pourquoi ? » : texte affiché, jamais recalculé par l'interface.
DECISIONS = {
    "F-0142": dict(why="Rang #01 selon le score de rang (rank_score), puis la priorité et l’échéance. La facture est en retard : le niveau de recouvrement ne descend pas sous L3 (plancher) et ne régresse pas.", traceCount=0, stepIndex=1, branch="État actuel : Planifiée (SCHEDULED)"),
    "F-0143": dict(why="Rang #02. Le risque est élevé, mais la facture n’est pas encore échue : le niveau de recouvrement retourné reste L2. Une promesse de paiement est enregistrée pour le 29/09.", traceCount=0, stepIndex=0, branch="État actuel : Proposée (PROPOSED)"),
    "F-0144": dict(why="Risque critique, mais rang #03 : la priorité est calculée séparément du risque. Une approbation est requise avant toute exécution.", traceCount=2, stepIndex=0, branch="État actuel : Proposée (PROPOSED) · approbation requise"),
    "F-0145": dict(why="Risque modéré, mais la facture est en retard : le niveau de recouvrement est au plancher L3. Une mise en attente de négociation diffère l’action.", traceCount=1, stepIndex=0, branch="Action suspendue par une mise en attente (portée : Client)",
                   hold=dict(type="NEGOTIATION", scope="CUSTOMER", retryAt="2026-10-02", cause="[cause renseignée lors de la mise en attente]")),
    "F-0146": dict(why="Le moteur a supprimé le rappel prévu. La raison est portée par le code de suppression, pas par une erreur.", traceCount=1, stepIndex=-1, branch="Branche : Supprimée (SUPPRESSED)", suppressionCode="[suppression_code]"),
    "F-0147": dict(why="Facture à venir, risque faible. Aucune action n’est retournée par le Rule Engine à ce jour.", traceCount=0, stepIndex=-2, branch=""),
    "F-0148": dict(why="Une exception a été overridée par un utilisateur autorisé. L’override sera revalidé au moment de l’exécution.", traceCount=1, stepIndex=1, branch="Action humaine : Replanifiée (RESCHEDULED)", override=True),
}

PROMISES = [
    dict(invoiceId="F-0143", clientId="B", amount=2100000, promisedFor="2026-09-29", status="EN_COURS", createdAt="2026-09-25", note="Créée le 25/09"),
    dict(invoiceId="F-0144", clientId="C", amount=780000, promisedFor=None, status="ROMPUE", createdAt=None, note="Constatée rompue le 27/09"),
]

# Tâches manuelles (cas d'usage ClaimTask / CompleteTask)
TASKS = [
    dict(id="T-F0148", invoiceId="F-0148", label="Agence Exemple F · appel de relance", state="RESCHEDULED", blockedByApproval=False),
    dict(id="T-F0144", invoiceId="F-0144", label="Cabinet Exemple C · appel manuel", state="PROPOSED", blockedByApproval=True),
]

KPIS = dict(
    expected30d=dict(value=5160000, count=4, trend="+6,1 % vs 30 j préc."),
    collectedMonth=dict(value=2740000, count=3, trend="−2,4 % vs mois préc."),
    openReceivables=dict(value=7640000, count=7),
    atRisk=dict(value=4130000, count=3, trend="+3,1 % vs 30 j préc."),
    late=dict(value=2480000, count=3),
    forecast30d=dict(value=9850000, scenario="base", note="estimation"),
    cashToday=dict(value=9000000, note="valeur de démonstration"),
)

SCENARIOS = dict(start=9.0, slopes=dict(pess=0.010, base=0.029, opt=0.045), note="Courbes illustratives — méthode de calcul à définir.")

demo = dict(today=TODAY, disclaimer="Données fictives de démonstration — prototype VERQIA PILOT.",
            invoices=INVOICES, clients=CLIENTS, events=EVENTS, decisions=DECISIONS,
            promises=PROMISES, tasks=TASKS, kpis=KPIS, scenarios=SCENARIOS)

# --------------------------------------------------------------------------- lexique
GROUPS = {"dim": "Dimensions", "dec": "Décision du moteur", "cyc": "Cycle de l’action", "hold": "Mise en attente",
          "task": "Tâches manuelles", "fin": "Finance & factures"}
L = [
    ["dim", "Risque", "risk_level", "Signal d’analyse : Faible, Modéré, Élevé, Critique. Ne fixe ni la priorité ni le niveau de recouvrement.", "Urgence, gravité"],
    ["dim", "Priorité", "priority_level", "Importance de l’action calculée par le moteur : Basse, Moyenne, Haute, Urgente.", "Importance du client"],
    ["dim", "Rang", "rank_score", "Position dans « À traiter maintenant ». Tri : rang, puis priorité, puis échéance — jamais le montant.", "Classement par montant"],
    ["dim", "Niveau de recouvrement", "collection_level", "Palier de recouvrement L1, L2… Plancher L3 pour une facture en retard ; pas de régression.", "Niveau de risque, étape"],
    ["dec", "Décision", "RuleDecision", "Réponse du Rule Engine pour une action. Le Rule Engine est l’autorité ; l’interface ne recalcule rien.", "Recommandation, suggestion"],
    ["dec", "À exécuter", "PROCEED", "L’action peut suivre son cycle (Proposée, Planifiée…).", "Validée, OK"],
    ["dec", "Différée", "DEFER", "L’action attend, jusqu’à la date de réessai prévue.", "En pause, bloquée"],
    ["dec", "Supprimée", "SUPPRESS", "Le moteur décide de ne pas exécuter l’action, pour une raison métier portée par un code.", "Erreur, échec"],
    ["dec", "Override · à revalider", "OVERRIDDEN", "Une exception a été overridée ; l’override est revérifié à l’exécution.", "Forcée, validée"],
    ["dec", "Approbation requise", "requires_approval = true", "Aucune exécution automatique : un utilisateur habilité doit décider.", "En attente"],
    ["dec", "Exception principale", "primary_exception", "Exception retenue en premier par le moteur pour expliquer la décision.", ""],
    ["dec", "Trace des exceptions", "exceptions_trace", "Liste des exceptions évaluées pour la décision.", ""],
    ["dec", "Code de suppression", "suppression_code", "Raison métier d’une suppression, avec son explication.", "Code d’erreur"],
    ["dec", "Réessai prévu", "retry_at", "Date à laquelle une action différée sera réévaluée.", "Relance automatique"],
    ["dec", "Règle de référence", "[rule_ref]", "Règle ayant produit la décision — identifiant à définir.", ""],
    ["cyc", "Proposée", "PROPOSED", "Action créée par la décision, pas encore planifiée.", "Suggérée"],
    ["cyc", "Planifiée", "SCHEDULED", "Action programmée à une date.", "Envoyée"],
    ["cyc", "En exécution", "EXECUTING", "Action en cours d’exécution.", ""],
    ["cyc", "Terminée", "DONE", "Action exécutée.", "Réussie, payée"],
    ["cyc", "Annulée", "CANCELLED", "Action arrêtée avant exécution.", "Supprimée"],
    ["cyc", "Supprimée", "SUPPRESSED", "Action supprimée par décision du moteur.", "Annulée, échouée"],
    ["cyc", "Échouée", "FAILED", "Exécution en échec technique.", "Supprimée"],
    ["cyc", "Prise en charge", "CLAIMED", "Tâche manuelle attribuée à un utilisateur.", "Assignée, en cours"],
    ["cyc", "Clôturée", "COMPLETED", "Tâche manuelle terminée par l’utilisateur.", "Terminée (DONE)"],
    ["cyc", "Replanifiée", "RESCHEDULED", "Tâche manuelle reportée à une nouvelle date.", "Différée"],
    ["hold", "Mise en attente", "hold", "Blocage temporaire qui diffère les actions concernées.", "Pause, gel"],
    ["hold", "Portée · Facture / Client / Organisation", "INVOICE · CUSTOMER · ORGANIZATION", "Ce que la mise en attente couvre.", ""],
    ["hold", "Suspension manuelle", "MANUAL_SUSPENSION", "Mise en attente décidée par un utilisateur.", ""],
    ["hold", "Juridique", "LEGAL", "Mise en attente pour motif juridique.", ""],
    ["hold", "Négociation", "NEGOTIATION", "Mise en attente pendant une négociation avec le client.", "Litige"],
    ["task", "Prendre en charge", "ClaimTask", "Cas d’usage : s’attribuer une tâche manuelle.", "Accepter"],
    ["task", "Clôturer", "CompleteTask", "Cas d’usage : terminer une tâche manuelle.", "Valider, fermer"],
    ["fin", "Créance", "", "Montant dû par un client au titre d’une facture.", "Dette (côté client)"],
    ["fin", "Créances ouvertes", "", "Total des factures non payées, à date.", "Impayés (si non échues)"],
    ["fin", "Encours", "", "Créances ouvertes d’un client donné.", ""],
    ["fin", "Échéance", "", "Date à laquelle une facture doit être payée.", "Deadline"],
    ["fin", "Statut d’échéance", "", "À venir, Proche, En retard, Payée. Seuil de « Proche » : [à définir].", "Overdue, due"],
    ["fin", "Encaissement", "", "Paiement reçu et rapproché d’une facture.", "Recette"],
    ["fin", "Promesse de paiement", "", "Date de paiement annoncée par le client ; peut être tenue ou rompue.", "Engagement ferme"],
    ["fin", "Trésorerie prévisionnelle", "", "Estimation du solde futur selon un scénario (pessimiste, base, optimiste).", "Solde garanti"],
]
lexique = dict(
    groups=GROUPS,
    entries=[dict(group=g, term=t, code=c, definition=d, avoid=a) for g, t, c, d, a in L],
    labels=dict(
        outcome={"PROCEED": "À exécuter", "DEFER": "Différée", "SUPPRESS": "Supprimée", "OVERRIDDEN": "Override · à revalider", "APPROVAL": "Approbation requise", "NONE": "Aucune action", "PAID": "Payée"},
        actionState={"PROPOSED": "Proposée", "SCHEDULED": "Planifiée", "EXECUTING": "En exécution", "DONE": "Terminée", "CANCELLED": "Annulée",
                     "SUPPRESSED": "Supprimée", "FAILED": "Échouée", "CLAIMED": "Prise en charge", "COMPLETED": "Clôturée", "RESCHEDULED": "Replanifiée"},
        dueStatus={"late": "En retard", "near": "Proche", "future": "À venir", "paid": "Payée"},
        holdType={"MANUAL_SUSPENSION": "Suspension manuelle", "LEGAL": "Juridique", "NEGOTIATION": "Négociation"},
        holdScope={"INVOICE": "Facture", "CUSTOMER": "Client", "ORGANIZATION": "Organisation"},
        risk=["Faible", "Modéré", "Élevé", "Critique"],
        priority=["Basse", "Moyenne", "Haute", "Urgente"],
    ),
)

if __name__ == "__main__":
    (HERE / "demo-data.json").write_text(json.dumps(demo, ensure_ascii=False, indent=2), encoding="utf-8")
    (HERE / "lexique.json").write_text(json.dumps(lexique, ensure_ascii=False, indent=2), encoding="utf-8")
    print("OK : demo-data.json et lexique.json générés")

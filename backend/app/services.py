"""Actions métier du prototype — miroir de frontend/src/services/store.ts.

Ces fonctions enregistrent des FAITS (client créé, facture saisie, paiement
reçu, mise en attente placée, approbation décidée, note ajoutée). Elles ne
calculent jamais risque, priorité, rang ni niveau de recouvrement : c'est le
rôle du Rule Engine (non implémenté dans ce prototype).
"""
from __future__ import annotations

import re
from datetime import date, datetime

from .repository import DemoRepository

PROCHE_SEUIL_JOURS = 7  # hypothèse du prototype, à valider
EMAIL = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
ISO = re.compile(r"^\d{4}-\d{2}-\d{2}$")


class BusinessError(ValueError):
    """Erreur de validation métier → HTTP 400/409."""


def _fcfa(n: int) -> str:
    return f"{n:,}".replace(",", " ")


def _fr(iso: str) -> str:
    y, m, d = iso[:10].split("-")
    return f"{d}/{m}/{y}"


def _stamp(repo: DemoRepository) -> str:
    return f"{repo.today}T{datetime.now().strftime('%H:%M')}"


def _days(a: str, b: str) -> int:
    return (date.fromisoformat(b) - date.fromisoformat(a)).days


def due_info(due: str, today: str) -> dict:
    d = _days(today, due)
    if d < 0:
        return {"dueStatus": "late", "delayLabel": f"{-d} j de retard"}
    if d == 0:
        return {"dueStatus": "near", "delayLabel": "aujourd’hui"}
    if d == 1:
        return {"dueStatus": "near", "delayLabel": "demain"}
    return {"dueStatus": "near" if d <= PROCHE_SEUIL_JOURS else "future", "delayLabel": f"dans {d} j"}


def _event(repo: DemoRepository, cat: str, title: str, detail: str, tone: str) -> None:
    repo.data["events"].insert(0, {"cat": cat, "title": title, "detail": detail, "at": _stamp(repo), "tone": tone})


def _client_name(repo: DemoRepository, cid: str) -> str:
    return next((c["name"] for c in repo.data["clients"] if c["id"] == cid), cid)


def remaining(inv: dict) -> int:
    paid = inv.get("amountPaid")
    if paid is None:
        paid = inv["amount"] if inv["dueStatus"] == "paid" else 0
    return inv["amount"] - paid


# ------------------------------------------------------------------ clients
def create_client(repo: DemoRepository, name: str, email: str | None = None, phone: str | None = None, sector: str | None = None) -> dict:
    name = (name or "").strip()
    if len(name) < 2:
        raise BusinessError("Le nom du client est obligatoire.")
    if any(c["name"].lower() == name.lower() for c in repo.data["clients"]):
        raise BusinessError("Un client porte déjà ce nom.")
    if email and not EMAIL.match(email):
        raise BusinessError("Adresse e-mail invalide.")
    used = {c["id"] for c in repo.data["clients"]}
    cid = next((chr(c) for c in range(65, 91) if chr(c) not in used), f"C{len(used) + 1}")
    client = {"id": cid, "rank": None, "name": name, "priority": None, "risk": None, "level": None,
              "email": (email or "").strip() or None, "phone": (phone or "").strip() or None, "sector": sector or None}
    repo.data["clients"].append(client)
    _event(repo, "client", "Client créé", f"{name} · en attente d’évaluation par le Rule Engine", "mid")
    return client


# ------------------------------------------------------------------ factures
def next_invoice_id(repo: DemoRepository) -> str:
    nums = [int(re.sub(r"\D", "", i["id"]) or 0) for i in repo.data["invoices"]]
    return f"F-{max(nums, default=0) + 1:04d}"


def create_invoice(repo: DemoRepository, client_id: str, amount: float, due_date: str, invoice_id: str | None = None) -> dict:
    if not any(c["id"] == client_id for c in repo.data["clients"]):
        raise BusinessError("Choisissez un client.")
    if not amount or amount <= 0:
        raise BusinessError("Le montant doit être supérieur à 0.")
    if not ISO.match(due_date or ""):
        raise BusinessError("Date d’échéance invalide.")
    iid = ((invoice_id or "").strip() or next_invoice_id(repo)).upper()
    if repo.invoice(iid):
        raise BusinessError(f"Le numéro {iid} existe déjà.")
    pending = "En attente d’évaluation par le Rule Engine"
    inv = {"id": iid, "clientId": client_id, "amount": round(amount), "dueDate": due_date, **due_info(due_date, repo.today),
           "rank": None, "priority": None, "risk": None, "level": None, "outcome": None, "requiresApproval": False,
           "actionState": None, "action": pending, "channel": None, "note": pending, "amountPaid": 0}
    repo.data["invoices"].append(inv)
    repo.data["decisions"][iid] = {"why": "Nouvelle facture : le Rule Engine ne l’a pas encore évaluée. Risque, priorité et niveau "
                                          "de recouvrement apparaîtront après son évaluation.",
                                   "traceCount": 0, "stepIndex": -2, "branch": ""}
    _event(repo, "facture", "Facture créée",
           f"{iid} · {_client_name(repo, client_id)} · {_fcfa(inv['amount'])} FCFA · échéance {_fr(due_date)}", "mid")
    return inv


# ------------------------------------------------------------------ paiements
def record_payment(repo: DemoRepository, invoice_id: str, amount: float, pay_date: str, method: str) -> dict:
    inv = repo.invoice(invoice_id)
    if inv is None:
        raise BusinessError("Facture introuvable.")
    if inv["dueStatus"] == "paid":
        raise BusinessError("Cette facture est déjà payée.")
    rest = remaining(inv)
    if not amount or amount <= 0:
        raise BusinessError("Le montant doit être supérieur à 0.")
    if amount > rest:
        raise BusinessError(f"Le montant dépasse le reste dû ({_fcfa(rest)} FCFA).")
    pay = {"id": f"P-{len(repo.data['payments']) + 1}-{invoice_id}", "invoiceId": invoice_id, "amount": round(amount),
           "date": pay_date, "method": method, "reconciled": True}
    repo.data["payments"].append(pay)
    inv["amountPaid"] = (inv.get("amountPaid") or 0) + pay["amount"]
    left = inv["amount"] - inv["amountPaid"]
    if left <= 0:
        inv.update(dueStatus="paid", delayLabel=f"payée le {_fr(pay_date)[:5]}", paidOn=pay_date, rank=None, priority=None,
                   risk=None, level=None, outcome=None, requiresApproval=False, actionState=None,
                   action=f"Encaissée le {_fr(pay_date)}", note=f"Encaissée le {_fr(pay_date)}")
        repo.data["tasks"] = [t for t in repo.data["tasks"] if t["invoiceId"] != invoice_id]
    else:
        inv["note"] = f"Paiement partiel : {_fcfa(inv['amountPaid'])} encaissé · reste {_fcfa(left)} FCFA"
    _event(repo, "paiement", "Paiement reçu" if left <= 0 else "Paiement partiel reçu",
           f"{invoice_id} · {_client_name(repo, inv['clientId'])} · {_fcfa(pay['amount'])} FCFA · {method}", "lime")
    return pay


# ------------------------------------------------------------------ mises en attente
def place_hold(repo: DemoRepository, scope: str, hold_type: str, retry_at: str, cause: str, target_id: str | None = None) -> dict:
    if scope != "ORGANIZATION" and not target_id:
        raise BusinessError("Choisissez la facture ou le client concerné.")
    if not ISO.match(retry_at or ""):
        raise BusinessError("Date de réessai invalide.")
    if _days(repo.today, retry_at) <= 0:
        raise BusinessError("La date de réessai doit être postérieure à aujourd’hui.")
    hold = {"id": f"H-{len(repo.data['holds']) + 1}", "scope": scope, "type": hold_type, "targetId": target_id,
            "retryAt": retry_at, "cause": (cause or "").strip() or "[cause à préciser]", "createdAt": _stamp(repo)}
    repo.data["holds"].append(hold)
    target = ("toute l’organisation" if scope == "ORGANIZATION"
              else _client_name(repo, target_id) if scope == "CUSTOMER" else target_id)
    _event(repo, "hold", "Mise en attente placée",
           f"{target} · réessai prévu le {_fr(retry_at)} · décision à réévaluer par le Rule Engine", "amber")
    return hold


# ------------------------------------------------------------------ approbation
def decide_approval(repo: DemoRepository, invoice_id: str, decision: str, reason: str) -> dict:
    inv = repo.invoice(invoice_id)
    if inv is None:
        raise BusinessError("Facture introuvable.")
    if not inv.get("requiresApproval"):
        raise BusinessError("Aucune approbation n’est en attente sur cette facture.")
    if len((reason or "").strip()) < 3:
        raise BusinessError("Indiquez un motif (3 caractères minimum).")
    inv["requiresApproval"] = False
    if decision == "APPROVED":
        inv["action"] = inv["action"].replace(" · en attente d’approbation", "") + " · approuvé"
        for t in repo.data["tasks"]:
            if t["invoiceId"] == invoice_id:
                t["blockedByApproval"] = False
    else:
        inv["actionState"] = "CANCELLED"
        inv["action"] = "Action annulée · approbation refusée"
        for t in repo.data["tasks"]:
            if t["invoiceId"] == invoice_id:
                t.update(blockedByApproval=False, state="CANCELLED")
    _event(repo, "decision", "Approbation accordée" if decision == "APPROVED" else "Approbation refusée",
           f"{invoice_id} · {_client_name(repo, inv['clientId'])} · motif : {reason.strip()}",
           "lime" if decision == "APPROVED" else "red")
    return inv


# ------------------------------------------------------------------ notes
def add_note(repo: DemoRepository, invoice_id: str, text: str) -> dict:
    if repo.invoice(invoice_id) is None:
        raise BusinessError("Facture introuvable.")
    text = (text or "").strip()
    if not text:
        raise BusinessError("La note est vide.")
    note = {"id": f"N-{len(repo.data['notes']) + 1}", "invoiceId": invoice_id, "text": text, "at": _stamp(repo)}
    repo.data["notes"].insert(0, note)
    return note

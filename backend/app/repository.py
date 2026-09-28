"""Dépôt en mémoire alimenté par shared/demo-data.json.

À remplacer par une vraie base de données (ex. PostgreSQL) plus tard.
Ce module ne contient AUCUNE règle métier du Rule Engine : les décisions
sont lues telles quelles depuis les données de démonstration.
"""
from __future__ import annotations

import copy
import json
from functools import lru_cache
from pathlib import Path
from typing import Any

from .config import SHARED_DIR

RISK_ORDER = ["Faible", "Modéré", "Élevé", "Critique"]


@lru_cache(maxsize=1)
def _raw_demo() -> dict[str, Any]:
    return json.loads((SHARED_DIR / "demo-data.json").read_text(encoding="utf-8"))


@lru_cache(maxsize=1)
def lexique() -> dict[str, Any]:
    return json.loads((SHARED_DIR / "lexique.json").read_text(encoding="utf-8"))


class DemoRepository:
    """État mutable du prototype (les tâches peuvent changer d'état)."""

    def __init__(self) -> None:
        self.reset()

    def reset(self) -> None:
        d = copy.deepcopy(_raw_demo())
        # Paiements et mises en attente déduits des données de démo (miroir de store.ts / initialState).
        d.setdefault("payments", [
            {"id": f"P-{i['id']}", "invoiceId": i["id"], "amount": i["amount"], "date": i.get("paidOn") or d["today"],
             "method": "[à préciser]", "reconciled": True}
            for i in d["invoices"] if i["dueStatus"] == "paid"
        ])
        holds = []
        for n, (inv_id, dec) in enumerate([(k, v) for k, v in d["decisions"].items() if v.get("hold")], start=1):
            h = dict(dec["hold"])
            inv = next((i for i in d["invoices"] if i["id"] == inv_id), None)
            h.update(id=f"H-{n}", createdAt="2026-09-27T17:00",
                     targetId=inv_id if h["scope"] == "INVOICE" else (inv or {}).get("clientId"))
            holds.append(h)
        d.setdefault("holds", holds)
        d.setdefault("notes", [])
        self.data = d

    # ------------------------------------------------------------------ lectures
    @property
    def today(self) -> str:
        return self.data["today"]

    def invoices(self) -> list[dict]:
        return self.data["invoices"]

    def invoice(self, invoice_id: str) -> dict | None:
        return next((i for i in self.invoices() if i["id"] == invoice_id), None)

    def action_queue(self) -> list[dict]:
        """« À traiter maintenant » : tri par rang (rank_score), jamais par montant."""
        ranked = [i for i in self.invoices() if i.get("rank") is not None]
        return sorted(ranked, key=lambda i: i["rank"])

    def clients(self) -> list[dict]:
        out = []
        for c in self.data["clients"]:
            c = {"rank": None, "priority": None, "risk": None, "level": None, **c}
            open_inv = [i for i in self.invoices() if i["clientId"] == c["id"] and i["dueStatus"] != "paid"]
            out.append({**c, "openInvoices": len(open_inv), "outstanding": sum(i["amount"] for i in open_inv)})
        # Clients non encore évalués (rang absent) en fin de liste.
        return sorted(out, key=lambda c: (c["rank"] is None, c["rank"] or 0))

    def client(self, client_id: str) -> dict | None:
        return next((c for c in self.clients() if c["id"] == client_id), None)

    def events(self, cat: str | None = None) -> list[dict]:
        ev = self.data["events"]
        return [e for e in ev if cat is None or e["cat"] == cat]

    def decision(self, invoice_id: str) -> dict | None:
        inv = self.invoice(invoice_id)
        dec = self.data["decisions"].get(invoice_id)
        if inv is None or dec is None:
            return None
        return {
            "invoiceId": invoice_id,
            "outcome": inv.get("outcome"),
            "requiresApproval": inv.get("requiresApproval", False),
            "risk": inv.get("risk"),
            "priority": inv.get("priority"),
            "level": inv.get("level"),
            "rank": inv.get("rank"),
            "why": dec["why"],
            "exceptionsTraceCount": dec.get("traceCount", 0),
            "stepIndex": dec["stepIndex"],
            "branch": dec["branch"],
            "hold": dec.get("hold"),
            "suppressionCode": dec.get("suppressionCode"),
            "override": dec.get("override", False),
        }

    def promises(self) -> list[dict]:
        return self.data["promises"]

    def tasks(self) -> list[dict]:
        return self.data["tasks"]

    def task(self, task_id: str) -> dict | None:
        return next((t for t in self.tasks() if t["id"] == task_id), None)

    def risk_breakdown(self) -> dict[str, dict[str, int]]:
        out = {r: {"amount": 0, "count": 0} for r in RISK_ORDER}
        for i in self.invoices():
            if i["dueStatus"] != "paid" and i.get("risk"):
                out[i["risk"]]["amount"] += i["amount"]
                out[i["risk"]]["count"] += 1
        return out

    def kpis(self) -> dict:
        return self.data["kpis"]


repo = DemoRepository()

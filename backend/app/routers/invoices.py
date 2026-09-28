"""Factures et décisions du Rule Engine (lecture seule)."""
from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from ..models import Decision, Invoice
from ..repository import repo

router = APIRouter(prefix="/api/invoices", tags=["Factures"])


@router.get("", response_model=list[Invoice])
def list_invoices(status: Optional[str] = Query(None, description="late | near | future | paid | open")):
    items = repo.invoices()
    if status == "open":
        return [i for i in items if i["dueStatus"] != "paid"]
    if status:
        return [i for i in items if i["dueStatus"] == status]
    return items


@router.get("/queue", response_model=list[Invoice], summary="À traiter maintenant")
def action_queue():
    """Tri : rang (rank_score) → priorité → échéance. Jamais par montant."""
    return repo.action_queue()


@router.get("/{invoice_id}", response_model=Invoice)
def get_invoice(invoice_id: str):
    inv = repo.invoice(invoice_id)
    if inv is None:
        raise HTTPException(404, f"Facture {invoice_id} introuvable")
    return inv


@router.get("/{invoice_id}/decision", response_model=Decision, summary="Pourquoi ?")
def get_decision(invoice_id: str):
    """Renvoie la décision telle que produite par le Rule Engine (ici : démo)."""
    dec = repo.decision(invoice_id)
    if dec is None:
        raise HTTPException(404, f"Aucune décision pour {invoice_id}")
    return dec

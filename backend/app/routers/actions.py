"""Actions d'écriture : clients, factures, paiements, mises en attente, approbations, notes."""
from typing import Literal, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from .. import services
from ..repository import repo

router = APIRouter(prefix="/api", tags=["Actions"])


def _run(fn, *args, **kwargs):
    try:
        return fn(repo, *args, **kwargs)
    except services.BusinessError as e:
        raise HTTPException(400, str(e)) from e


class NewClient(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    sector: Optional[str] = None


class NewInvoice(BaseModel):
    clientId: str
    amount: float = Field(description="Montant TTC en FCFA (> 0)")
    dueDate: str = Field(description="AAAA-MM-JJ")
    id: Optional[str] = None


class NewPayment(BaseModel):
    amount: float
    date: str
    method: Literal["Virement", "Mobile money", "Espèces", "Chèque", "[à préciser]"] = "[à préciser]"


class NewHold(BaseModel):
    scope: Literal["INVOICE", "CUSTOMER", "ORGANIZATION"]
    type: Literal["MANUAL_SUSPENSION", "LEGAL", "NEGOTIATION"]
    targetId: Optional[str] = None
    retryAt: str
    cause: str = ""


class ApprovalDecision(BaseModel):
    decision: Literal["APPROVED", "REFUSED"]
    reason: str


class NewNote(BaseModel):
    text: str


@router.post("/clients", status_code=201, summary="Créer un client")
def create_client(body: NewClient):
    return _run(services.create_client, body.name, body.email, body.phone, body.sector)


@router.post("/invoices", status_code=201, summary="Créer une facture (non évaluée par le moteur)")
def create_invoice(body: NewInvoice):
    return _run(services.create_invoice, body.clientId, body.amount, body.dueDate, body.id)


@router.post("/invoices/{invoice_id}/payments", status_code=201, summary="Enregistrer un paiement")
def record_payment(invoice_id: str, body: NewPayment):
    return _run(services.record_payment, invoice_id, body.amount, body.date, body.method)


@router.get("/payments", summary="Paiements reçus")
def list_payments():
    return repo.data["payments"]


@router.post("/holds", status_code=201, summary="Placer une mise en attente (hold)")
def place_hold(body: NewHold):
    return _run(services.place_hold, body.scope, body.type, body.retryAt, body.cause, body.targetId)


@router.get("/holds", summary="Mises en attente actives")
def list_holds():
    return repo.data["holds"]


@router.post("/invoices/{invoice_id}/approval", summary="Décider d’une approbation requise")
def decide_approval(invoice_id: str, body: ApprovalDecision):
    return _run(services.decide_approval, invoice_id, body.decision, body.reason)


@router.post("/invoices/{invoice_id}/notes", status_code=201, summary="Ajouter une note interne")
def add_note(invoice_id: str, body: NewNote):
    return _run(services.add_note, invoice_id, body.text)


@router.get("/state", summary="État complet (utilisé par le frontend)")
def full_state():
    return {**repo.data, "clients": repo.clients()}


@router.post("/_reset", summary="Réinitialiser les données de démonstration")
def reset_demo():
    repo.reset()
    return {"ok": True}

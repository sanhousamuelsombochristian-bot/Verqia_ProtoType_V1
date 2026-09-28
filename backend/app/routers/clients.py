"""Clients et encours."""
from fastapi import APIRouter, HTTPException

from ..models import Client, Invoice
from ..repository import repo

router = APIRouter(prefix="/api/clients", tags=["Clients"])


@router.get("", response_model=list[Client])
def list_clients():
    return repo.clients()


@router.get("/{client_id}", response_model=Client)
def get_client(client_id: str):
    c = repo.client(client_id)
    if c is None:
        raise HTTPException(404, f"Client {client_id} introuvable")
    return c


@router.get("/{client_id}/invoices", response_model=list[Invoice])
def client_invoices(client_id: str):
    if repo.client(client_id) is None:
        raise HTTPException(404, f"Client {client_id} introuvable")
    return [i for i in repo.invoices() if i["clientId"] == client_id]

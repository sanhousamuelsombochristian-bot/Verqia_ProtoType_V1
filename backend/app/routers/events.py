"""Journal des événements métier et promesses de paiement."""
from typing import Optional

from fastapi import APIRouter

from ..models import Event, Promise
from ..repository import repo

router = APIRouter(prefix="/api", tags=["Événements"])


@router.get("/events", response_model=list[Event])
def list_events(cat: Optional[str] = None):
    return repo.events(cat)


@router.get("/promises", response_model=list[Promise])
def list_promises():
    return repo.promises()

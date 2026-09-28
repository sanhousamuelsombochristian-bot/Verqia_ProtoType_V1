"""Vue d'ensemble, lexique et santé du service."""
from fastapi import APIRouter

from ..models import Dashboard
from ..repository import lexique, repo

router = APIRouter(prefix="/api", tags=["Vue d’ensemble"])


@router.get("/health")
def health():
    return {"status": "ok", "today": repo.today}


@router.get("/dashboard", response_model=Dashboard)
def dashboard():
    return {
        "today": repo.today,
        "kpis": repo.kpis(),
        "queue": repo.action_queue(),
        "riskBreakdown": repo.risk_breakdown(),
        "disclaimer": repo.data["disclaimer"],
    }


@router.get("/lexique", tags=["Lexique"])
def get_lexique():
    """Vocabulaire métier : un terme affiché = un code moteur = une définition."""
    return lexique()


@router.get("/scenarios", tags=["Prévisions"])
def scenarios():
    return repo.data["scenarios"]

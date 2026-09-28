"""Tâches manuelles — cas d'usage ClaimTask et CompleteTask.

Transitions autorisées (prototype) :
  RESCHEDULED / PROPOSED --ClaimTask--> CLAIMED --CompleteTask--> COMPLETED
Une tâche bloquée par une approbation requise ne peut pas être prise en charge.
"""
from fastapi import APIRouter, HTTPException

from ..models import Task
from ..repository import repo
from ..services import _event

router = APIRouter(prefix="/api/tasks", tags=["Tâches"])

CLAIMABLE = {"RESCHEDULED", "PROPOSED"}


def _get(task_id: str) -> dict:
    t = repo.task(task_id)
    if t is None:
        raise HTTPException(404, f"Tâche {task_id} introuvable")
    return t


@router.get("", response_model=list[Task])
def list_tasks():
    return repo.tasks()


@router.post("/{task_id}/claim", response_model=Task, summary="ClaimTask — Prendre en charge")
def claim_task(task_id: str):
    t = _get(task_id)
    if t["blockedByApproval"]:
        raise HTTPException(409, "Approbation requise : prise en charge impossible.")
    if t["state"] not in CLAIMABLE:
        raise HTTPException(409, f"Transition impossible depuis l’état {t['state']}.")
    t["state"] = "CLAIMED"
    _event(repo, "action", "Tâche prise en charge", f"{t['invoiceId']} · {t['label']}", "mid")
    return t


@router.post("/{task_id}/complete", response_model=Task, summary="CompleteTask — Clôturer")
def complete_task(task_id: str):
    t = _get(task_id)
    if t["state"] != "CLAIMED":
        raise HTTPException(409, "Seule une tâche prise en charge peut être clôturée.")
    t["state"] = "COMPLETED"
    _event(repo, "action", "Tâche clôturée", f"{t['invoiceId']} · {t['label']}", "lime")
    return t


@router.post("/_reset", include_in_schema=False)
def reset_demo():
    repo.reset()
    return {"ok": True}

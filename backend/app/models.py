"""Modèles Pydantic — le contrat de l'API VERQIA PILOT (prototype).

Les noms de champs suivent le vocabulaire métier : risk / priority / level
sont trois dimensions INDÉPENDANTES retournées par le Rule Engine.
"""
from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel, Field

DueStatus = Literal["late", "near", "future", "paid"]
Outcome = Literal["PROCEED", "DEFER", "SUPPRESS", "OVERRIDDEN"]
ActionState = Literal[
    "PROPOSED", "SCHEDULED", "EXECUTING", "DONE", "CANCELLED", "SUPPRESSED", "FAILED",
    "CLAIMED", "COMPLETED", "RESCHEDULED",
]
Risk = Literal["Faible", "Modéré", "Élevé", "Critique"]
Priority = Literal["Basse", "Moyenne", "Haute", "Urgente"]


class Invoice(BaseModel):
    id: str
    clientId: str
    amount: int = Field(description="Montant en FCFA")
    dueDate: str
    dueStatus: DueStatus
    delayLabel: str
    paidOn: Optional[str] = None
    amountPaid: Optional[int] = None
    rank: Optional[int] = None
    priority: Optional[Priority] = None
    risk: Optional[Risk] = None
    level: Optional[str] = None
    outcome: Optional[Outcome] = None
    requiresApproval: bool = False
    actionState: Optional[ActionState] = None
    action: str
    channel: Optional[str] = None
    note: str


class Client(BaseModel):
    id: str
    rank: Optional[int] = None
    name: str
    priority: Optional[Priority] = None
    risk: Optional[Risk] = None
    level: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    sector: Optional[str] = None
    openInvoices: int = 0
    outstanding: int = 0


class Event(BaseModel):
    cat: Literal["decision", "action", "hold", "promesse", "paiement", "facture", "client"]
    title: str
    detail: str
    at: str
    tone: str


class Hold(BaseModel):
    type: Literal["MANUAL_SUSPENSION", "LEGAL", "NEGOTIATION"]
    scope: Literal["INVOICE", "CUSTOMER", "ORGANIZATION"]
    retryAt: str
    cause: str


class Decision(BaseModel):
    """RuleDecision telle qu'affichée. L'API ne la recalcule jamais."""
    invoiceId: str
    outcome: Optional[Outcome] = None
    requiresApproval: bool = False
    risk: Optional[Risk] = None
    priority: Optional[Priority] = None
    level: Optional[str] = None
    rank: Optional[int] = None
    why: str
    primaryException: str = "[primary_exception]"
    exceptionsTraceCount: int = 0
    ruleRef: str = "[rule_ref]"
    stepIndex: int
    branch: str
    hold: Optional[Hold] = None
    suppressionCode: Optional[str] = None
    override: bool = False


class Promise(BaseModel):
    invoiceId: str
    clientId: str
    amount: int
    promisedFor: Optional[str] = None
    status: Literal["EN_COURS", "TENUE", "ROMPUE"]
    createdAt: Optional[str] = None
    note: str


class Task(BaseModel):
    id: str
    invoiceId: str
    label: str
    state: ActionState
    blockedByApproval: bool = False


class Kpi(BaseModel):
    value: int
    count: Optional[int] = None
    trend: Optional[str] = None
    scenario: Optional[str] = None
    note: Optional[str] = None


class Dashboard(BaseModel):
    today: str
    kpis: dict[str, Kpi]
    queue: list[Invoice]
    riskBreakdown: dict[str, dict[str, int]]
    disclaimer: str

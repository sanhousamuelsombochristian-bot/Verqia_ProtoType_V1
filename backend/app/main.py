"""Point d'entrée FastAPI — VERQIA PILOT (prototype).

Lancer :  uvicorn app.main:app --reload --port 8000   (depuis le dossier backend)
Documentation interactive : http://127.0.0.1:8000/docs
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import API_TITLE, API_VERSION, CORS_ORIGINS
from .routers import actions, clients, events, invoices, meta, tasks

app = FastAPI(
    title=API_TITLE,
    version=API_VERSION,
    description="API de démonstration. Données fictives. Le Rule Engine réel n’est pas implémenté : "
                "les décisions sont lues telles quelles et ne sont jamais recalculées ici.",
)
app.add_middleware(CORSMiddleware, allow_origins=CORS_ORIGINS, allow_methods=["*"], allow_headers=["*"])

for r in (meta.router, invoices.router, clients.router, events.router, tasks.router, actions.router):
    app.include_router(r)

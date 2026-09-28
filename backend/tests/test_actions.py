"""Tests des actions d'écriture (boutons de l'interface)."""
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.repository import repo

client = TestClient(app)


@pytest.fixture(autouse=True)
def _reset():
    repo.reset()
    yield


def test_creer_un_client():
    r = client.post("/api/clients", json={"name": "Pharmacie Exemple G", "email": "contact@g.ci"})
    assert r.status_code == 201
    c = r.json()
    assert c["id"] == "G" and c["rank"] is None and c["priority"] is None  # non évalué par le moteur
    assert client.get("/api/events").json()[0]["title"] == "Client créé"


def test_client_en_double_refuse():
    assert client.post("/api/clients", json={"name": "BTP Exemple B"}).status_code == 400


def test_creer_une_facture_sans_decision_du_moteur():
    r = client.post("/api/invoices", json={"clientId": "A", "amount": 500000, "dueDate": "2026-10-03"})
    assert r.status_code == 201
    inv = r.json()
    assert inv["id"] == "F-0149" and inv["dueStatus"] == "near" and inv["rank"] is None and inv["outcome"] is None
    state = client.get("/api/state").json()
    assert state["decisions"]["F-0149"]["stepIndex"] == -2
    assert next(c for c in state["clients"] if c["id"] == "A")["outstanding"] == 2_730_000 + 500_000


def test_facture_montant_invalide():
    assert client.post("/api/invoices", json={"clientId": "A", "amount": 0, "dueDate": "2026-10-03"}).status_code == 400


def test_paiement_partiel_puis_total():
    r = client.post("/api/invoices/F-0142/payments", json={"amount": 250000, "date": "2026-09-28", "method": "Virement"})
    assert r.status_code == 201
    inv = client.get("/api/invoices/F-0142").json()
    assert inv["dueStatus"] == "late" and inv["amountPaid"] == 250000
    r = client.post("/api/invoices/F-0142/payments", json={"amount": 1_000_000, "date": "2026-09-28", "method": "Mobile money"})
    inv = client.get("/api/invoices/F-0142").json()
    assert inv["dueStatus"] == "paid" and inv["rank"] is None
    assert all(i["id"] != "F-0142" for i in client.get("/api/invoices/queue").json())


def test_paiement_superieur_au_reste_du():
    r = client.post("/api/invoices/F-0145/payments", json={"amount": 999999, "date": "2026-09-28"})
    assert r.status_code == 400


def test_mise_en_attente():
    r = client.post("/api/holds", json={"scope": "INVOICE", "type": "LEGAL", "targetId": "F-0143", "retryAt": "2026-10-10", "cause": "Litige"})
    assert r.status_code == 201
    assert len(client.get("/api/holds").json()) == 2


def test_mise_en_attente_date_passee_refusee():
    r = client.post("/api/holds", json={"scope": "ORGANIZATION", "type": "MANUAL_SUSPENSION", "retryAt": "2026-09-01"})
    assert r.status_code == 400


def test_approbation_accordee_debloque_la_tache():
    r = client.post("/api/invoices/F-0144/approval", json={"decision": "APPROVED", "reason": "Appel autorisé"})
    assert r.status_code == 200 and r.json()["requiresApproval"] is False
    assert client.post("/api/tasks/T-F0144/claim").status_code == 200


def test_approbation_refusee_annule():
    client.post("/api/invoices/F-0144/approval", json={"decision": "REFUSED", "reason": "Client en négociation"})
    t = next(t for t in client.get("/api/tasks").json() if t["id"] == "T-F0144")
    assert t["state"] == "CANCELLED"


def test_note():
    r = client.post("/api/invoices/F-0143/notes", json={"text": "Rappeler le DAF jeudi"})
    assert r.status_code == 201
    assert client.get("/api/state").json()["notes"][0]["text"] == "Rappeler le DAF jeudi"


def test_reset():
    client.post("/api/clients", json={"name": "Temporaire"})
    client.post("/api/_reset")
    assert len(client.get("/api/clients").json()) == 6

"""Tests de l'API prototype : cohérence des données et vocabulaire métier."""
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.repository import repo

client = TestClient(app)


@pytest.fixture(autouse=True)
def _reset():
    repo.reset()
    yield


def test_health():
    r = client.get("/api/health")
    assert r.status_code == 200 and r.json()["status"] == "ok"


def test_totaux_coherents_avec_les_kpis():
    inv = client.get("/api/invoices?status=open").json()
    assert len(inv) == 7
    assert sum(i["amount"] for i in inv) == 7_640_000
    late = client.get("/api/invoices?status=late").json()
    assert sum(i["amount"] for i in late) == 2_480_000
    k = client.get("/api/dashboard").json()["kpis"]
    assert k["openReceivables"]["value"] == 7_640_000
    assert k["late"]["value"] == 2_480_000


def test_file_triee_par_rang_et_pas_par_montant():
    q = client.get("/api/invoices/queue").json()
    assert [i["rank"] for i in q] == [1, 2, 3, 4, 5, 6]
    amounts = [i["amount"] for i in q]
    assert amounts != sorted(amounts, reverse=True)


def test_dimensions_independantes():
    f0144 = client.get("/api/invoices/F-0144").json()
    assert f0144["risk"] == "Critique" and f0144["rank"] == 3


def test_repartition_du_risque():
    rb = client.get("/api/dashboard").json()["riskBreakdown"]
    assert rb["Critique"] == {"amount": 780_000, "count": 1}
    assert rb["Élevé"]["amount"] + rb["Critique"]["amount"] == 4_130_000


def test_decision_avec_mise_en_attente():
    d = client.get("/api/invoices/F-0145/decision").json()
    assert d["outcome"] == "DEFER"
    assert d["hold"]["type"] == "NEGOTIATION" and d["hold"]["scope"] == "CUSTOMER"


def test_decision_introuvable():
    assert client.get("/api/invoices/F-9999/decision").status_code == 404


def test_encours_client():
    a = client.get("/api/clients/A").json()
    assert a["outstanding"] == 2_730_000 and a["openInvoices"] == 2


def test_claim_puis_complete():
    r = client.post("/api/tasks/T-F0148/claim")
    assert r.status_code == 200 and r.json()["state"] == "CLAIMED"
    r = client.post("/api/tasks/T-F0148/complete")
    assert r.status_code == 200 and r.json()["state"] == "COMPLETED"


def test_complete_sans_claim_refuse():
    assert client.post("/api/tasks/T-F0148/complete").status_code == 409


def test_approbation_bloque_la_prise_en_charge():
    assert client.post("/api/tasks/T-F0144/claim").status_code == 409


def test_lexique():
    lx = client.get("/api/lexique").json()
    assert lx["labels"]["outcome"]["DEFER"] == "Différée"
    assert len(lx["entries"]) == 40

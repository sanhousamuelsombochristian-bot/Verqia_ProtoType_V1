# Backend VERQIA PILOT (FastAPI)

```bash
python -m venv .venv
.venv\Scripts\activate          # Windows  (source .venv/bin/activate sur macOS/Linux)
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
python -m pytest -q
```

Documentation interactive : http://127.0.0.1:8000/docs
Aucune règle du Rule Engine n’est implémentée ici : les décisions sont lues depuis `shared/demo-data.json`.

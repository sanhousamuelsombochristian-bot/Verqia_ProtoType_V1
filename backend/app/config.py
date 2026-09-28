"""Configuration du backend (variables d'environnement facultatives)."""
import os
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[2]
SHARED_DIR = Path(os.getenv("VERQIA_SHARED_DIR", ROOT_DIR / "shared"))

# Origines autorisées pour le frontend en développement (Vite).
CORS_ORIGINS = os.getenv("VERQIA_CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")

API_TITLE = "VERQIA PILOT — API prototype"
API_VERSION = "0.1.0"

# VERQIA PILOT — installation (Windows PowerShell)
# Prérequis : Node.js 20+ et Python 3.11+ installés.
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot

Write-Host "1/3 Backend Python : environnement virtuel + dépendances" -ForegroundColor Green
Set-Location "$root\backend"
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install --upgrade pip
.\.venv\Scripts\python.exe -m pip install -r requirements.txt

Write-Host "2/3 Données partagées" -ForegroundColor Green
Set-Location $root
.\backend\.venv\Scripts\python.exe shared\build_shared.py

Write-Host "3/3 Frontend : dépendances npm" -ForegroundColor Green
Set-Location "$root\frontend"
npm install

Write-Host "Installation terminée. Lancez scripts\demarrer.ps1" -ForegroundColor Green

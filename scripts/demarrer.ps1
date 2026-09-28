# VERQIA PILOT — démarrage en développement (Windows PowerShell)
# Ouvre deux fenêtres : l'API Python (port 8000) et le site (port 5173).
$root = Split-Path -Parent $PSScriptRoot
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\backend'; .\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\frontend'; npm run dev"
Start-Sleep -Seconds 4
Start-Process "http://localhost:5173"
Write-Host "Site : http://localhost:5173  ·  API : http://127.0.0.1:8000/docs" -ForegroundColor Green

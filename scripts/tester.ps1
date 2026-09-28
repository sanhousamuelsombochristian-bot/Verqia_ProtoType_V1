# VERQIA PILOT — vérifications (types, tests, build)
$root = Split-Path -Parent $PSScriptRoot
Set-Location "$root\backend"; .\.venv\Scripts\python.exe -m pytest -q
Set-Location "$root\frontend"; npm run typecheck; npm test; npm run build

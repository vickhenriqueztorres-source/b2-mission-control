@echo off
setlocal
cd /d "%~dp0"

echo ============================================================
echo [FIREFLY LOGIN] Inicializando ambiente Patchright...
echo ============================================================

if exist ".venv\Scripts\python.exe" (
    ".venv\Scripts\python.exe" scripts\login_patchright.py
) else (
    python scripts\login_patchright.py
)

pause

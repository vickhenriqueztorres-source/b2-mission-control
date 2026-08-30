@echo off
setlocal
cd /d "%~dp0"

echo ============================================================
echo [FIREFLY LOGIN] Inicializando ambiente Patchright...
echo ============================================================

if exist "firefly-automation\.venv\Scripts\python.exe" (
    "firefly-automation\.venv\Scripts\python.exe" firefly-automation\scripts\login_patchright.py
) else if exist ".venv\Scripts\python.exe" (
    ".venv\Scripts\python.exe" scripts\login_patchright.py
) else (
    python firefly-automation\scripts\login_patchright.py
)

pause

"""Abre um Chrome normal para a autenticação manual inicial no Firefly."""

from __future__ import annotations

import subprocess
from pathlib import Path

CHROME_CANDIDATES = (
    Path(r"C:\Program Files\Google\Chrome\Application\chrome.exe"),
    Path(r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"),
    Path.home() / "AppData/Local/Google/Chrome/Application/chrome.exe",
)


def find_chrome() -> Path:
    """Localiza o Chrome estável sem depender do PATH do Windows."""
    for candidate in CHROME_CANDIDATES:
        if candidate.is_file():
            return candidate
    raise FileNotFoundError("Google Chrome não encontrado. Instale o Chrome estável primeiro.")


def main() -> None:
    """Não controla nem lê credenciais; a autenticação permanece inteiramente manual."""
    project_root = Path(__file__).resolve().parents[1]
    profile_dir = project_root / "data" / "chrome_profile"
    profile_dir.mkdir(parents=True, exist_ok=True)
    chrome = find_chrome()
    command = [
        str(chrome),
        f"--user-data-dir={profile_dir}",
        "--no-first-run",
        "--no-default-browser-check",
        "--disable-http2",
        "--start-maximized",
        "--new-window",
        "https://firefly.adobe.com/",
    ]
    print("Abrindo o Chrome normal com o perfil exclusivo do projeto...")
    process = subprocess.Popen(command)
    input(
        "Faça login manualmente no Firefly. Depois feche essa janela do Chrome "
        "e pressione Enter aqui: "
    )
    if process.poll() is None:
        print("O Chrome ainda está aberto. Feche a janela para garantir que a sessão seja salva.")
        process.wait()
    print(f"Sessão persistida em: {profile_dir}")


if __name__ == "__main__":
    main()

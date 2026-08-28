import json
import os
from pathlib import Path
from typing import Dict, Any


def ensure_dirs(output_dir: str = "output", profile_dir: str = "profile") -> None:
    """Garante que os diretórios de saída e perfil existam."""
    Path(output_dir).mkdir(parents=True, exist_ok=True)
    Path(profile_dir).mkdir(parents=True, exist_ok=True)


def save_image(image_bytes: bytes, filename: str, output_dir: str = "output") -> str:
    """
    Salva os bytes de uma imagem no diretório de saída.
    Retorna o caminho absoluto do arquivo salvo.
    """
    out_path = Path(output_dir)
    out_path.mkdir(parents=True, exist_ok=True)

    file_dest = out_path / filename
    with open(file_dest, "wb") as f:
        f.write(image_bytes)

    return str(file_dest.resolve())


def append_manifest(entry: Dict[str, Any], manifest_path: str = "output/manifest.jsonl") -> None:
    """
    Registra uma linha em formato JSON Lines no arquivo de manifesto.
    """
    path = Path(manifest_path)
    path.parent.mkdir(parents=True, exist_ok=True)

    with open(path, "a", encoding="utf-8") as f:
        f.write(json.dumps(entry, ensure_ascii=False) + "\n")

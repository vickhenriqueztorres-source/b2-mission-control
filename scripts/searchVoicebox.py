import os
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

search_roots = [
    os.path.expanduser("~\\OneDrive\\Desktop"),
    os.path.expanduser("~"),
    "C:\\B2-AI-STUDIO"
]

print("🔍 Procurando pastas relacionadas a Voicebox / Vozes / Áudio...")

found = []
for root_dir in search_roots:
    if not os.path.exists(root_dir):
        continue
    try:
        for item in os.listdir(root_dir):
            full_path = os.path.join(root_dir, item)
            if any(k in item.lower() for k in ["voice", "voz", "audio", "eleven", "fish", "tts", "f5", "b2 enterprise", "canais"]):
                print(f"📁 Encontrado: {full_path}")
                found.append(full_path)
                if os.path.isdir(full_path):
                    try:
                        for sub in os.listdir(full_path):
                            sub_path = os.path.join(full_path, sub)
                            if any(k in sub.lower() for k in ["voice", "voz", "audio", "tts", "clone", "box"]):
                                print(f"   └── 📁 Subpasta: {sub_path}")
                    except Exception:
                        pass
    except Exception:
        pass

print("\nBusca concluída.")

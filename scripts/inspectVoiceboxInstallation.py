import os
import sys
import json

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

voicebox_dir = r"C:\Users\brend\AppData\Local\Voicebox"
roaming_voicebox = r"C:\Users\brend\AppData\Roaming\Voicebox"
local_appdata = os.environ.get("LOCALAPPDATA", "")
appdata = os.environ.get("APPDATA", "")

print("=== INSPEÇÃO DA INSTALAÇÃO DO VOICEBOX ===")
for path_to_check in [voicebox_dir, roaming_voicebox, os.path.join(local_appdata, "Voicebox"), os.path.join(appdata, "Voicebox"), os.path.join(local_appdata, "Programs", "Voicebox")]:
    if os.path.exists(path_to_check):
        print(f"\n📂 Diretório encontrado: {path_to_check}")
        try:
            for item in os.listdir(path_to_check):
                item_path = os.path.join(path_to_check, item)
                if os.path.isdir(item_path):
                    print(f"  📁 [DIR]  {item}")
                    try:
                        sub_items = os.listdir(item_path)[:10]
                        for s in sub_items:
                            print(f"     └── {s}")
                    except Exception:
                        pass
                else:
                    size = os.path.getsize(item_path)
                    print(f"  📄 [FILE] {item} ({size} bytes)")
        except Exception as e:
            print(f"  Erro ao listar: {e}")

import os
import shutil
from pathlib import Path

source_profile = Path(r"C:\Users\brend\AppData\Local\Google\Chrome\User Data\Profile 1")
dest_profile = Path(r"C:\Users\brend\firefly_bot_session\Default")
dest_profile.mkdir(parents=True, exist_ok=True)

items_to_copy = ["Network", "Local Storage", "IndexedDB", "Session Storage", "Storage"]

for item in items_to_copy:
    src = source_profile / item
    dst = dest_profile / item
    if src.exists():
        try:
            if src.is_dir():
                shutil.copytree(src, dst, dirs_exist_ok=True)
            else:
                shutil.copy2(src, dst)
            print(f"✅ Copiado: {item}")
        except Exception as e:
            print(f"⚠️ Erro ao copiar {item}: {e}")

print("🎉 Perfil do Firefly sincronizado com a sessão do Chrome do usuário!")

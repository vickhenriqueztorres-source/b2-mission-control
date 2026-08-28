import os
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

user_home = os.path.expanduser("~")
print(f"Buscando pastas de Voicebox em {user_home}...")

for root, dirs, files in os.walk(user_home):
    # Não entra em .git, node_modules ou AppData/Local/Packages grandes
    if "node_modules" in root or ".git" in root or "AppData\\Local\\Microsoft" in root or "AppData\\Local\\Google" in root:
        continue
    if "voicebox" in root.lower():
        print(f"📂 Diretório Voicebox: {root}")
        for f in files[:10]:
            print(f"   └── 📄 {f}")
    
    # Limita profundidade
    depth = root[len(user_home):].count(os.sep)
    if depth > 4:
        dirs.clear()

print("Busca de dados concluída.")

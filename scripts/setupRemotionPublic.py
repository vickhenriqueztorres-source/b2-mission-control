import os
import sys
import shutil

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

public_dir = os.path.abspath("public")
os.makedirs(public_dir, exist_ok=True)

source_run = os.path.abspath("runs/OOL-EP01-PIX")

# Mapeia diretórios necessários para dentro de public/
mappings = [
    ("postproduction", os.path.join(source_run, "postproduction")),
    ("editorial", os.path.join(source_run, "editorial")),
    ("assets", os.path.join(source_run, "assets"))
]

for name, src in mappings:
    dst = os.path.join(public_dir, name)
    if os.path.exists(src):
        try:
            if os.path.islink(dst) or os.path.exists(dst):
                if os.path.isdir(dst) and not os.path.islink(dst):
                    shutil.rmtree(dst)
                else:
                    os.remove(dst)
            # Cria cópia de diretório
            shutil.copytree(src, dst)
            print(f"✅ Sincronizado para public/{name} a partir de {src}")
        except Exception as e:
            print(f"⚠️ Erro ao copiar {name}: {e}")

print("🎉 Pasta public/ configurada com sucesso para o Remotion!")

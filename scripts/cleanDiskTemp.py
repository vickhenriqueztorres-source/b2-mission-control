import os
import sys
import shutil

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

temp_dir = os.environ.get("TEMP", r"C:\Users\brend\AppData\Local\Temp")
print(f"🧹 Limpando arquivos temporários e caches em {temp_dir}...")

deleted_bytes = 0
deleted_files = 0

if os.path.exists(temp_dir):
    for item in os.listdir(temp_dir):
        p = os.path.join(temp_dir, item)
        if "remotion" in item.lower() or item.startswith("tmp") or item.startswith("npm-") or item.startswith("vscode-") or item.startswith("chrome_"):
            try:
                if os.path.isdir(p):
                    sz = sum(os.path.getsize(os.path.join(r, f)) for r, d, files in os.walk(p) for f in files if os.path.isfile(os.path.join(r, f)))
                    shutil.rmtree(p, ignore_errors=True)
                    deleted_bytes += sz
                    deleted_files += 1
                else:
                    sz = os.path.getsize(p)
                    os.remove(p)
                    deleted_bytes += sz
                    deleted_files += 1
            except Exception:
                pass

print(f"✅ Liberados {deleted_bytes / (1024**3):.2f} GB de arquivos temporários.")

total, used, free = shutil.disk_usage("C:\\")
print(f"📊 Espaço Livre no Disco C: {free / (1024**3):.2f} GB de {total / (1024**3):.2f} GB")

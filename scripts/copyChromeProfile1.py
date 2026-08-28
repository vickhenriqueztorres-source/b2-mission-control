import os
import sys
import sqlite3
import shutil

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

src_db = r"C:\Users\brend\AppData\Local\Google\Chrome\User Data\Profile 1\Network\Cookies"
dest_dir = r"C:\Users\brend\firefly_bot_session\Default\Network"
os.makedirs(dest_dir, exist_ok=True)
dest_db = os.path.join(dest_dir, "Cookies")

print(f"Lendo cookies de: {src_db}")
uri = f"file:{src_db}?mode=ro"

try:
    conn_src = sqlite3.connect(uri, uri=True)
    conn_dest = sqlite3.connect(dest_db)
    
    # Usa a API de backup nativa do SQLite para copiar o banco 100% íntegro mesmo com Chrome aberto
    conn_src.backup(conn_dest)
    
    conn_dest.close()
    conn_src.close()
    print("✅ Banco Network/Cookies copiado com 100% de integridade via SQLite Backup API!")
except Exception as e:
    print(f"⚠️ Erro ao clonar Cookies: {e}")

# Copia também Local State para a chave de descriptografia DPAPI
local_state_src = r"C:\Users\brend\AppData\Local\Google\Chrome\User Data\Local State"
local_state_dst = r"C:\Users\brend\firefly_bot_session\Local State"
if os.path.exists(local_state_src):
    try:
        shutil.copy2(local_state_src, local_state_dst)
        print("✅ Local State copiado com sucesso!")
    except Exception as e:
        print(f"⚠️ Erro ao copiar Local State: {e}")

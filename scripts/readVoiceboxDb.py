import sqlite3
import os
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

db_path = r"C:\Users\brend\AppData\Roaming\sh.voicebox.app\voicebox.db"
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Lista tabelas
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    print("Tabelas encontradas no Voicebox DB:", [t[0] for t in tables])
    
    for table in tables:
        t_name = table[0]
        print(f"\n--- Conteúdo da tabela: {t_name} ---")
        cursor.execute(f"SELECT * FROM {t_name} LIMIT 10;")
        rows = cursor.fetchall()
        cursor.execute(f"PRAGMA table_info({t_name});")
        columns = [col[1] for col in cursor.fetchall()]
        print("Colunas:", columns)
        for r in rows:
            print("  Row:", r)
    conn.close()
else:
    print("voicebox.db não encontrado.")

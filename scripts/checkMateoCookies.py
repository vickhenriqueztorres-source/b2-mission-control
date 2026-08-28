import os
import sys
import sqlite3

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

db_path = r"C:\Users\brend\OneDrive\Desktop\B2 ENTERPRISE\Canais_\Mateo - Copia\agente firefly\data\chrome_profile\Default\Network\Cookies"

if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    c.execute("SELECT host_key, name FROM cookies WHERE host_key LIKE '%adobe%'")
    rows = c.fetchall()
    print(f"✅ Mateo Agente Firefly profile contém {len(rows)} cookies da Adobe!")
    for r in rows[:10]:
        print(f"  🍪 {r[0]} | {r[1]}")
    conn.close()
else:
    print(f"❌ Não encontrado: {db_path}")

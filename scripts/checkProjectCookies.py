import os
import sys
import sqlite3

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

candidates = [
    r"firefly-automation\data\chrome_profile",
    r"firefly-automation\data\chrome_profile_old_account_20260824-134549",
    r"firefly-automation\data\diagnostic_login_profile",
    r"firefly-automation\data\diagnostic_profile",
    r"chatgpt-image-bot\profile"
]

for c_dir in candidates:
    for root, dirs, files in os.walk(c_dir):
        for f in files:
            if f.lower() == "cookies":
                full_p = os.path.join(root, f)
                try:
                    conn = sqlite3.connect(full_p)
                    c = conn.cursor()
                    c.execute("SELECT host_key, name FROM cookies WHERE host_key LIKE '%adobe%'")
                    rows = c.fetchall()
                    print(f"[{full_p}] -> Encontrados {len(rows)} cookies da Adobe!")
                    for r in rows[:5]:
                        print(f"   🍪 {r[0]} | {r[1]}")
                    conn.close()
                except Exception as e:
                    print(f"[{full_p}] -> Erro: {e}")

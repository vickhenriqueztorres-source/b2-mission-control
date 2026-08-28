import os
import sqlite3

profiles = [
    r'firefly-automation\data\chrome_profile',
    r'firefly-automation\data\chrome_profile_old_account_20260824-134549',
    r'C:\Users\brend\.chatgpt-bot-profile',
    r'C:\Users\brend\chatgpt_bot_session',
    r'C:\Users\brend\AppData\Local\Google\Chrome\User Data\Default',
    r'C:\Users\brend\AppData\Local\Google\Chrome\User Data\Profile 1',
    r'C:\Users\brend\AppData\Local\Google\Chrome\User Data\Profile 2'
]

for p in profiles:
    for sub in [os.path.join(p, 'Network', 'Cookies'), os.path.join(p, 'Cookies')]:
        if os.path.exists(sub):
            try:
                conn = sqlite3.connect(sub)
                c = conn.cursor()
                c.execute("SELECT COUNT(*) FROM cookies WHERE host_key LIKE '%adobe%'")
                adobe_count = c.fetchone()[0]
                c.execute("SELECT COUNT(*) FROM cookies WHERE host_key LIKE '%openai%'")
                openai_count = c.fetchone()[0]
                print(f"[{p}] -> Adobe: {adobe_count}, OpenAI: {openai_count}")
                conn.close()
                break
            except Exception as e:
                print(f"[{p}] -> Error: {e}")

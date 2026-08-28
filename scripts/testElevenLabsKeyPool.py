import sys
import urllib.request
import json

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

KEYS = [
    "sk_45c79defa2fcb2ca405843dc26b1fa7ad1bb0b691cf2fa13",
    "sk_a918e026c233a750355a9104d8b75aefac3dda68249bd447",
    "sk_4e1e236ebcbb440102e1c940f72b03613714f4451eb0b186"
]

print("Validando Pool de Chaves ElevenLabs:")
for idx, key in enumerate(KEYS, 1):
    req = urllib.request.Request(
        "https://api.elevenlabs.io/v1/user/subscription",
        headers={"xi-api-key": key, "Content-Type": "application/json"}
    )
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            used = data.get("character_count", 0)
            limit = data.get("character_limit", 10000)
            print(f"  Chave #{idx} ({key[:8]}...): VALIDA | Tier: {data.get('tier')} | Saldo: {limit - used} / {limit} caracteres")
    except Exception as e:
        print(f"  Chave #{idx} ({key[:8]}...): ERRO -> {e}")

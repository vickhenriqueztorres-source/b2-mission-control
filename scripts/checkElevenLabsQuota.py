import urllib.request
import json

API_KEY = "sk_9459866952a61014ded640b61827f135c239c1cc74507ce9"
req = urllib.request.Request(
    "https://api.elevenlabs.io/v1/user/subscription",
    headers={"xi-api-key": API_KEY, "Content-Type": "application/json"}
)

try:
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode("utf-8"))
        print("Subscription Status:")
        print(f"  Tier: {data.get('tier')}")
        print(f"  Character Count: {data.get('character_count')} / {data.get('character_limit')}")
        print(f"  Can Extend: {data.get('can_extend_character_limit')}")
except Exception as e:
    print("Error checking subscription:", e)

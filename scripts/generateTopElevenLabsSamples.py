import os
import sys
import json
import urllib.request

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

API_KEY = "sk_9459866952a61014ded640b61827f135c239c1cc74507ce9"
BASE_URL = "https://api.elevenlabs.io/v1"
samples_dir = os.path.abspath("runs/OOL-EP01-PIX/elevenlabs_samples")
os.makedirs(samples_dir, exist_ok=True)

sample_text = (
    "Um gesto simples. Quase imperceptível. Você digita a chave, confirma a transferência de um real e pronto. "
    "Na tela, o comprovante surge em menos de dois segundos. "
    "Mas por trás desse toque existe uma máquina monumental que nunca desliga. Esse é o outro lado."
)

top_documentary_voices = [
    {"name": "Adam", "voice_id": "pNInz6obpgDQGcFmaJgB", "desc": "Grave, Firme, Autoritário, Documental Profundo"},
    {"name": "Brian", "voice_id": "nPczCjzI2devNBz1zQrb", "desc": "Grave, Ressonante, Narrador Noturno / Investigativo"},
    {"name": "Daniel", "voice_id": "onwK4e9ZLuTAKqWW03F9", "desc": "Locutor Jornalístico Estilo BBC / Documentários"},
    {"name": "Eric", "voice_id": "cjVigY5qzO86Huf0OWal", "desc": "Voz Suave, Confiável, Narrativa de Engenharia"},
    {"name": "Bill", "voice_id": "pqHfZKP75CvOlQylNhV4", "desc": "Maduro, Equilibrado, História / Investigação"},
    {"name": "George", "voice_id": "JBFqnCBsd6RMkjVDRZzb", "desc": "Contador de Histórias, Envolvente, Chiaroscuro"},
    {"name": "Charlie", "voice_id": "IKne3meq5aSn9XLyUdCD", "desc": "Voz Profunda e Confiante"}
]

print("🎙️ Gerando amostras principais da ElevenLabs com eleven_multilingual_v2...")

for v in top_documentary_voices:
    v_id = v["voice_id"]
    name = v["name"]
    out_file = os.path.join(samples_dir, f"sample_{name.lower()}.mp3")
    
    payload = {
        "text": sample_text,
        "model_id": "eleven_multilingual_v2",
        "voice_settings": {
            "stability": 0.60,
            "similarity_boost": 0.80,
            "style": 0.10,
            "use_speaker_boost": True
        }
    }
    
    try:
        gen_req = urllib.request.Request(
            f"{BASE_URL}/text-to-speech/{v_id}",
            data=json.dumps(payload).encode("utf-8"),
            headers={"xi-api-key": API_KEY, "Content-Type": "application/json"}
        )
        with urllib.request.urlopen(gen_req) as g_resp:
            with open(out_file, "wb") as f:
                f.write(g_resp.read())
        print(f"  ✅ [{name}] Amostra gerada: {out_file}")
    except Exception as e:
        print(f"  ⚠️ Erro em {name}: {e}")

print("\n🎉 Todas as principais amostras ElevenLabs geradas com sucesso!")

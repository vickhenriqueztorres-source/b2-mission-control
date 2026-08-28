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

# 1. Busca lista de vozes disponíveis
print("🔍 Conectando à API da ElevenLabs e buscando catálogo de vozes...")
req = urllib.request.Request(
    f"{BASE_URL}/voices",
    headers={"xi-api-key": API_KEY, "Content-Type": "application/json"}
)

try:
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode("utf-8"))
        voices = data.get("voices", [])
        print(f"✅ Total de vozes encontradas na conta ElevenLabs: {len(voices)}\n")
        
        # Filtra vozes masculinas / de narração
        candidate_voices = []
        for v in voices:
            v_id = v.get("voice_id")
            name = v.get("name")
            labels = v.get("labels", {})
            gender = labels.get("gender", "")
            desc = labels.get("description", "") or labels.get("accent", "") or labels.get("use_case", "")
            
            print(f"🎙️ Nome: {name:<20} | ID: {v_id} | Gênero: {gender} | Info: {desc}")
            
            if gender == "male" or "narrative" in str(labels) or "documentary" in str(labels) or "news" in str(labels) or "deep" in str(labels):
                candidate_voices.append(v)
                
except Exception as e:
    print(f"❌ Erro ao conectar na ElevenLabs: {e}")
    sys.exit(1)

# Texto de teste do documentário
sample_text = (
    "Um gesto simples. Quase imperceptível. Você digita a chave, confirma a transferência de um real e pronto. "
    "Na tela, o comprovante surge em menos de dois segundos. "
    "Mas por trás desse toque existe uma máquina monumental que nunca desliga. Esse é o outro lado."
)

# Seleciona as melhores vozes masculinas para documentário (ex: Adam, Brian, George, Daniel, Liam, etc.)
priority_names = ["Adam", "Brian", "George", "Daniel", "Bill", "Eric", "Will", "Charlie", "Callum", "Roger", "Liam", "Marcus"]
selected_for_sample = []

for v in voices:
    if v.get("name") in priority_names or v.get("labels", {}).get("gender") == "male":
        selected_for_sample.append(v)
        if len(selected_for_sample) >= 6:
            break

print(f"\n🎙️ Gerando {len(selected_for_sample)} amostras em Português com o modelo eleven_multilingual_v2...\n")

generated_samples = []
for v in selected_for_sample:
    v_id = v["voice_id"]
    name = v["name"]
    out_file = os.path.join(samples_dir, f"elevenlabs_{name.lower()}_{v_id[:6]}.mp3")
    
    payload = {
        "text": sample_text,
        "model_id": "eleven_multilingual_v2",
        "voice_settings": {
            "stability": 0.55,
            "similarity_boost": 0.75,
            "style": 0.15,
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
        print(f"  ✅ Amostra gerada com sucesso: {name} ➔ {out_file}")
        generated_samples.append({
            "name": name,
            "voice_id": v_id,
            "file": out_file,
            "labels": v.get("labels", {})
        })
    except Exception as e:
        print(f"  ⚠️ Falha ao gerar amostra para {name} ({v_id}): {e}")

print("\n🎉 Processo de geração de amostras ElevenLabs finalizado!")

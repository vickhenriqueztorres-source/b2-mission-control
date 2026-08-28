import os
import sys
import json
import urllib.request
import time
import subprocess
import shutil

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

# POOL DE CHAVES ELEVENLABS COM ROTAÇÃO AUTOMÁTICA
API_KEYS_POOL = [
    "sk_45c79defa2fcb2ca405843dc26b1fa7ad1bb0b691cf2fa13",
    "sk_a918e026c233a750355a9104d8b75aefac3dda68249bd447",
    "sk_4e1e236ebcbb440102e1c940f72b03613714f4451eb0b186",
    "sk_9459866952a61014ded640b61827f135c239c1cc74507ce9"
]

VOICE_ID = "iP95p4xoKVk53GoZ742B"  # Chris - Conversacional e Moderno (Estilo Johnny Harris / Vox)
BASE_URL = "https://api.elevenlabs.io/v1"

script_path = os.path.abspath("runs/OOL-EP01-PIX/editorial/06-script-approved.json")
postprod_dir = os.path.abspath("runs/OOL-EP01-PIX/postproduction")
scenes_audio_dir = os.path.join(postprod_dir, "scenes_audio")
public_postprod_dir = os.path.abspath("public/postproduction")

os.makedirs(scenes_audio_dir, exist_ok=True)
os.makedirs(public_postprod_dir, exist_ok=True)

with open(script_path, "r", encoding="utf-8") as f:
    script_data = json.load(f)

scenes = script_data.get("scenes", [])

print("══════════════════════════════════════════════════════════════════")
print("🎙️ POOL ELEVENLABS MULTI-KEY — CHRIS (CONVERSACIONAL / MODERNO)")
print(f"📌 Total de Cenas: {len(scenes)}")
print(f"🔑 Chaves Disponíveis no Pool: {len(API_KEYS_POOL)}")
print(f"🎙️ Voice ID: {VOICE_ID} (Chris)")
print("══════════════════════════════════════════════════════════════════\n")

current_key_idx = 0
full_script_parts = []
scene_manifests = []

for idx, s in enumerate(scenes, 1):
    s_id = s["scene_id"]
    voiceover = s.get("voiceover", "").strip()
    if not voiceover:
        continue

    full_script_parts.append(voiceover)
    out_audio = os.path.join(scenes_audio_dir, f"{s_id}.mp3")

    payload = {
        "text": voiceover,
        "model_id": "eleven_multilingual_v2",
        "voice_settings": {
            "stability": 0.55,
            "similarity_boost": 0.80,
            "style": 0.15,
            "use_speaker_boost": True
        }
    }

    # Tenta gerar rotacionando as chaves em caso de limite de cota
    success = False
    for attempt in range(len(API_KEYS_POOL) * 2):
        active_key = API_KEYS_POOL[current_key_idx]
        req = urllib.request.Request(
            f"{BASE_URL}/text-to-speech/{VOICE_ID}",
            data=json.dumps(payload).encode("utf-8"),
            headers={"xi-api-key": active_key, "Content-Type": "application/json"}
        )
        try:
            with urllib.request.urlopen(req) as resp:
                with open(out_audio, "wb") as f:
                    f.write(resp.read())
            success = True
            break
        except urllib.error.HTTPError as e:
            if e.code in [401, 403, 429]:
                print(f"  ⚠️ Chave #{current_key_idx + 1} ({active_key[:8]}...) atingiu cota/erro {e.code}. Rotacionando...")
                current_key_idx = (current_key_idx + 1) % len(API_KEYS_POOL)
                time.sleep(1)
            else:
                print(f"  ⚠️ Erro HTTP {e.code} ao gerar {s_id}: {e}")
                time.sleep(2)
        except Exception as e:
            print(f"  ⚠️ Erro de conexão em {s_id}: {e}")
            time.sleep(2)

    if not success:
        print(f"❌ Falha crítica ao gerar áudio para {s_id} após tentar todas as chaves do pool.")
        sys.exit(1)

    byte_size = os.path.getsize(out_audio)
    scene_manifests.append({
        "scene_id": s_id,
        "voiceover": voiceover,
        "audio_file": out_audio,
        "byte_size": byte_size
    })
    print(f"  ✅ [{idx:02d}/{len(scenes)}] {s_id} gerado na voz CHRIS com Chave #{current_key_idx + 1}")

# Concatenação da narração Master contínua com FFmpeg
print("\n🎙️ Unificando Master Narration contínua via FFmpeg...")
concat_txt_path = os.path.join(postprod_dir, "concat_list.txt")
with open(concat_txt_path, "w", encoding="utf-8") as f:
    for s in scene_manifests:
        f.write(f"file '{s['audio_file'].replace(os.sep, '/')}'\n")

master_audio_path = os.path.join(postprod_dir, "narration.mp3")
ffmpeg_cmd = [
    "ffmpeg", "-y", "-f", "concat", "-safe", "0",
    "-i", concat_txt_path, "-c", "copy", master_audio_path
]

try:
    subprocess.run(ffmpeg_cmd, capture_output=True, text=True, check=True)
    print(f"✅ Narração Master unificada: {master_audio_path}")
except Exception as e:
    print(f"⚠️ Erro ao concatenar com FFmpeg: {e}")

# Copia para public/postproduction
public_master_audio = os.path.join(public_postprod_dir, "narration.mp3")
if os.path.exists(master_audio_path):
    shutil.copy2(master_audio_path, public_master_audio)

# Copia todas as cenas de áudio para public
pub_scenes_dir = os.path.join(public_postprod_dir, "scenes_audio")
os.makedirs(pub_scenes_dir, exist_ok=True)
for s in scene_manifests:
    shutil.copy2(s["audio_file"], os.path.join(pub_scenes_dir, f"{s['scene_id']}.mp3"))

manifest = {
    "status": "NARRATION_GENERATED_ELEVENLABS_CHRIS",
    "voice_name": "Chris",
    "voice_id": VOICE_ID,
    "total_scenes": len(scene_manifests),
    "master_audio_path": master_audio_path,
    "scenes": scene_manifests
}

with open(os.path.join(postprod_dir, "narration-manifest.json"), "w", encoding="utf-8") as f:
    json.dump(manifest, f, indent=2, ensure_ascii=False)

print(f"\n🎉 TODAS AS {len(scene_manifests)} CENAS FORAM GERADAS NA VOZ CHRIS (ELEVENLABS) COM POOL ROTATIVO!")

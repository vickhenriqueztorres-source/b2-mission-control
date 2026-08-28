import os
import sys
import json
import time
import urllib.request
import subprocess

# Fix Windows console UTF-8
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

API_KEYS = [
    "sk_c27c4c44ba3f64f2c332c50d3e728f8ac10bfe093e5c3db9",
    "sk_2669c44e115a2130ca8521b2824e9bf3572d7cb236904906",
    "sk_44731b62917a45c2e10555c2c31b5ad90f256e9263738ada"
]

VOICE_CHRIS = "iP95p4xoKVk53GoZ742B"
MODEL_ID = "eleven_multilingual_v2"

EPISODE_ID = "OOL-EP05-RADAR-ASFALTO"
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
RUN_DIR = os.path.join(BASE_DIR, "runs", EPISODE_ID)
POST_DIR = os.path.join(RUN_DIR, "postproduction")
AUDIO_DIR = os.path.join(POST_DIR, "scenes_audio")
PUBLIC_POST_DIR = os.path.join(BASE_DIR, "public", "postproduction")
PUBLIC_POST_EP05 = os.path.join(BASE_DIR, "public", "postproduction_ep05")

os.makedirs(AUDIO_DIR, exist_ok=True)
os.makedirs(PUBLIC_POST_DIR, exist_ok=True)
os.makedirs(PUBLIC_POST_EP05, exist_ok=True)

# Carregar o seed com as 50 cenas do Episódio 05
sys.path.append(BASE_DIR)

# Ler as cenas do documentary-edit-package.json existente ou montar a lista completa
edit_pkg_path = os.path.join(RUN_DIR, "editorial", "execution", "documentary-edit-package.json")
with open(edit_pkg_path, "r", encoding="utf-8") as f:
    edit_pkg = json.load(f)

scenes = edit_pkg["scenes"]
print(f"🎙️ Iniciando geração da locução de {len(scenes)} cenas com ElevenLabs Chris ({VOICE_CHRIS})...")

key_idx = 0

def call_elevenlabs(text, output_path):
    global key_idx
    for attempt in range(len(API_KEYS) * 3):
        k = API_KEYS[key_idx % len(API_KEYS)]
        url = f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_CHRIS}"
        headers = {
            "xi-api-key": k,
            "Content-Type": "application/json",
            "Accept": "audio/mpeg"
        }
        body = json.dumps({
            "text": text,
            "model_id": MODEL_ID,
            "voice_settings": {
                "stability": 0.48,
                "similarity_boost": 0.85,
                "style": 0.15,
                "use_speaker_boost": True
            }
        }).encode("utf-8")

        try:
            req = urllib.request.Request(url, data=body, headers=headers, method="POST")
            with urllib.request.urlopen(req, timeout=30) as resp:
                if resp.status == 200:
                    with open(output_path, "wb") as f:
                        f.write(resp.read())
                    return True
        except Exception as e:
            print(f"  ⚠️ Chave {key_idx % len(API_KEYS)} ({k[:8]}...) falhou: {e}. Rotacionando chave...")
            key_idx += 1
            time.sleep(1)

    return False

# 1. Gerar áudio para cada cena
generated_count = 0
for idx, sc in enumerate(scenes):
    sc_id = sc["sceneId"]
    out_file = os.path.join(AUDIO_DIR, f"{sc_id}.mp3")
    text = sc.get("voiceoverText", "")

    # Se já existir e for válido, podemos reutilizar ou regenerar
    if not os.path.exists(out_file) or os.path.getsize(out_file) < 2000:
        print(f"[{idx+1}/{len(scenes)}] Gerando áudio para {sc_id}...")
        ok = call_elevenlabs(text, out_file)
        if not ok:
            print(f"❌ Falha ao gerar áudio para {sc_id}")
        else:
            print(f"  ✅ {sc_id} gerado com sucesso!")
            generated_count += 1
            time.sleep(0.3)
    else:
        print(f"[{idx+1}/{len(scenes)}] {sc_id} já existe e é válido.")
        generated_count += 1

# 2. Medir duração de cada áudio com ffprobe
scene_durations = []
for sc in scenes:
    sc_id = sc["sceneId"]
    out_file = os.path.join(AUDIO_DIR, f"{sc_id}.mp3")
    probe_cmd = [
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "json", out_file
    ]
    res = subprocess.run(probe_cmd, capture_output=True, text=True)
    try:
        dur = float(json.loads(res.stdout)["format"]["duration"])
    except:
        dur = sc.get("durationSeconds", 6.0)
    
    # Adicionar margem de respiração (0.35s de respiro cinematográfico)
    dur_with_padding = max(dur + 0.35, 4.0)
    frames = round(dur_with_padding * 30)
    
    scene_durations.append({
        "sceneId": sc_id,
        "rawDurationSeconds": dur,
        "durationSeconds": frames / 30.0,
        "durationFrames": frames,
        "voiceoverText": sc.get("voiceoverText", ""),
        "takeType": sc.get("takeType", "CINEMATIC_TAKE"),
        "integratedText": sc.get("integratedText", "")
    })

total_duration_sec = sum(s["durationSeconds"] for s in scene_durations)
total_frames = sum(s["durationFrames"] for s in scene_durations)

print(f"\n📊 Total de Cenas: {len(scenes)} | Duração Total: {total_duration_sec:.2f}s ({total_duration_sec/60:.2f} min) | Total Frames: {total_frames}")

# 3. Criar concat_list.txt e gerar narration_raw.mp3
concat_list_path = os.path.join(POST_DIR, "concat_list.txt")
with open(concat_list_path, "w", encoding="utf-8") as f:
    for s in scene_durations:
        p = os.path.join(AUDIO_DIR, f"{s['sceneId']}.mp3").replace("\\", "/")
        f.write(f"file '{p}'\n")

raw_master_mp3 = os.path.join(POST_DIR, "narration_raw.mp3")
subprocess.run([
    "ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", concat_list_path,
    "-c", "copy", raw_master_mp3
], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

# 4. Normalizar áudio para -16.0 LUFS (Padrão PRD & EBU R128)
master_mp3 = os.path.join(POST_DIR, "narration.mp3")
print("🎚️ Normalizando narração master para -16.0 LUFS...")
loudnorm_filter = "loudnorm=I=-16:LRA=11:TP=-1.5,apad=whole_dur=" + str(total_duration_sec)
subprocess.run([
    "ffmpeg", "-y", "-i", raw_master_mp3,
    "-af", loudnorm_filter,
    "-c:a", "mp3", "-b:a", "256k",
    master_mp3
], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

# Copiar para pastas públicas para o Remotion staticFile
for target_dir in [PUBLIC_POST_DIR, PUBLIC_POST_EP05]:
    os.makedirs(target_dir, exist_ok=True)
    target_file = os.path.join(target_dir, "narration.mp3")
    with open(master_mp3, "rb") as src, open(target_file, "wb") as dst:
        dst.write(src.read())

# 5. Salvar scene_timings.json
timings_path = os.path.join(POST_DIR, "scene_timings.json")
with open(timings_path, "w", encoding="utf-8") as f:
    json.dump({
        "episodeId": EPISODE_ID,
        "voice": "Chris",
        "voiceId": VOICE_CHRIS,
        "lufsTarget": -16.0,
        "totalDurationSeconds": total_duration_sec,
        "totalDurationFrames": total_frames,
        "fps": 30,
        "scenes": scene_durations
    }, f, indent=2)

print("✅ Locução ElevenLabs Chris e scene_timings.json finalizados com sucesso!")

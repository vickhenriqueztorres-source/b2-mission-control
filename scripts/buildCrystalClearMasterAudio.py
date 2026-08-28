import os
import sys
import json
import subprocess
import shutil

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
RUN_DIR = os.path.join(BASE_DIR, "runs", "OOL-EP05-RADAR-ASFALTO")
POST_DIR = os.path.join(RUN_DIR, "postproduction")
AUDIO_DIR = os.path.join(POST_DIR, "scenes_audio")
PUBLIC_AUDIO_DIR = os.path.join(BASE_DIR, "public", "audio")

timings_file = os.path.join(POST_DIR, "scene_timings.json")
with open(timings_file, "r", encoding="utf-8") as f:
    timings_data = json.load(f)

total_duration = timings_data["totalDurationSeconds"]
scenes = timings_data["scenes"]

print(f"🎙️ Reconstruindo Narração ElevenLabs Chris CRISTALINA para {len(scenes)} cenas ({total_duration:.2f}s)...", flush=True)

# 1. Pad cada arquivo de cena até a duração exata da sua cena (sem amix, sem atenuação de volume!)
concat_list_file = os.path.join(POST_DIR, "clean_concat_list.txt")
padded_dir = os.path.join(POST_DIR, "scenes_audio_clean_padded")
os.makedirs(padded_dir, exist_ok=True)

with open(concat_list_file, "w", encoding="utf-8") as cf:
    for sc in scenes:
        sc_id = sc["sceneId"]
        sc_file = os.path.join(AUDIO_DIR, f"{sc_id}.mp3")
        dur = sc["durationFrames"] / 30.0
        padded_file = os.path.join(padded_dir, f"{sc_id}_padded.wav")
        
        # Pad com silêncio até a duração exata da cena - mantendo 100% do volume original ElevenLabs
        cmd = [
            "ffmpeg", "-nostdin", "-y",
            "-i", sc_file,
            "-af", f"apad=whole_dur={dur:.4f},atrim=0:{dur:.4f}",
            "-ar", "48000", "-ac", "2",
            padded_file
        ]
        subprocess.run(cmd, capture_output=True, check=True)
        
        clean_path = os.path.abspath(padded_file).replace("\\", "/")
        cf.write(f"file '{clean_path}'\n")

print("✅ Todas as 50 cenas padded. Concatenando voz limpa em stream único...", flush=True)
clean_voice_file = os.path.join(POST_DIR, "pure_elevenlabs_voice.wav")
subprocess.run([
    "ffmpeg", "-nostdin", "-y",
    "-f", "concat", "-safe", "0",
    "-i", concat_list_file,
    "-c", "copy",
    clean_voice_file
], capture_output=True, check=True)

# 2. SFX e Música
music_file = os.path.join(PUBLIC_AUDIO_DIR, "music", "cinematic", "suspense", "suspense_unseen_horrors.mp3")
boom_file = os.path.join(PUBLIC_AUDIO_DIR, "sfx", "cinematic", "booms", "boom_explosion_01.wav")
impact_file = os.path.join(PUBLIC_AUDIO_DIR, "sfx", "cinematic", "impacts", "impact_strike_01.wav")
whoosh_file = os.path.join(PUBLIC_AUDIO_DIR, "sfx", "cinematic", "whooshes", "whoosh_swoosh_01.wav")
tension_file = os.path.join(PUBLIC_AUDIO_DIR, "sfx", "cinematic", "tension", "tension_riser_01.wav")

sfx_events = []

# Booms na abertura de cada capítulo
current_ch = ""
for sc in scenes:
    sc_time = sc["startFrame"] / 30.0
    if sc["chapterId"] != current_ch:
        current_ch = sc["chapterId"]
        sfx_events.append({"time": sc_time, "file": boom_file, "vol": 0.15})

# Impacts e Whooshes nos Callouts
for sc in scenes:
    sc_time = sc["startFrame"] / 30.0
    if sc.get("callout"):
        sfx_events.append({"time": sc_time, "file": impact_file, "vol": 0.18})
        sfx_events.append({"time": max(0, sc_time - 0.2), "file": whoosh_file, "vol": 0.12})
    elif sc.get("motionMode") in ["crash_push_in", "dramatic_pull_out"]:
        sfx_events.append({"time": sc_time, "file": whoosh_file, "vol": 0.10})

# SFX Mix track
sfx_inputs = []
sfx_filters = []
sfx_labels = []

for idx, ev in enumerate(sfx_events):
    sfx_inputs.extend(["-i", ev["file"]])
    delay_ms = int(round(ev["time"] * 1000))
    vol = ev["vol"]
    label = f"sfx{idx}"
    sfx_filters.append(f"[{idx}:a]adelay={delay_ms}|{delay_ms},volume={vol}[{label}]")
    sfx_labels.append(f"[{label}]")

all_sfx_labels = "".join(sfx_labels)
sfx_filters.append(f"{all_sfx_labels}amix=inputs={len(sfx_events)}:dropout_transition=0,volume=3.0,apad=whole_dur={total_duration},atrim=0:{total_duration}[sfx_track]")

clean_sfx_file = os.path.join(POST_DIR, "clean_sfx_track.wav")
subprocess.run(["ffmpeg", "-nostdin", "-y"] + sfx_inputs + ["-filter_complex", ";".join(sfx_filters), "-map", "[sfx_track]", clean_sfx_file], capture_output=True, check=True)

print("🎛️ Mixando: Voz Chris (100% volume) + Trilha Suspense (-24 dB) + SFX sutis...", flush=True)

# 3. Mixagem Final com VOZ EM DESTAQUE ABSOLUTO
final_mix_cmd = [
    "ffmpeg", "-nostdin", "-y",
    "-i", clean_voice_file,
    "-stream_loop", "-1", "-i", music_file,
    "-i", clean_sfx_file,
    "-filter_complex",
    f"[0:a]volume=1.0[v];"
    f"[1:a]volume=0.04,atrim=0:{total_duration}[m];"
    f"[2:a]volume=0.40,atrim=0:{total_duration}[s];"
    f"[v][m][s]amix=inputs=3:weights=1.0 0.05 0.35:dropout_transition=0,apad=whole_dur={total_duration},atrim=0:{total_duration}[aout]",
    "-map", "[aout]",
    "-ar", "48000",
    "-b:a", "192k",
    os.path.join(POST_DIR, "master_audio_raw.mp3")
]
subprocess.run(final_mix_cmd, capture_output=True, check=True)

# 4. Normalização com Loudnorm preservando a voz
final_master_audio = os.path.join(POST_DIR, "master_audio.mp3")
subprocess.run([
    "ffmpeg", "-nostdin", "-y",
    "-i", os.path.join(POST_DIR, "master_audio_raw.mp3"),
    "-af", "loudnorm=I=-16:TP=-1.5:LRA=11",
    "-ar", "48000",
    "-b:a", "192k",
    final_master_audio
], capture_output=True, check=True)

# Copiar para public e narration
shutil.copy2(final_master_audio, os.path.join(BASE_DIR, "public", "postproduction", "master_audio.mp3"))
shutil.copy2(final_master_audio, os.path.join(BASE_DIR, "public", "postproduction", "narration.mp3"))
shutil.copy2(final_master_audio, os.path.join(POST_DIR, "narration.mp3"))

# Verificar volume da voz no master
res = subprocess.run(["ffmpeg", "-nostdin", "-i", final_master_audio, "-af", "volumedetect", "-f", "null", "NUL"], capture_output=True, text=True)

print("🎉 ÁUDIO MASTER CRISTALINO GERADO COM SUCESSO!", flush=True)
for l in res.stderr.split("\n"):
    if "mean_volume" in l or "max_volume" in l:
        print("  ", l.strip(), flush=True)

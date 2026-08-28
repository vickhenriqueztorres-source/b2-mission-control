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

print(f"🎵 Construindo Sound Design Master para {total_duration:.2f}s ({len(scenes)} cenas)...")

# Construir narração com os offsets exatos de cada cena
scene_audio_inputs = []
scene_filter_parts = []
mix_labels_voice = []

for idx, sc in enumerate(scenes):
    sc_id = sc["sceneId"]
    sc_file = os.path.join(AUDIO_DIR, f"{sc_id}.mp3")
    delay_ms = int(round((sc["startFrame"] / 30.0) * 1000))
    scene_audio_inputs.extend(["-i", sc_file])
    scene_filter_parts.append(f"[{idx}:a]adelay={delay_ms}|{delay_ms}[v_{idx}]")
    mix_labels_voice.append(f"[v_{idx}]")

all_v_labels = "".join(mix_labels_voice)
scene_filter_parts.append(f"{all_v_labels}amix=inputs={len(scenes)}:duration=first:dropout_transition=0,apad=whole_dur={total_duration},atrim=0:{total_duration}[voice_aligned]")

aligned_voice_file = os.path.join(POST_DIR, "narration_aligned.mp3")
cmd_voice = ["ffmpeg", "-y"] + scene_audio_inputs + ["-filter_complex", ";".join(scene_filter_parts), "-map", "[voice_aligned]", "-b:a", "192k", aligned_voice_file]

print("🎙️ Alinhando as 50 locuções de cena exatamente com seus frames da timeline...")
subprocess.run(cmd_voice, check=True)

# Agora mixar voz alinhada + música + SFX
music_file = os.path.join(PUBLIC_AUDIO_DIR, "music", "cinematic", "suspense", "suspense_unseen_horrors.mp3")
boom_file = os.path.join(PUBLIC_AUDIO_DIR, "sfx", "cinematic", "booms", "boom_explosion_01.wav")
impact_file = os.path.join(PUBLIC_AUDIO_DIR, "sfx", "cinematic", "impacts", "impact_strike_01.wav")
whoosh_file = os.path.join(PUBLIC_AUDIO_DIR, "sfx", "cinematic", "whooshes", "whoosh_swoosh_01.wav")
tension_file = os.path.join(PUBLIC_AUDIO_DIR, "sfx", "cinematic", "tension", "tension_riser_01.wav")

sfx_events = []

# 1. Booms na abertura de cada capítulo
current_ch = ""
for sc in scenes:
    sc_time = sc["startFrame"] / 30.0
    if sc["chapterId"] != current_ch:
        current_ch = sc["chapterId"]
        sfx_events.append({"time": sc_time, "file": boom_file, "vol": 0.28, "type": "CHAPTER_BOOM"})

# 2. Impacts e Whooshes nos Callouts e Transições Rápidas
for sc in scenes:
    sc_time = sc["startFrame"] / 30.0
    if sc.get("callout"):
        sfx_events.append({"time": sc_time, "file": impact_file, "vol": 0.32, "type": "CALLOUT_IMPACT"})
        sfx_events.append({"time": max(0, sc_time - 0.2), "file": whoosh_file, "vol": 0.22, "type": "CALLOUT_WHOOSH"})
    elif sc.get("motionMode") in ["crash_push_in", "dramatic_pull_out"]:
        sfx_events.append({"time": sc_time, "file": whoosh_file, "vol": 0.18, "type": "TRANSITION_WHOOSH"})

# 3. Tension Risers nos pontos críticos de cálculo
for sc in scenes:
    sc_time = sc["startFrame"] / 30.0
    if sc["sceneId"] in ["OOL_015", "OOL_023", "OOL_040"]:
        sfx_events.append({"time": max(0, sc_time - 1.5), "file": tension_file, "vol": 0.20, "type": "TENSION_RISER"})

print(f"📌 Total de eventos de SFX mapeados: {len(sfx_events)}")

# Montar o comando FFmpeg final
inputs = ["-i", aligned_voice_file, "-stream_loop", "-1", "-i", music_file]
filter_parts = []

filter_parts.append("[0:a]volume=1.0[voice]")
filter_parts.append(f"[1:a]volume=0.08,atrim=0:{total_duration}[music]")

mix_labels = ["[voice]", "[music]"]

for idx, ev in enumerate(sfx_events):
    input_idx = idx + 2
    inputs.extend(["-i", ev["file"]])
    delay_ms = int(round(ev["time"] * 1000))
    vol = ev["vol"]
    label = f"sfx{idx}"
    filter_parts.append(f"[{input_idx}:a]adelay={delay_ms}|{delay_ms},volume={vol}[{label}]")
    mix_labels.append(f"[{label}]")

total_inputs = len(mix_labels)
all_labels = "".join(mix_labels)
filter_parts.append(f"{all_labels}amix=inputs={total_inputs}:duration=first:dropout_transition=2,apad=whole_dur={total_duration},atrim=0:{total_duration}[aout]")

out_master_audio = os.path.join(POST_DIR, "master_audio.mp3")
cmd = ["ffmpeg", "-y"] + inputs + ["-filter_complex", ";".join(filter_parts), "-map", "[aout]", "-b:a", "192k", out_master_audio]

print("🎛️ Executando mixagem multi-pista no FFmpeg...")
res = subprocess.run(cmd, capture_output=True, text=True)

if res.returncode != 0:
    print(f"❌ Erro ao mixar: {res.stderr}")
    sys.exit(1)

# Normalizar áudio final
out_norm_audio = os.path.join(POST_DIR, "narration.mp3")
subprocess.run([
    'ffmpeg', '-y',
    '-i', out_master_audio,
    '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11',
    '-b:a', '192k',
    out_norm_audio
], check=True)

# Copiar para public
shutil.copy2(out_norm_audio, os.path.join(BASE_DIR, "public", "postproduction", "master_audio.mp3"))
shutil.copy2(out_norm_audio, os.path.join(BASE_DIR, "public", "postproduction", "narration.mp3"))
shutil.copy2(out_norm_audio, out_master_audio)

probe_cmd = ['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'json', out_master_audio]
probe = subprocess.run(probe_cmd, capture_output=True, text=True)
dur = float(json.loads(probe.stdout)['format']['duration'])

print(f"🎉 MASTER SOUND DESIGN CRIADO COM SUCESSO!")
print(f"   Duração: {dur:.3f}s ({dur/60:.2f} min) | Delta vs Timeline: {abs(dur - total_duration):.3f}s")
print(f"   Tamanho: {os.path.getsize(out_master_audio)/1024/1024:.2f} MB")
print(f"   SFX Mixados: {len(sfx_events)} eventos de sound design de alta imersão.")

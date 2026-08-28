import os
import sys
import json
import subprocess

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
RUN_DIR = os.path.join(BASE_DIR, "runs", "OOL-EP05-RADAR-ASFALTO")
POST_DIR = os.path.join(RUN_DIR, "postproduction")
AUDIO_DIR = os.path.join(POST_DIR, "scenes_audio")

with open(os.path.join(POST_DIR, "scene_timings.json"), "r", encoding="utf-8") as f:
    data = json.load(f)

scenes = data["scenes"]

concat_list_file = os.path.join(POST_DIR, "concat_list.txt")
padded_dir = os.path.join(POST_DIR, "scenes_audio_padded")
os.makedirs(padded_dir, exist_ok=True)

with open(concat_list_file, "w", encoding="utf-8") as cf:
    for sc in scenes:
        sc_id = sc["sceneId"]
        sc_file = os.path.join(AUDIO_DIR, f"{sc_id}.mp3")
        dur = sc["durationFrames"] / 30.0
        padded_file = os.path.join(padded_dir, f"{sc_id}_padded.wav")
        
        # Pad com silêncio até a duração exata da cena
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

print("✅ Todas as 50 cenas foram padded com precisão milimétrica. Concatenando...")
voice_concat = os.path.join(POST_DIR, "narration_concat.wav")
subprocess.run([
    "ffmpeg", "-nostdin", "-y",
    "-f", "concat", "-safe", "0",
    "-i", concat_list_file,
    "-c", "copy",
    voice_concat
], capture_output=True, check=True)

res = subprocess.run([
    "ffmpeg", "-nostdin",
    "-i", voice_concat,
    "-af", "volumedetect",
    "-f", "null", "NUL"
], capture_output=True, text=True)

print("🔊 VOLUME REAL DA NARRAÇÃO CONCATENADA:")
for l in res.stderr.split("\n"):
    if "mean_volume" in l or "max_volume" in l:
        print("  ", l.strip())

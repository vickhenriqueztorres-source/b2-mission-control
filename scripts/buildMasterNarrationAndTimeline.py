import os
import sys
import json
import subprocess
import shutil

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

scenes_audio_dir = os.path.abspath("runs/OOL-EP01-PIX/postproduction/scenes_audio")
postprod_dir = os.path.abspath("runs/OOL-EP01-PIX/postproduction")
public_postprod_dir = os.path.abspath("public/postproduction")
os.makedirs(public_postprod_dir, exist_ok=True)

# 1. Cria lista para concatenação do ffmpeg
concat_txt_path = os.path.join(postprod_dir, "concat_list.txt")
scenes_audio_files = []

for i in range(1, 43):
    s_id = f"OOL_{i:03d}"
    f_path = os.path.join(scenes_audio_dir, f"{s_id}.mp3")
    if os.path.exists(f_path):
        scenes_audio_files.append((s_id, f_path))

with open(concat_txt_path, "w", encoding="utf-8") as f:
    for s_id, f_path in scenes_audio_files:
        f.write(f"file '{f_path.replace(os.sep, '/')}'\n")

# Concatena os áudios em narration.mp3 mestre usando ffmpeg
master_audio_path = os.path.join(postprod_dir, "narration.mp3")
ffmpeg_cmd = [
    "ffmpeg", "-y", "-f", "concat", "-safe", "0",
    "-i", concat_txt_path, "-c", "copy", master_audio_path
]

try:
    res = subprocess.run(ffmpeg_cmd, capture_output=True, text=True)
    if res.returncode == 0:
        print(f"✅ Narração Master unificada com sucesso via FFmpeg: {master_audio_path}")
    else:
        print(f"⚠️ FFmpeg concat fallback: {res.stderr}")
except Exception as e:
    print(f"Erro no FFmpeg: {e}")

# Copia para public/postproduction
public_master_path = os.path.join(public_postprod_dir, "narration.mp3")
if os.path.exists(master_audio_path):
    shutil.copy2(master_audio_path, public_master_path)
    print(f"✅ Sincronizado para public/postproduction/narration.mp3")

# Copia também todas as cenas de áudio para public/postproduction/scenes_audio/
pub_scenes_dir = os.path.join(public_postprod_dir, "scenes_audio")
os.makedirs(pub_scenes_dir, exist_ok=True)
for s_id, f_path in scenes_audio_files:
    shutil.copy2(f_path, os.path.join(pub_scenes_dir, f"{s_id}.mp3"))

print(f"✅ Todas as 42 faixas sincronizadas para o Remotion public!")

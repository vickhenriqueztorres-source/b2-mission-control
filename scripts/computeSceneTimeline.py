import os
import sys
import json
import mutagen
from mutagen.mp3 import MP3

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

audio_dir = os.path.abspath("runs/OOL-EP01-PIX/postproduction/scenes_audio")
scenes_audio_info = []
total_seconds = 0.0

for i in range(1, 43):
    scene_id = f"OOL_{i:03d}"
    mp3_path = os.path.join(audio_dir, f"{scene_id}.mp3")
    if os.path.exists(mp3_path):
        audio = MP3(mp3_path)
        duration = audio.info.length
        # Duração em frames a 30fps (arredondado para cima)
        duration_frames = int(round(duration * 30))
        scenes_audio_info.append({
            "scene_id": scene_id,
            "duration_seconds": round(duration, 3),
            "duration_frames": duration_frames,
            "start_frame": int(round(total_seconds * 30)),
            "start_seconds": round(total_seconds, 3)
        })
        total_seconds += duration

print(f"Total de cenas: {len(scenes_audio_info)}")
print(f"Duração total do áudio: {round(total_seconds, 2)}s ({int(total_seconds // 60)}m {int(total_seconds % 60)}s)")
print(f"Total de frames a 30fps: {int(round(total_seconds * 30))}")

# Salva o manifesto de sincronização exata de tempo
out_path = os.path.abspath("runs/OOL-EP01-PIX/postproduction/scene_timeline_sync.json")
with open(out_path, "w", encoding="utf-8") as f:
    json.dump({
        "fps": 30,
        "total_seconds": total_seconds,
        "total_frames": int(round(total_seconds * 30)),
        "scenes": scenes_audio_info
    }, f, indent=2, ensure_ascii=False)

print(f"Timeline sincronizada salva em: {out_path}")

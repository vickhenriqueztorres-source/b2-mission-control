import json
import os
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

timeline_path = "runs/OOL-EP01-PIX/postproduction/scene_timeline_sync.json"
script_path = "runs/OOL-EP01-PIX/editorial/06-script-approved.json"
exec_dir = "runs/OOL-EP01-PIX/editorial/execution"

with open(timeline_path, "r", encoding="utf-8") as f:
    timeline = json.load(f)

with open(script_path, "r", encoding="utf-8") as f:
    script = json.load(f)

print("=== DIAGNÓSTICO FORENSE DE DINAMISMO DAS 42 CENAS ===")
print(f"Duração Total: {timeline['total_seconds']:.2f}s ({timeline['total_frames']} frames)")

total_video_sec = 0
total_image_sec = 0

for s in timeline["scenes"]:
    s_id = s["scene_id"]
    dur = s["duration_seconds"]
    frames = s["duration_frames"]
    
    has_video = os.path.exists(os.path.join(exec_dir, s_id, "firefly_take.mp4"))
    has_image = os.path.exists(os.path.join(exec_dir, s_id, "firefly_start_frame.png"))
    
    if has_video:
        total_video_sec += dur
    else:
        total_image_sec += dur
        
    print(f"[{s_id}] {dur:5.2f}s ({frames:3d}f) | Tipo: {'VÍDEO FÍSICO (Firefly)' if has_video else 'IMAGEM ESTÁTICA COM ZOOM'}")

print(f"\nTempo Total em Vídeos Físicos: {total_video_sec:.2f}s ({(total_video_sec/timeline['total_seconds'])*100:.1f}%)")
print(f"Tempo Total em Imagens Estáticas: {total_image_sec:.2f}s ({(total_image_sec/timeline['total_seconds'])*100:.1f}%)")

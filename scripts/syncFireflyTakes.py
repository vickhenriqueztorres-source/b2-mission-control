import os
import sys
import json
import shutil

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

firefly_root = r"C:\Users\brend\OneDrive\Desktop\B2 ENTERPRISE\Canais_\Mateo - Copia\agente firefly"
firefly_output = os.path.join(firefly_root, "output")
firefly_data_output = os.path.join(firefly_root, "data", "output")
exec_dir = os.path.abspath("runs/OOL-EP01-PIX/editorial/execution")
pub_exec_dir = os.path.abspath("public/editorial/execution")

print("🔍 Sincronizando novos vídeos do Firefly...")

all_sources = [firefly_output, firefly_data_output, r"C:\Users\brend\Downloads"]
copied_count = 0

for i in range(1, 43):
    s_id = f"OOL_{i:03d}"
    target_scene_dir = os.path.join(exec_dir, s_id)
    pub_scene_dir = os.path.join(pub_exec_dir, s_id)
    os.makedirs(target_scene_dir, exist_ok=True)
    os.makedirs(pub_scene_dir, exist_ok=True)
    
    target_video = os.path.join(target_scene_dir, "firefly_take.mp4")
    pub_video = os.path.join(pub_scene_dir, "firefly_take.mp4")
    
    # Procura nos diretórios de output do Firefly
    for src_dir in all_sources:
        if not os.path.exists(src_dir):
            continue
        for f in os.listdir(src_dir):
            if s_id.lower() in f.lower() and f.endswith(".mp4"):
                src_file = os.path.join(src_dir, f)
                if not os.path.exists(target_video) or os.path.getsize(src_file) > 1000:
                    shutil.copy2(src_file, target_video)
                    shutil.copy2(src_file, pub_video)
                    copied_count += 1
                    print(f"  ✅ [{s_id}] Novo vídeo sincronizado de {src_file}")
                    break

# Atualiza availableMedia.json
media_manifest = {}
video_count = 0
for i in range(1, 43):
    s_id = f"OOL_{i:03d}"
    has_vid = os.path.exists(os.path.join(exec_dir, s_id, "firefly_take.mp4"))
    has_img = os.path.exists(os.path.join(exec_dir, s_id, "firefly_start_frame.png"))
    if has_vid:
        video_count += 1
    media_manifest[s_id] = {
        "hasVideo": has_vid,
        "hasImage": has_img
    }

with open("remotion/availableMedia.json", "w", encoding="utf-8") as f:
    json.dump(media_manifest, f, indent=2)

print(f"\n📊 Total de Cenas com VÍDEO REAL (.mp4): {video_count}/42 ({(video_count/42)*100:.1f}%)")

import os
import sys
import json
import sqlite3

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

execution_dir = os.path.abspath("runs/OOL-EP01-PIX/editorial/execution")
postprod_dir = os.path.abspath("runs/OOL-EP01-PIX/postproduction")
db_path = r"C:\Users\brend\OneDrive\Desktop\B2 ENTERPRISE\Canais_\Mateo - Copia\agente firefly\data\firefly_jobs.db"
saida_dir = r"C:\Users\brend\OneDrive\Desktop\B2 ENTERPRISE\Canais_\Mateo - Copia\agente firefly\saida"

# 1. Status do banco do Firefly
firefly_status = {}
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    c.execute("SELECT name, status, attempts, error FROM jobs WHERE name LIKE 'OOL_%' ORDER BY id ASC")
    for name, status, attempts, error in c.fetchall():
        firefly_status[name] = {"status": status, "attempts": attempts, "error": error}
    conn.close()

# 2. Cenas em disco
scenes = [d for d in os.listdir(execution_dir) if d.startswith("OOL_")]
scenes.sort()

report = {
    "total_scenes": len(scenes),
    "audios_generated": 0,
    "start_frames_ready": 0,
    "firefly_videos_completed": 0,
    "overlay_specs_ready": 0,
    "scenes_detail": []
}

for scene_id in scenes:
    s_dir = os.path.join(execution_dir, scene_id)
    spec_path = os.path.join(s_dir, "overlay_spec.json")
    start_frame_path = os.path.join(s_dir, "firefly_start_frame.png")
    take_path = os.path.join(s_dir, "firefly_take.mp4")
    saida_take = os.path.join(saida_dir, f"{scene_id}.mp4")
    audio_path = os.path.join(postprod_dir, "scenes_audio", f"{scene_id}.mp3")

    has_spec = os.path.exists(spec_path)
    has_start_frame = os.path.exists(start_frame_path)
    has_audio = os.path.exists(audio_path)
    
    # Se existe na saída do Firefly mas não foi copiado ainda, copia
    if os.path.exists(saida_take) and not os.path.exists(take_path):
        import shutil
        shutil.copy2(saida_take, take_path)
    
    has_take = os.path.exists(take_path)

    if has_spec: report["overlay_specs_ready"] += 1
    if has_start_frame: report["start_frames_ready"] += 1
    if has_audio: report["audios_generated"] += 1
    if has_take: report["firefly_videos_completed"] += 1

    db_info = firefly_status.get(scene_id, {"status": "n/a", "attempts": 0})

    report["scenes_detail"].append({
        "scene_id": scene_id,
        "audio": "OK" if has_audio else "PENDING",
        "start_frame": "OK" if has_start_frame else "PENDING",
        "firefly_video": "CONCLUÍDO" if has_take else db_info.get("status", "PENDING").upper(),
        "overlay_spec": "OK" if has_spec else "PENDING"
    })

print(json.dumps(report, indent=2, ensure_ascii=False))

import os
import sys
import json
import shutil
import time

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

execution_dir = os.path.abspath("runs/OOL-EP01-PIX/editorial/execution")
bot_output_dir = os.path.abspath("chatgpt-image-bot/output")
manifest_path = os.path.join(bot_output_dir, "manifest.jsonl")
public_exec_dir = os.path.abspath("public/editorial/execution")
os.makedirs(public_exec_dir, exist_ok=True)

# Mapeia prompts para scene_id
prompts_map = {}
for i in range(1, 43):
    s_id = f"OOL_{i:03d}"
    p_file = os.path.join(execution_dir, s_id, "clean_start_frame_prompt.txt")
    if os.path.exists(p_file):
        with open(p_file, "r", encoding="utf-8") as pf:
            prompts_map[pf.read().strip()] = s_id

def sync_now():
    synced_count = 0
    if not os.path.exists(manifest_path):
        return 0

    with open(manifest_path, "r", encoding="utf-8") as mf:
        for line in mf:
            try:
                data = json.loads(line.strip())
                if data.get("status") == "success":
                    p_text = data.get("prompt", "").strip()
                    img_path = data.get("file_path", "")
                    if img_path and not os.path.isabs(img_path):
                        img_path = os.path.join(bot_output_dir, img_path)

                    target_scene = prompts_map.get(p_text)
                    if target_scene and os.path.exists(img_path):
                        # Copia para runs/
                        target_file = os.path.join(execution_dir, target_scene, "firefly_start_frame.png")
                        if not os.path.exists(target_file) or os.path.getsize(target_file) != os.path.getsize(img_path):
                            shutil.copy2(img_path, target_file)
                            synced_count += 1
                            print(f"✅ Sincronizado para cena: {target_scene} ➔ firefly_start_frame.png")

                        # Copia para public/
                        pub_target_file = os.path.join(public_exec_dir, target_scene, "firefly_start_frame.png")
                        os.makedirs(os.path.dirname(pub_target_file), exist_ok=True)
                        if not os.path.exists(pub_target_file) or os.path.getsize(pub_target_file) != os.path.getsize(img_path):
                            shutil.copy2(img_path, pub_target_file)
            except Exception as e:
                pass
    return synced_count

count = sync_now()
print(f"📊 Sincronização executada. Total de novos frames distribuídos: {count}")

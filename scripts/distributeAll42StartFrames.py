import os
import sys
import json
import shutil

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

execution_dir = os.path.abspath("runs/OOL-EP01-PIX/editorial/execution")
bot_output_dir = os.path.abspath("chatgpt-image-bot/output")
manifest_path = os.path.join(bot_output_dir, "manifest.jsonl")
public_exec_dir = os.path.abspath("public/editorial/execution")
os.makedirs(public_exec_dir, exist_ok=True)

# 1. Carrega todos os prompts de cada cena
scene_prompts = {}
for i in range(1, 43):
    s_id = f"OOL_{i:03d}"
    p_file = os.path.join(execution_dir, s_id, "clean_start_frame_prompt.txt")
    if os.path.exists(p_file):
        with open(p_file, "r", encoding="utf-8") as pf:
            scene_prompts[s_id] = pf.read().strip()

# 2. Carrega manifest.jsonl
manifest_items = []
with open(manifest_path, "r", encoding="utf-8") as mf:
    for line in mf:
        try:
            data = json.loads(line.strip())
            if data.get("status") == "success":
                manifest_items.append(data)
        except Exception:
            pass

print(f"Total de imagens bem-sucedidas no manifesto: {len(manifest_items)}")

matched_count = 0
for item in manifest_items:
    item_prompt = item.get("prompt", "").strip()
    filename = item.get("filename")
    filepath = item.get("filepath")

    img_file = None
    if filepath and os.path.exists(filepath):
        img_file = filepath
    elif filename and os.path.exists(os.path.join(bot_output_dir, filename)):
        img_file = os.path.join(bot_output_dir, filename)

    if not img_file or not os.path.exists(img_file):
        continue

    # Encontra a cena correspondente
    matched_scene = None
    for s_id, p_text in scene_prompts.items():
        if p_text.lower() == item_prompt.lower() or p_text[:50].lower() in item_prompt.lower() or item_prompt[:50].lower() in p_text.lower():
            matched_scene = s_id
            break

    if matched_scene:
        dst_runs = os.path.join(execution_dir, matched_scene, "firefly_start_frame.png")
        dst_pub = os.path.join(public_exec_dir, matched_scene, "firefly_start_frame.png")
        os.makedirs(os.path.dirname(dst_runs), exist_ok=True)
        os.makedirs(os.path.dirname(dst_pub), exist_ok=True)

        shutil.copy2(img_file, dst_runs)
        shutil.copy2(img_file, dst_pub)
        matched_count += 1
        print(f"✅ [{matched_scene}] Start Frame 35mm copiado! ({os.path.basename(img_file)})")

print(f"\n🎉 Total de cenas com Start Frame 35mm sincronizado: {matched_count}/42")

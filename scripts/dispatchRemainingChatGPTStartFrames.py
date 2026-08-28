import os
import sys
import json
import shutil

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

execution_dir = os.path.abspath("runs/OOL-EP01-PIX/editorial/execution")
bot_output_dir = os.path.abspath("chatgpt-image-bot/output")
bot_queue_file = os.path.abspath("chatgpt-image-bot/queue.jsonl")

# 1. Primeiro verifica se já existem imagens no output do bot que ainda não foram copiadas
if os.path.exists(bot_output_dir):
    for f in os.listdir(bot_output_dir):
        if f.endswith(".png"):
            # Ex: OOL_002_xxx.png ou OOL_002.png
            scene_prefix = f.split("_")[0] + "_" + f.split("_")[1] if len(f.split("_")) >= 2 else ""
            if scene_prefix.startswith("OOL_"):
                dst_scene_file = os.path.join(execution_dir, scene_prefix, "firefly_start_frame.png")
                if not os.path.exists(dst_scene_file):
                    shutil.copy2(os.path.join(bot_output_dir, f), dst_scene_file)
                    print(f"📦 Copiado do cache existente: {f} ➔ {scene_prefix}")

# 2. Identifica quais das 42 cenas ainda não têm Start Frame
pending_scenes = []
for i in range(1, 43):
    s_id = f"OOL_{i:03d}"
    s_dir = os.path.join(execution_dir, s_id)
    start_frame = os.path.join(s_dir, "firefly_start_frame.png")
    prompt_file = os.path.join(s_dir, "clean_start_frame_prompt.txt")

    if not os.path.exists(start_frame):
        prompt_text = ""
        if os.path.exists(prompt_file):
            with open(prompt_file, "r", encoding="utf-8") as pf:
                prompt_text = pf.read().strip()
        pending_scenes.append({
            "id": s_id,
            "prompt": prompt_text,
            "filename": f"{s_id}.png"
        })

print(f"📊 Status Start Frames: {42 - len(pending_scenes)}/42 prontos. {len(pending_scenes)} pendentes de geração.")

if pending_scenes:
    # Escreve a nova fila no chatgpt-image-bot
    with open(bot_queue_file, "w", encoding="utf-8") as qf:
        for item in pending_scenes:
            qf.write(json.dumps(item, ensure_ascii=False) + "\n")
    print(f"📝 {len(pending_scenes)} prompts gravados na fila: {bot_queue_file}")
else:
    print("🎉 Todos os 42 Start Frames estão 100% prontos!")

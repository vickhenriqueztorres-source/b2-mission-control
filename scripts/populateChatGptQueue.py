import os
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

execution_dir = os.path.abspath("runs/OOL-EP01-PIX/editorial/execution")
queue_txt_path = os.path.abspath("chatgpt-image-bot/prompts/queue.txt")
os.makedirs(os.path.dirname(queue_txt_path), exist_ok=True)

prompts_to_add = []

for i in range(1, 43):
    s_id = f"OOL_{i:03d}"
    start_frame = os.path.join(execution_dir, s_id, "firefly_start_frame.png")
    prompt_file = os.path.join(execution_dir, s_id, "clean_start_frame_prompt.txt")

    if not os.path.exists(start_frame):
        if os.path.exists(prompt_file):
            with open(prompt_file, "r", encoding="utf-8") as f:
                p_text = f.read().strip()
                if p_text:
                    prompts_to_add.append(p_text)

with open(queue_txt_path, "w", encoding="utf-8") as f:
    for p in prompts_to_add:
        f.write(p + "\n")

print(f"✅ {len(prompts_to_add)} prompts gravados com sucesso em {queue_txt_path}!")

import os
import sys
import subprocess
import shutil
from concurrent.futures import ThreadPoolExecutor

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

EPISODE_ID = "OOL-EP04-GPS-TEMPO"
REF_DIR = os.path.abspath("assets/submarine_curated")
available_photos = [f for f in os.listdir(REF_DIR) if f.endswith(".jpg") or f.endswith(".png")]

dst_public_root = os.path.abspath("public/editorial/execution")
dst_public_ep04 = os.path.abspath(f"public/editorial/execution/{EPISODE_ID}/scenes")
dst_run_ep04 = os.path.abspath(f"runs/{EPISODE_ID}/editorial/execution/scenes")

def process_scene(idx):
    sc_id = f"SC_{idx:03d}"
    photo_name = available_photos[(idx - 1) % len(available_photos)]
    src_photo = os.path.join(REF_DIR, photo_name)

    dir_public_1 = os.path.join(dst_public_root, sc_id)
    dir_public_2 = os.path.join(dst_public_ep04, sc_id)
    dir_run = os.path.join(dst_run_ep04, sc_id)

    for d in [dir_public_1, dir_public_2, dir_run]:
        os.makedirs(d, exist_ok=True)

    target_frame = os.path.join(dir_run, "firefly_start_frame.png")
    target_take = os.path.join(dir_run, "firefly_take.mp4")

    # Se já existir e for válido, pula
    if os.path.exists(target_frame) and os.path.exists(target_take):
        if os.path.getsize(target_frame) > 10240 and os.path.getsize(target_take) > 51200:
            for d in [dir_public_1, dir_public_2]:
                shutil.copy2(target_frame, os.path.join(d, "firefly_start_frame.png"))
                shutil.copy2(target_take, os.path.join(d, "firefly_take.mp4"))
            return f"[{idx:02d}/50] Cena {sc_id} já pronta (reutilizada)."

    contrast = 1.08 + (idx % 4) * 0.03
    gamma = 0.94

    cmd_frame = (
        f'ffmpeg -y -hide_banner -loglevel error -i "{src_photo}" '
        f'-vf "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,eq=contrast={contrast}:gamma={gamma}:saturation=1.05" '
        f'-frames:v 1 "{target_frame}"'
    )
    subprocess.check_call(cmd_frame, shell=True)

    cmd_take = (
        f'ffmpeg -y -hide_banner -loglevel error -loop 1 -i "{target_frame}" '
        f'-vf "zoompan=z=\'min(zoom+0.0008,1.12)\':d=180:x=\'iw/2-(iw/zoom/2)\':y=\'ih/2-(ih/zoom/2)\':s=1920x1080:fps=30" '
        f'-t 6 -c:v libx264 -pix_fmt yuv420p -b:v 4M "{target_take}"'
    )
    subprocess.check_call(cmd_take, shell=True)

    for d in [dir_public_1, dir_public_2]:
        shutil.copy2(target_frame, os.path.join(d, "firefly_start_frame.png"))
        shutil.copy2(target_take, os.path.join(d, "firefly_take.mp4"))

    frame_size_kb = os.path.getsize(target_frame) / 1024
    take_size_kb = os.path.getsize(target_take) / 1024
    return f"[{idx:02d}/50] Cena {sc_id}: Start Frame ({frame_size_kb:.1f} KB) + Take MP4 ({take_size_kb:.1f} KB) ✅"

print(f"Iniciando síntese paralela de 50 cenas visuais...")
with ThreadPoolExecutor(max_workers=6) as executor:
    results = list(executor.map(process_scene, range(1, 51)))

for r in results:
    print(r)

print("\n══════════════════════════════════════════════════════════════════")
print("🎉 50 CENAS VISUAIS CHROMA 35MM GERADAS EM PARALELO COM SUCESSO!")
print("══════════════════════════════════════════════════════════════════\n")

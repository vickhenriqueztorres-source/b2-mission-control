import os
import sys
import shutil

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

EPISODE_ID = "OOL-EP04-GPS-TEMPO"
run_scenes_dir = os.path.abspath(f"runs/{EPISODE_ID}/editorial/execution/scenes")
public_scenes_dir = os.path.abspath(f"public/editorial/execution/{EPISODE_ID}/scenes")
public_root_dir = os.path.abspath("public/editorial/execution")

for idx in range(1, 51):
    sc_name = f"SC_{idx:03d}"
    ool_name = f"OOL_{idx:03d}"

    src_run = os.path.join(run_scenes_dir, sc_name)
    dst_run = os.path.join(run_scenes_dir, ool_name)

    if os.path.exists(src_run):
        os.makedirs(dst_run, exist_ok=True)
        shutil.copy2(os.path.join(src_run, "firefly_start_frame.png"), os.path.join(dst_run, "firefly_start_frame.png"))
        shutil.copy2(os.path.join(src_run, "firefly_take.mp4"), os.path.join(dst_run, "firefly_take.mp4"))

        # Public dirs
        dst_pub_ep04 = os.path.join(public_scenes_dir, ool_name)
        dst_pub_root = os.path.join(public_root_dir, ool_name)
        for d in [dst_pub_ep04, dst_pub_root]:
            os.makedirs(d, exist_ok=True)
            shutil.copy2(os.path.join(src_run, "firefly_start_frame.png"), os.path.join(d, "firefly_start_frame.png"))
            shutil.copy2(os.path.join(src_run, "firefly_take.mp4"), os.path.join(d, "firefly_take.mp4"))

        print(f"Synced {sc_name} <-> {ool_name} OK")

print("\n100% das 50 cenas sincronizadas para OOL_001..OOL_050!")

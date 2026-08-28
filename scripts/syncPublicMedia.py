import os
import shutil
import json

src_base = r"public/editorial/execution/OOL-EP02-CABOS/scenes"
dst_base = r"public/editorial/execution"

media_dict = {}

# Also keep existing media
existing_json_path = r"remotion/availableMedia.json"
if os.path.exists(existing_json_path):
    with open(existing_json_path, "r", encoding="utf-8") as f:
        try:
            media_dict = json.load(f)
        except Exception:
            media_dict = {}

if os.path.exists(src_base):
    for sc in os.listdir(src_base):
        sc_dir = os.path.join(src_base, sc)
        if os.path.isdir(sc_dir):
            target_sc_dir = os.path.join(dst_base, sc)
            os.makedirs(target_sc_dir, exist_ok=True)
            
            has_vid = False
            has_img = False
            
            src_take = os.path.join(sc_dir, "firefly_take.mp4")
            src_frame = os.path.join(sc_dir, "firefly_start_frame.png")
            
            dst_take = os.path.join(target_sc_dir, "firefly_take.mp4")
            dst_frame = os.path.join(target_sc_dir, "firefly_start_frame.png")
            
            if os.path.exists(src_take):
                shutil.copy2(src_take, dst_take)
                has_vid = True
            if os.path.exists(src_frame):
                shutil.copy2(src_frame, dst_frame)
                has_img = True
                
            media_dict[sc] = {
                "hasVideo": has_vid,
                "hasImage": has_img
            }

with open(existing_json_path, "w", encoding="utf-8") as f_out:
    json.dump(media_dict, f_out, indent=2)

print(f"Updated availableMedia.json with {len(media_dict)} scenes.")

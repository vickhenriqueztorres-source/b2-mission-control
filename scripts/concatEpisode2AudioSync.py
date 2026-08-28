import os
import json
import shutil
import subprocess

audio_dir = r"runs/OOL-EP02-CABOS/postproduction/scenes_audio"
output_mp3 = r"runs/OOL-EP02-CABOS/postproduction/narration.mp3"
public_mp3_1 = r"public/editorial/execution/OOL-EP02-CABOS/narration.mp3"
public_mp3_2 = r"public/postproduction_ep02/narration.mp3"
timings_json = r"runs/OOL-EP02-CABOS/postproduction/scene_timings.json"
concat_list = r"runs/OOL-EP02-CABOS/postproduction/concat_list.txt"

scenes = []
current_frame = 0
files_to_concat = []

for i in range(1, 51):
    sc_id = f"SC_{i:03d}"
    mp3_file = os.path.join(audio_dir, f"{sc_id}.mp3")
    if os.path.exists(mp3_file):
        cmd = f'ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "{mp3_file}"'
        dur_s = float(subprocess.check_output(cmd, shell=True, text=True).strip())
        frames = int(round(dur_s * 30))
        
        scenes.append({
            "sceneId": sc_id,
            "startFrame": current_frame,
            "durationFrames": frames,
            "durationSeconds": dur_s
        })
        current_frame += frames
        files_to_concat.append(os.path.abspath(mp3_file))

# Write concat list
with open(concat_list, "w", encoding="utf-8") as f:
    for fpath in files_to_concat:
        f.write(f"file '{fpath}'\n")

# Concat with ffmpeg
cmd_concat = f'ffmpeg -y -f concat -safe 0 -i "{concat_list}" -c copy "{output_mp3}"'
subprocess.check_call(cmd_concat, shell=True)

# Copy to public directories
for p in [public_mp3_1, public_mp3_2]:
    os.makedirs(os.path.dirname(p), exist_ok=True)
    shutil.copy2(output_mp3, p)

# Save exact matched timings
with open(timings_json, "w", encoding="utf-8") as f:
    json.dump(scenes, f, indent=2)

cmd_probe = f'ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "{output_mp3}"'
dur_total = float(subprocess.check_output(cmd_probe, shell=True, text=True).strip())

print(f"Concatenated 50 audio scenes:")
print(f"Total audio duration: {dur_total:.2f}s ({current_frame} frames)")
print(f"Timeline duration:    {current_frame / 30:.2f}s")
print(f"Delta:                {abs(dur_total - current_frame / 30):.4f}s")

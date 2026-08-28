import os
import subprocess
import json

audio_dir = r"runs/OOL-EP02-CABOS/postproduction/scenes_audio"
output_narration = r"runs/OOL-EP02-CABOS/postproduction/narration.mp3"
public_narration = r"public/editorial/execution/OOL-EP02-CABOS/narration.mp3"
os.makedirs(os.path.dirname(public_narration), exist_ok=True)

files = sorted([f for f in os.listdir(audio_dir) if f.startswith('SC_') and f.endswith('.mp3')])
print(f"Found {len(files)} scene audio files.")

# Create concat list for ffmpeg
list_file = r"runs/OOL-EP02-CABOS/postproduction/audio_list.txt"
scene_timings = []
current_frame = 0
fps = 30

with open(list_file, "w", encoding="utf-8") as f_out:
    for f in files:
        full_p = os.path.abspath(os.path.join(audio_dir, f))
        f_out.write(f"file '{full_p}'\n")
        
        # Get duration of each clip
        cmd = f'ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "{full_p}"'
        dur = float(subprocess.check_output(cmd, shell=True, text=True).strip())
        frames = max(int(dur * fps) + 15, 90) # min 3s per scene with padding
        
        scene_id = f.replace('.mp3', '')
        scene_timings.append({
            "sceneId": scene_id,
            "startFrame": current_frame,
            "durationFrames": frames,
            "durationSeconds": dur
        })
        current_frame += frames

print(f"Total Frames: {current_frame} @ {fps}fps = {current_frame / fps:.2f}s ({(current_frame / fps) / 60:.2f} minutes)")

# Concatenate with ffmpeg
cmd_concat = f'ffmpeg -y -f concat -safe 0 -i "{list_file}" -c copy "{output_narration}"'
subprocess.check_call(cmd_concat, shell=True)
print(f"Concatenated narration saved to {output_narration}")

# Copy to public
import shutil
shutil.copy2(output_narration, public_narration)
print(f"Copied narration to {public_narration}")

# Save scene timings JSON
timings_path = r"runs/OOL-EP02-CABOS/postproduction/scene_timings.json"
with open(timings_path, "w", encoding="utf-8") as f_json:
    json.dump(scene_timings, f_json, indent=2)
print(f"Saved timings to {timings_path}")

import os
import subprocess

run_dir = os.path.abspath("runs/OOL-EP04-GPS-TEMPO/editorial/execution/scenes")
valid_takes = 0
invalid_takes = []

for idx in range(1, 51):
    p = os.path.join(run_dir, f"OOL_{idx:03d}", "firefly_take.mp4")
    if os.path.exists(p) and os.path.getsize(p) > 51200:
        try:
            probe = subprocess.check_output(f'ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "{p}"', shell=True, text=True).strip()
            if float(probe) > 0:
                valid_takes += 1
            else:
                invalid_takes.append(f"OOL_{idx:03d} (zero duration)")
        except Exception as e:
            invalid_takes.append(f"OOL_{idx:03d} ({e})")
    else:
        invalid_takes.append(f"OOL_{idx:03d} (missing/small)")

print(f"Valid takes: {valid_takes} / 50")
if invalid_takes:
    print(f"Invalid takes: {invalid_takes}")

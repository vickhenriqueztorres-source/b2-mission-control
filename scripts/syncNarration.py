import shutil
import subprocess

src = 'public/editorial/execution/OOL-EP02-CABOS/narration.mp3'
dst = 'runs/OOL-EP02-CABOS/postproduction/narration.mp3'

shutil.copy2(src, dst)

cmd_probe = f'ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "{dst}"'
out = subprocess.check_output(cmd_probe, shell=True, text=True).strip()
print('runs narration.mp3 verified duration:', out)

import os
import sys
import subprocess
import json

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
RUN_DIR = os.path.join(BASE_DIR, "runs", "OOL-EP05-RADAR-ASFALTO")
POST_DIR = os.path.join(RUN_DIR, "postproduction")
AUDIO_DIR = os.path.join(POST_DIR, "scenes_audio")
VIDEO_PATH = os.path.join(RUN_DIR, "final_master.mp4")

print("🔍 DIAGNÓSTICO PROFUNDO DE ÁUDIO:", flush=True)

# 1. Checar vídeo final
if os.path.exists(VIDEO_PATH):
    print(f"Vídeo Final: {VIDEO_PATH} ({os.path.getsize(VIDEO_PATH)/1024/1024:.2f} MB)", flush=True)
    res = subprocess.run(['ffmpeg', '-nostdin', '-i', VIDEO_PATH, '-af', 'volumedetect', '-f', 'null', '-'], capture_output=True, text=True)
    for line in res.stderr.split('\n'):
        if 'mean_volume' in line or 'max_volume' in line:
            print(f"  [Vídeo Final] {line.strip()}", flush=True)

# 2. Checar master_audio.mp3
master_audio = os.path.join(POST_DIR, "master_audio.mp3")
if os.path.exists(master_audio):
    print(f"\nMaster Audio: {master_audio} ({os.path.getsize(master_audio)/1024/1024:.2f} MB)", flush=True)
    res = subprocess.run(['ffmpeg', '-nostdin', '-i', master_audio, '-af', 'volumedetect', '-f', 'null', '-'], capture_output=True, text=True)
    for line in res.stderr.split('\n'):
        if 'mean_volume' in line or 'max_volume' in line:
            print(f"  [Master Audio] {line.strip()}", flush=True)

# 3. Checar narration_aligned.mp3
narration_aligned = os.path.join(POST_DIR, "narration_aligned.mp3")
if os.path.exists(narration_aligned):
    print(f"\nNarration Aligned: {narration_aligned} ({os.path.getsize(narration_aligned)/1024/1024:.2f} MB)", flush=True)
    res = subprocess.run(['ffmpeg', '-nostdin', '-i', narration_aligned, '-af', 'volumedetect', '-f', 'null', '-'], capture_output=True, text=True)
    for line in res.stderr.split('\n'):
        if 'mean_volume' in line or 'max_volume' in line:
            print(f"  [Narration Aligned] {line.strip()}", flush=True)

# 4. Checar cenas individuais
print("\nCenas individuais em scenes_audio:", flush=True)
for i in range(1, 6):
    f = os.path.join(AUDIO_DIR, f"OOL_{i:03d}.mp3")
    if os.path.exists(f):
        res_s = subprocess.run(['ffmpeg', '-nostdin', '-i', f, '-af', 'volumedetect', '-f', 'null', '-'], capture_output=True, text=True)
        mean_v = [l.strip() for l in res_s.stderr.split('\n') if 'mean_volume' in l or 'max_volume' in l]
        probe = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'json', f], capture_output=True, text=True)
        dur = float(json.loads(probe.stdout)['format']['duration'])
        print(f"  OOL_{i:03d}.mp3: size={os.path.getsize(f)} bytes, duration={dur:.2f}s, vol={mean_v}", flush=True)

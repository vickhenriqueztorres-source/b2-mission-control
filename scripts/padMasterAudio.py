import os
import subprocess
import json
import shutil

voice_mp3 = os.path.abspath('runs/OOL-EP05-RADAR-ASFALTO/postproduction/narration.mp3')
music_mp3 = os.path.abspath('public/audio/music/cinematic/suspense/suspense_unseen_horrors.mp3')
out_mp3 = os.path.abspath('runs/OOL-EP05-RADAR-ASFALTO/postproduction/master_audio.mp3')

cmd = [
    'ffmpeg', '-y',
    '-i', voice_mp3,
    '-stream_loop', '-1', '-i', music_mp3,
    '-filter_complex',
    '[0:a]apad=whole_dur=390.0[voice_padded];[1:a]volume=0.08,atrim=0:390[bg];[voice_padded][bg]amix=inputs=2:duration=first:dropout_transition=2,atrim=0:390[aout]',
    '-map', '[aout]',
    '-b:a', '192k',
    out_mp3
]

res = subprocess.run(cmd, capture_output=True, text=True)
if res.returncode == 0:
    shutil.copy2(out_mp3, voice_mp3)
    shutil.copy2(out_mp3, 'public/postproduction/master_audio.mp3')
    shutil.copy2(out_mp3, 'public/postproduction/narration.mp3')
    
    probe_cmd = ['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'json', out_mp3]
    probe = subprocess.run(probe_cmd, capture_output=True, text=True)
    dur = float(json.loads(probe.stdout)['format']['duration'])
    print(f"✅ Audio Master padded to exactly {dur:.3f}s (Delta = {abs(dur - 390.0):.3f}s)")
else:
    print(f"❌ Error: {res.stderr}")

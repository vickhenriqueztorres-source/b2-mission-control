import os
import subprocess
import shutil

voice_mp3 = os.path.abspath('runs/OOL-EP05-RADAR-ASFALTO/postproduction/narration.mp3')
music_mp3 = os.path.abspath('public/audio/music/cinematic/suspense/suspense_unseen_horrors.mp3')
out_mp3 = os.path.abspath('runs/OOL-EP05-RADAR-ASFALTO/postproduction/master_audio.mp3')
pub_mp3 = os.path.abspath('public/postproduction/master_audio.mp3')

print(f"Voice exists: {os.path.exists(voice_mp3)}")
print(f"Music exists: {os.path.exists(music_mp3)}")

cmd = [
    'ffmpeg', '-y',
    '-i', voice_mp3,
    '-stream_loop', '-1', '-i', music_mp3,
    '-filter_complex',
    '[1:a]volume=0.08[bg];[0:a][bg]amix=inputs=2:duration=first:dropout_transition=2[aout]',
    '-map', '[aout]',
    '-b:a', '192k',
    out_mp3
]

res = subprocess.run(cmd, capture_output=True, text=True)
if res.returncode == 0:
    shutil.copy2(out_mp3, pub_mp3)
    print(f"✅ Master audio created at {pub_mp3} ({os.path.getsize(pub_mp3)/1024/1024:.2f} MB)")
else:
    print(f"❌ Error: {res.stderr}")

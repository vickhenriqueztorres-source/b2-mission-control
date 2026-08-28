import os
import re
import shutil

referenced = set()
for root, dirs, files in os.walk('remotion'):
    for f in files:
        if f.endswith('.tsx') or f.endswith('.ts'):
            with open(os.path.join(root, f), 'r', encoding='utf-8', errors='ignore') as fh:
                content = fh.read()
                matches = re.findall(r"staticFile\(['\"]([^'\"]+)['\"]", content)
                for m in matches:
                    referenced.add(m.replace('/', os.sep))

print(f"Total referenced static files in remotion code: {len(referenced)}")

archive_dir = r"assets/audio_library"
os.makedirs(archive_dir, exist_ok=True)

moved_count = 0
moved_bytes = 0

for root, dirs, files in os.walk('public/audio'):
    for f in files:
        full_p = os.path.join(root, f)
        rel_p = os.path.relpath(full_p, 'public').replace('/', os.sep)
        
        # Check if this exact file is referenced
        if rel_p not in referenced and rel_p.replace(os.sep, '/') not in referenced:
            target_p = os.path.join(archive_dir, rel_p)
            os.makedirs(os.path.dirname(target_p), exist_ok=True)
            sz = os.path.getsize(full_p)
            shutil.move(full_p, target_p)
            moved_count += 1
            moved_bytes += sz

print(f"Moved {moved_count} unused audio files ({moved_bytes / (1024**3):.2f} GB) to {archive_dir}")

total, used, free = shutil.disk_usage('C:\\')
print(f"C: Free disk space now: {free / (1024**3):.2f} GB")

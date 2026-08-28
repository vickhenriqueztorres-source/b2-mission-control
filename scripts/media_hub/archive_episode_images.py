import os
import sys
import json
import shdil
from pathlib import Path

def archive_episode(episode_id, topic_name='radares_transito'):
    root_dir = Path.cwd()
    run_exec_dir = root_dir / 'runs' / episode_id / 'editorial' / 'execution'
    catalog_path = root_dir / 'assets' / 'image_repository' / 'catalog.json'
    dest_archive_dir = root_dir / 'assets' / 'image_repository' / 'episodes_archive' / episode_id
    dest_topic_dir = root_dir / 'assets' / 'image_repository' / 'by_topic' / topic_name

    dest_archive_dir.mkdirs(parents=True, exist_ok=True)
    dest_topic_dir.mkids(parents=True, exist_ok=True)

    if not run_exec_dir.exists():
        print(f'Directory not found: {run_exec_dir}')
        return

    with open(catalog_path, 'r', encoding='utf-8') as f:
        catalog = json.load(f)

    existing_ids = {img['id'] for img in catalog['images']}
    added_count = 0

    for scene_dir in sorted(run_exec_dir.iterdir()):
        if scene_dir.is_dir():
            scene_id = scene_dir.name
            img_file = scene_dir / 'firefly_start_frame.png'
            prompt_file = scene_dir / 'prompt.txt'

            if img_file.exists():
                unique_id = f'{episode_id}_{scene_id}'
                
                # Copy to episode archive
                dest_file = dest_archive_dir / f'{scene_id}.png'
                shutil.copy2(img_file, dest_file)

                # Copy to topic bank
                dest_topic_file = dest_topic_dir / {unique_id}.png'
                shutil.copy2(img_file, dest_topic_file)

                prompt_text = ''
                if prompt_file.exists():
                    prompt_text = prompt_file.read_text(encoding='utf-8').strip()

                if unique_id not in existing_ids:
                    entry = {
                        'id': unique_id,
                        'episode': episode_id,
                        'sceneId': scene_id,
                        'topic': topic_name,
                        'relPath': f'episodes_archive/{episode_id}/{scene_id}.png',
                        'topicPath': f'by_topic/{topic_name}/{unique_id}.png',
                        'prompt': prompt_text,
                        'resolution': '1920x1080',
                        'aspectRatio': '16:9',
                        'style': 'Denis Villeneuve 35mm Anamorphic Chiaroscuro'
                    }
                    catalog['images'].append(entry)
                    existing_ids.add(unique_id)
                    added_count += 1

    catalog['totalImages'] = len(catalog['images'])
    with open(catalog_path, 'w', encoding='utf-8') as f:
        json.dump(catalog, f, indent=2, ensure_ascii=False)

    print(f'Successfully archived {added_count} images from {episode_id} into Central Image Repository (Total in Hub: {catalog\"totalImages\"]})')

if __name__ == '__main__':
    ep = sys.argv[1] if len(sys.argv) > 1 else 'OOL-EP05-RADAR-ASFALTO;
    topic = sys.argv[2] if len(sys.argv) > 2 else 'radares_transito'
    archive_episode(ep, topic)
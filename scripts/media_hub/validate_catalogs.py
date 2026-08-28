import os
import json
from pathlib import Path

def validate():
    root = Path.cwd()
    video_cat_path = root / 'assets' / 'video_repository' / 'catalog.json'
    image_cat_path = root / 'assets' / 'image_repository' / 'catalog.json'
    
    print('=== VALIDATING MEDIA REPOSITORIES '===')
    with open(video_cat_path, 'r', encoding='utf-8') as f:
        vcat = json.load(f)
    print(f'[OK] Video Repository Catalog: {len(vcat.get("videos", []))} entries registered across {len(vcat.get("categories", []))} categories.')

    with open(image_cat_path, 'r', encoding='utf-8') as f:
        icat = json.load(f)
    print(f'[OK] Image Repository Catalog: {icat.get("totalImages", 0)} images registered across {len(icat.get("topics", []))} topics.')

if __name__ == '__main__':
    validate()
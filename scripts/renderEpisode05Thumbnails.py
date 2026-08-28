import os
import json
import subprocess
import shutil

os.makedirs('runs/OOL-EP05-RADAR-ASFALTO/publishing', exist_ok=True)
brain_dir = r'C:\Users\brend\.gemini\antigravity\brain\458559fc-b6a0-43b0-900e-40923ec3998e'

variants = [
    {
        'name': 'variant_a_mechanism',
        'props': {
            'baseImageSrc': 'editorial/execution/OOL_009/firefly_start_frame.png',
            'headlineLines': ['O SEGREDO', 'DENTRO DO', 'ASFALTO.'],
            'subheadline': 'A FÍSICA INVISÍVEL QUE CALCULA SUA VELOCIDADE NO ESCURO.',
            'coordinates': '23.5505° S, 46.6333° W',
            'textSide': 'LEFT',
            'accentColor': '#FF5500',
            'telemetryColor': '#00F0FF',
            'revealPercentage': 94
        }
    },
    {
        'name': 'variant_b_consequence',
        'props': {
            'baseImageSrc': 'editorial/execution/OOL_001/firefly_start_frame.png',
            'headlineLines': ['NÃO É A', 'CÂMERA', 'NO POSTE.'],
            'subheadline': 'O SENSOR SUBTERRÂNEO DE 3 METROS QUE ACIONA O FLASH.',
            'coordinates': '23.5505° S, 46.6333° W',
            'textSide': 'LEFT',
            'accentColor': '#FF5500',
            'telemetryColor': '#00F0FF',
            'revealPercentage': 88
        }
    },
    {
        'name': 'variant_c_official',
        'props': {
            'baseImageSrc': 'editorial/execution/OOL_038/firefly_start_frame.png',
            'headlineLines': ['ARMADILHA', 'MAGNÉTICA', '3 METROS'],
            'subheadline': 'COMO O LAÇO INDUTIVO MEDE SEU CARRO EM MICROSSEGUNDOS.',
            'coordinates': 'INMETRO // PORTARIA 158/2022',
            'textSide': 'LEFT',
            'accentColor': '#FF5500',
            'telemetryColor': '#00F0FF',
            'revealPercentage': 96
        }
    }
]

for v in variants:
    vname = v['name']
    out_run = f'runs/OOL-EP05-RADAR-ASFALTO/publishing/thumbnail_{vname}.png'
    out_brain = os.path.join(brain_dir, f'ep05_thumbnail_{vname}.png')
    props_json = json.dumps(v['props'])
    
    cmd = [
        'npx', 'remotion', 'still',
        'remotion/index.ts',
        'HslThumbnail',
        out_run,
        '--props=' + props_json,
        '--image-format=png',
        '--gl=angle'
    ]
    print(f'Rendering 4K Thumbnail: {vname}...')
    res = subprocess.run(cmd, capture_output=True, text=True, shell=True)
    if res.returncode == 0:
        shutil.copy2(out_run, out_brain)
        print(f'SUCCESS: {vname} rendered ({os.path.getsize(out_run)/(1024*1024):.2f} MB)!')
    else:
        print(f'ERROR on {vname}:', res.stderr)


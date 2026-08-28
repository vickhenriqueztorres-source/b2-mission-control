import os
import json

run_dir = 'runs/OOL-EP04-GPS-TEMPO'
scenes_dir = os.path.join(run_dir, 'editorial', 'execution', 'scenes')
timings_file = os.path.join(run_dir, 'postproduction', 'scene_timings.json')

with open(timings_file, 'r', encoding='utf-8') as f:
    timings = json.load(f)

# Dicionário de prompts especiais para os 7 Keyframe Dossier Takes com tipografia integrada
dossier_prompts = {
    'OOL_004': {
        'text': 'PIX // SISTEMA INTERROMPIDO',
        'prompt': (
            'Extreme cinematic 35mm anamorphic still from a Denis Villeneuve film, Massive industrial banking server '
            'room under critical red emergency lighting, monumental scale, atmospheric chiaroscuro lighting, deep carbon '
            'blacks (#060709). Featuring a glowing industrial central monitor screen clearly showing the bold warning '
            'text "PIX // SISTEMA INTERROMPIDO" illuminated in glowing sodium-vapor amber (#FF5500) and sharp laser cyan '
            '(#00F0FF) telemetry coordinates. Dense volumetric fog, wet metallic floor, shallow depth of field, creamy '
            'anamorphic bokeh, filmic texture, raw realistic industrial photography, 8k, no human faces --ar 16:9'
        )
    },
    'OOL_006': {
        'text': '1 NANOSSEGUNDO',
        'prompt': (
            'Extreme cinematic 35mm anamorphic still from a Denis Villeneuve film, Industrial atomic laboratory oscilloscope '
            'and frequency analyzer, monumental scale, atmospheric chiaroscuro lighting, deep carbon blacks (#060709). '
            'Featuring an ultra-precise digital clock display clearly showing the bold text "1 NANOSSEGUNDO" illuminated in '
            'glowing sodium-vapor amber (#FF5500) and sharp laser cyan (#00F0FF) telemetry pulses. Dense volumetric steam, '
            'wet metallic reflection, shallow depth of field, creamy anamorphic bokeh, filmic texture, raw realistic '
            'industrial photography, 8k, no human faces --ar 16:9'
        )
    },
    'OOL_011': {
        'text': '9.192.631.770 HZ',
        'prompt': (
            'Extreme cinematic 35mm anamorphic still from a Denis Villeneuve film, Quantum physics atomic resonator chamber '
            'revealing Cesium-133 microwave cavity, monumental scale, atmospheric chiaroscuro lighting, deep carbon '
            'blacks (#060709). Featuring an integrated laser telemetry HUD display clearly showing the exact scientific '
            'text "9.192.631.770 HZ" illuminated in glowing sodium-vapor amber (#FF5500) and sharp cyan laser (#00F0FF) '
            'frequency waves. Dense volumetric fog, wet dark steel, shallow depth of field, creamy anamorphic bokeh, '
            'filmic texture, raw realistic industrial photography, 8k, no human faces --ar 16:9'
        )
    },
    'OOL_014': {
        'text': 'D = C × ΔT',
        'prompt': (
            'Extreme cinematic 35mm anamorphic still from a Denis Villeneuve film, Orbital space navigation control '
            'workstation with 4 satellite spheres hologram, monumental scale, atmospheric chiaroscuro lighting, deep '
            'carbon blacks (#060709). Featuring a glowing glass holographic HUD clearly showing the mathematical formula '
            '"D = C × ΔT" illuminated in glowing sodium-vapor amber (#FF5500) and sharp laser cyan (#00F0FF) coordinate '
            'grids. Dense volumetric atmosphere, shallow depth of field, creamy anamorphic bokeh, filmic texture, raw '
            'realistic industrial photography, 8k, no human faces --ar 16:9'
        )
    },
    'OOL_022': {
        'text': 'IEEE 1588 // PTP',
        'prompt': (
            'Extreme cinematic 35mm anamorphic still from a Denis Villeneuve film, High frequency trading industrial '
            'PCIe fiber optic switch chassis, monumental scale, atmospheric chiaroscuro lighting, deep carbon blacks '
            '(#060709). Featuring a precision LED matrix label on the steel faceplate clearly showing the bold text '
            '"IEEE 1588 // PTP" illuminated in glowing sodium-vapor amber (#FF5500) and sharp laser cyan (#00F0FF) sync '
            'indicators. Dense volumetric fog, wet metallic reflection, shallow depth of field, creamy anamorphic bokeh, '
            'filmic texture, raw realistic industrial photography, 8k, no human faces --ar 16:9'
        )
    },
    'OOL_029': {
        'text': '+38.7 µs / DIA',
        'prompt': (
            'Extreme cinematic 35mm anamorphic still from a Denis Villeneuve film, Master satellite telemetry control '
            'dashboard comparing orbital clocks vs Earth time, monumental scale, atmospheric chiaroscuro lighting, '
            'deep carbon blacks (#060709). Featuring a large digital readout display clearly showing the net relativistic '
            'drift text "+38.7 µs / DIA" illuminated in glowing sodium-vapor amber (#FF5500) and sharp laser cyan '
            '(#00F0FF) drift graphs. Dense volumetric fog, shallow depth of field, creamy anamorphic bokeh, filmic '
            'texture, raw realistic industrial photography, 8k, no human faces --ar 16:9'
        )
    },
    'OOL_050': {
        'text': 'INVESTIGAR. REVELAR. COMPREENDER.',
        'prompt': (
            'Extreme cinematic 35mm anamorphic still from a Denis Villeneuve film, Pure abstract carbon black background '
            '(#060709) with a razor sharp vertical sodium-vapor orange laser beam (#FF5500) cutting through an '
            'industrial Split Core circle symbol. Featuring the official bold brand signature text '
            '"INVESTIGAR. REVELAR. COMPREENDER." illuminated below in razor-sharp laser cyan (#00F0FF), with REVELAR in '
            'glowing sodium amber (#FF5500). Atmospheric chiaroscuro lighting, volumetric smoke, wet reflection, 8k, raw '
            'realistic cinematography, no human faces --ar 16:9'
        )
    }
}

txt_lines = []
jsonl_lines = []
guide_items = []
available_media = {}

for sc in timings:
    sc_id = sc.get('sceneId')
    scene_dir = os.path.join(scenes_dir, sc_id)
    os.makedirs(scene_dir, exist_ok=True)
    
    is_dossier = sc_id in dossier_prompts
    if is_dossier:
        info = dossier_prompts[sc_id]
        prompt = info['prompt']
        take_type = 'KEYFRAME_DOSSIER'
    else:
        name = sc.get('name')
        prompt = (
            f'Extreme cinematic 35mm anamorphic still from a Denis Villeneuve film, {name}, monumental scale, '
            f'atmospheric chiaroscuro lighting, deep carbon blacks (#060709), illuminated by glowing sodium-vapor '
            f'amber reflections (#FF5500) and sharp cyan laser telemetry lights (#00F0FF), dense volumetric fog and steam, '
            f'wet reflective ground, shallow depth of field, creamy anamorphic bokeh, filmic texture, raw realistic '
            f'industrial photography, 8k, no text, no human faces --ar 16:9'
        )
        take_type = 'CINEMATIC_TAKE'
    
    # Grava o prompt no arquivo limpo da cena
    with open(os.path.join(scene_dir, 'clean_start_frame_prompt.txt'), 'w', encoding='utf-8') as pf:
        pf.write(prompt)
        
    # Grava o scene_plan.json da cena
    plan_data = {
        'sceneId': sc_id,
        'name': sc.get('name'),
        'takeType': take_type,
        'durationFrames': sc.get('durationFrames', 150),
        'durationSeconds': sc.get('durationSeconds', 5.0),
        'isDossier': is_dossier,
        'prompt': prompt
    }
    with open(os.path.join(scene_dir, 'scene_plan.json'), 'w', encoding='utf-8') as plf:
        json.dump(plan_data, plf, indent=2, ensure_ascii=False)
        
    txt_lines.append(f'[{sc_id}] {prompt}')
    jsonl_lines.append(json.dumps({'id': sc_id, 'prompt': prompt, 'filename': f'{sc_id}.png', 'takeType': take_type}, ensure_ascii=False))
    
    guide_items.append({
        'name': f'SC_{int(sc_id.split("_")[1]):03d}',
        'sceneId': sc_id,
        'takeType': take_type,
        'prompt': prompt,
        'duration_seconds': sc.get('durationSeconds', 5.0)
    })
    
    available_media[sc_id] = {
        'hasVideo': not is_dossier,
        'hasImage': True,
        'isDossier': is_dossier
    }

# Grava filas do ChatGPT Bot
os.makedirs('chatgpt-image-bot/prompts', exist_ok=True)
with open('chatgpt-image-bot/prompts/queue.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(txt_lines) + '\n')

with open('chatgpt-image-bot/queue.jsonl', 'w', encoding='utf-8') as f:
    f.write('\n'.join(jsonl_lines) + '\n')

# Grava guide do Firefly
with open(os.path.join(run_dir, 'firefly-production-guide.json'), 'w', encoding='utf-8') as f:
    json.dump({'items': guide_items}, f, indent=2, ensure_ascii=False)

# Grava availableMedia.json no Remotion
with open('remotion/availableMedia.json', 'w', encoding='utf-8') as f:
    json.dump(available_media, f, indent=2, ensure_ascii=False)

print(f'Done! 50 scenes configured ({len(dossier_prompts)} Keyframe Dossier takes, {50 - len(dossier_prompts)} Firefly video takes).')

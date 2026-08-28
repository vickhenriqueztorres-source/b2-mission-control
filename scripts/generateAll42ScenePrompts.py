import os
import sys
import json

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

script_path = os.path.abspath("runs/OOL-EP01-PIX/editorial/06-script-approved.json")
execution_dir = os.path.abspath("runs/OOL-EP01-PIX/editorial/execution")
os.makedirs(execution_dir, exist_ok=True)

with open(script_path, "r", encoding="utf-8") as f:
    script_data = json.load(f)

# Matriz rica de prompts cinematográficos 35mm Denis Villeneuve para todas as 42 cenas
prompt_templates = {
    "OOL_001": "Cinematic 35mm close-up photograph of human hands holding a smartphone in a dimly lit modern apartment, warm ambient glow on fingers, rainy window in soft bokeh behind, dark moody atmosphere (#060709), shallow depth of field, raw realistic industrial photography, 8k",
    "OOL_002": "Cinematic 35mm wide photograph of a night city skyline through foggy glass, mysterious electromagnetic atmosphere, dark blue and amber city lights in deep bokeh, chiaroscuro lighting, moody cinematic texture, 8k",
    "OOL_003": "Cinematic 35mm aerial drone photograph of São Paulo financial district at night, towering dark skyscrapers, subtle cyan and orange light trails in the avenues, deep carbon blacks (#060709), atmospheric low-hanging mist, 8k",
    "OOL_004": "Cinematic 35mm low-angle photograph of massive financial corporate towers at dusk, dark reflective glass facades, intense urban scale, heavy industrial mood, anamorphic lens flare, 8k",
    "OOL_005": "Cinematic 35mm macro photograph of high-speed fiber optic cables glowing with internal pulses of light, resting on wet industrial concrete, dark moody cybernetic environment, 8k",
    "OOL_006": "Cinematic 35mm photograph looking down into an open underground utility access shaft beneath asphalt, dark concrete tunnels with thick cable bundles, dramatic top-down spotlight, industrial grit, 8k",
    "OOL_007": "Cinematic 35mm low-angle photograph of a 5G telecommunications transmission tower on a dark urban rooftop at night, glowing status lights, fog-shrouded night sky, sharp technical detail, 8k",
    "OOL_008": "Cinematic 35mm photograph of subterranean concrete cable gallery beneath city street, endless perspective of neatly bundled high-voltage and fiber lines, water puddles reflecting industrial lights, 8k",
    "OOL_009": "Cinematic 35mm macro photograph of glowing optical connectors plugged into high-density patch panels, amber and cyan laser reflections on brushed dark steel, 8k",
    "OOL_010": "Cinematic 35mm close-up photograph of a secure hardware security module (HSM) inside a server rack, heavy tamper-proof steel chassis, blinking cryptographic status LEDs, 8k",
    "OOL_011": "Cinematic 35mm wide photograph of highway shoulder at night with buried fiber conduit markers, distant traffic light trails, dark atmospheric industrial landscape in Barueri corridor, 8k",
    "OOL_012": "Cinematic 35mm monumental wide photograph of a monolithic reinforced concrete data center bunker in Tamboré, brutalist architecture, security perimeter fencing, dramatic overcast sky, 8k",
    "OOL_013": "Cinematic 35mm photograph of massive electrical transformer substations outside a data center, heavy power infrastructure, industrial cooling towers venting subtle steam in night air, 8k",
    "OOL_014": "Cinematic 35mm photograph of a solitary male network engineer with dark uniform seen from behind walking down an endless server aisle, cold blue and carbon black server racks (#060709), 8k",
    "OOL_015": "Cinematic 35mm macro photograph of high-speed memory arrays and processor heatsinks glowing with heat in a dark server chassis, precision engineering, 8k",
    "OOL_016": "Cinematic 35mm photograph of rows of flashing server rack indicator lights pulsing in rapid rhythmic sequence, deep black server room ambiance, 8k",
    "OOL_017": "Cinematic 35mm interior photograph of central banking operations vault room, monumental dark architecture, heavy reinforced steel security gates, chiaroscuro lighting, 8k",
    "OOL_018": "Cinematic 35mm close-up photograph of high-end network routing hardware, dense fiber connections, golden optical transceivers, brushed titanium chassis, 8k",
    "OOL_019": "Cinematic 35mm wide photograph of an ultra-modern mission control center at night, curved wall of dark monitoring screens with subtle cyan maps, silhouettes of operators at work, 8k",
    "OOL_020": "Cinematic 35mm aerial night photograph of the federal monumental axis in Brasília, dark architecture, illuminated reflecting pools, high security atmosphere, 8k",
    "OOL_021": "Cinematic 35mm photograph of high-security document archive vault, heavy steel shelving, climate-controlled mist, dramatic architectural perspective, 8k",
    "OOL_022": "Cinematic 35mm photograph of a massive bank safe vault door with heavy circular titanium locking bolts, industrial security mechanism, dramatic side lighting, 8k",
    "OOL_023": "Cinematic 35mm close-up photograph of advanced neuromorphic computing hardware with glowing micro-circuits, heat pipes, raw technological power, 8k",
    "OOL_024": "Cinematic 35mm photograph of biometric verification terminal in a secure room, glowing sensor glass, dark minimalist industrial design, 8k",
    "OOL_025": "Cinematic 35mm photograph of compliance and risk investigation terminal desks in a quiet control room, dim ambient lighting, high security environment, 8k",
    "OOL_026": "Cinematic 35mm photograph of an isolated security containment server rack behind heavy glass partition, amber warning beacon light glowing softly, 8k",
    "OOL_027": "Cinematic 35mm wide photograph of server cluster status wall displaying network load telemetry in dark data center operations center, 8k",
    "OOL_028": "Cinematic 35mm macro photograph of a precision digital atomic clock frequency standard oscillator, gold-plated connectors, high-precision industrial hardware, 8k",
    "OOL_029": "Cinematic 35mm photograph of automated verification hardware confirming transaction green status indicator, clean brushed metal surface, 8k",
    "OOL_030": "Cinematic 35mm photograph of optical packet filter firewall hardware in a dark telecommunications rack, intense industrial aesthetic, 8k",
    "OOL_031": "Cinematic 35mm photograph of heavy excavator at an industrial construction site beside a road at dusk, muddy ground, exposed underground conduits, 8k",
    "OOL_032": "Cinematic 35mm wide photograph of redundant fiber optic cable conduit bridges crossing over an urban river canal at night, dark water reflections, 8k",
    "OOL_033": "Cinematic 35mm photograph of a massive row of industrial diesel backup power generators in an open courtyard, exhaust stacks, heavy machinery ready for action, 8k",
    "OOL_034": "Cinematic 35mm photograph of high-density computing cluster roaring with cooling fans, blue LED arrays, atmospheric heat distortion, 8k",
    "OOL_035": "Cinematic 35mm wide photograph of twin twin-redundant secondary data center facility at dusk, impenetrable security architecture, 8k",
    "OOL_036": "Cinematic 35mm photograph of engineering test bench with oscilloscope and fiber testing equipment connected to server hardware, 8k",
    "OOL_037": "Cinematic 35mm photograph of endless server rack corridors with synchronized pulsing LEDs, clean carbon black aesthetics, moody cinematic lighting, 8k",
    "OOL_038": "Cinematic 35mm photograph of central banking transmission gateway antenna station on top of concrete tower under starry night sky, 8k",
    "OOL_039": "Cinematic 35mm close-up photograph of a smartphone screen glowing on a nightstand in a dark room, subtle push notification glow illuminating surroundings, 8k",
    "OOL_040": "Cinematic 35mm wide aerial photograph of connected city metropolitan area at night, vast illuminated highway arteries, deep black surrounding terrain, 8k",
    "OOL_041": "Cinematic 35mm dawn photograph of São Paulo skyline, first light breaking through morning fog over skyscrapers, cinematic golden and blue hour tones, 8k",
    "OOL_042": "Cinematic 35mm abstract minimalist photograph of a solitary glowing optical cable vanishing into deep darkness, enigmatic atmosphere, monumental scale, 8k"
}

# Sufixo obrigatório de segurança negativa (para garantir imagem 100% limpa)
negative_prompt = ", NO TEXT, NO NUMBERS, NO HUD, NO GRAPHICS, NO LOGOS, NO LASER LINES, NO LABELS, NO HUMAN FACES --ar 16:9"

all_prompts = []

for scene in script_data["scenes"]:
    s_id = scene["scene_id"]
    s_dir = os.path.join(execution_dir, s_id)
    os.makedirs(s_dir, exist_ok=True)

    base_desc = prompt_templates.get(s_id, f"Cinematic 35mm photograph of industrial telecommunications and financial infrastructure, {scene['voiceover'][:60]}, chiaroscuro lighting, deep carbon blacks (#060709), 8k")
    full_prompt = base_desc + negative_prompt

    # Salva o prompt limpo para o ChatGPT Image Bot
    prompt_file = os.path.join(s_dir, "clean_start_frame_prompt.txt")
    with open(prompt_file, "w", encoding="utf-8") as f:
        f.write(full_prompt)

    # Salva o prompt de movimento físico para o Firefly Video
    motion_prompt_file = os.path.join(s_dir, "firefly_motion_prompt.txt")
    motion_prompt = "Slow cinematic dolly forward, subtle camera drift, blinking server rack LED lights, gentle atmospheric fog drifting, smooth physical motion, no camera whip, no text, no UI"
    with open(motion_prompt_file, "w", encoding="utf-8") as f:
        f.write(motion_prompt)

    all_prompts.append({
        "scene_id": s_id,
        "prompt": full_prompt,
        "motion_prompt": motion_prompt
    })

print(f"✅ Todos os 42 prompts limpos e prompts de movimento gerados em {execution_dir}!")

# Salva manifesto mestre de prompts para o bot
master_prompts_file = os.path.abspath("runs/OOL-EP01-PIX/editorial/all_42_prompts.json")
with open(master_prompts_file, "w", encoding="utf-8") as f:
    json.dump(all_prompts, f, indent=2, ensure_ascii=False)

print(f"📄 Manifesto mestre salvo em: {master_prompts_file}")

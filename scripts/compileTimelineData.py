import os
import sys
import json

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

timeline_path = "runs/OOL-EP01-PIX/postproduction/scene_timeline_sync.json"
script_path = "runs/OOL-EP01-PIX/editorial/06-script-approved.json"

with open(timeline_path, "r", encoding="utf-8") as f:
    timeline_sync = json.load(f)

with open(script_path, "r", encoding="utf-8") as f:
    script_data = json.load(f)

visual_mappings = {
  "OOL_001": { "type": "smartphone_mockup", "config": { "amount": "R$ 1,00", "stage": "confirming" } },
  "OOL_002": { "type": "firefly_take", "config": { "media": "editorial/execution/OOL_001/firefly_take.mp4", "kenBurns": "push_in" } },
  "OOL_003": { "type": "kinetic_counter", "config": { "startValue": 0, "endValue": 140000000, "suffix": " tx/dia", "label": "VOLUME DIÁRIO SPI / BACEN", "sublabel": "Transações processadas sem interrupção." } },
  "OOL_004": { "type": "kinetic_counter", "config": { "startValue": 0, "endValue": 8432, "suffix": " tx/seg", "label": "PICO DE PROCESSAMENTO", "sublabel": "Liquidação em tempo real sem filas." } },
  "OOL_005": { "type": "stopwatch", "config": { "startMs": 0, "endMs": 1400, "label": "JANELA DE LIQUIDAÇÃO ATÔMICA", "sublabel": "Do toque ao crédito na conta destino." } },
  "OOL_006": { "type": "firefly_take", "config": { "media": "editorial/execution/OOL_006/firefly_take.mp4", "kenBurns": "push_in" } },
  "OOL_007": { "type": "firefly_take", "config": { "media": "editorial/execution/OOL_007/firefly_take.mp4", "kenBurns": "pan_right" } },
  "OOL_008": { "type": "cyber_map", "config": { "origin": "SÃO PAULO / SP", "intermediate": "BARUERI / SP", "dest": "BRASÍLIA / DF", "latency": 12 } },
  "OOL_009": { "type": "iso20022_packet", "config": { "amount": "R$ 1,00", "latencyMs": 1.4 } },
  "OOL_010": { "type": "laser_wipe_schematic", "config": { "media": "editorial/execution/OOL_010/firefly_take.mp4", "title": "SPI DATA CORE - CLUSTER SP-01", "compartment": "MÓDULO DE HARDWARE HSM (AES-256)" } },
  "OOL_012": { "type": "firefly_take", "config": { "media": "editorial/execution/OOL_012/firefly_take.mp4", "kenBurns": "push_in" } },
  "OOL_014": { "type": "firefly_take", "config": { "media": "editorial/execution/OOL_014/firefly_take.mp4", "kenBurns": "pan_left" } },
  "OOL_019": { "type": "firefly_take", "config": { "media": "editorial/execution/OOL_019/firefly_take.mp4", "kenBurns": "push_in" } },
  "OOL_022": { "type": "laser_wipe_dossier", "config": { "media": "editorial/execution/OOL_022/firefly_take.mp4", "title": "BACEN — PROTOCOLO DE RETENÇÃO CAUTELAR (MED)" } },
  "OOL_027": { "type": "firefly_take", "config": { "media": "editorial/execution/OOL_027/firefly_take.mp4", "kenBurns": "push_in" } },
  "OOL_031": { "type": "firefly_take", "config": { "media": "editorial/execution/OOL_031/firefly_take.mp4", "kenBurns": "pan_right" } },
  "OOL_033": { "type": "firefly_take", "config": { "media": "editorial/execution/OOL_033/firefly_take.mp4", "kenBurns": "push_in" } },
  "OOL_037": { "type": "firefly_take", "config": { "media": "editorial/execution/OOL_037/firefly_take.mp4", "kenBurns": "pan_left" } },
  "OOL_039": { "type": "firefly_take", "config": { "media": "editorial/execution/OOL_039/firefly_take.mp4", "kenBurns": "push_in" } },
  "OOL_041": { "type": "firefly_take", "config": { "media": "editorial/execution/OOL_041/firefly_take.mp4", "kenBurns": "pull_out" } }
}

compiled_scenes = []
script_scenes_map = {s["scene_id"]: s for s in script_data.get("scenes", [])}

for idx, scene in enumerate(timeline_sync["scenes"]):
    s_id = scene["scene_id"]
    s_item = script_scenes_map.get(s_id, {})
    
    visual = visual_mappings.get(s_id)
    if not visual:
        cycle = idx % 5
        if cycle == 0:
            visual = { "type": "firefly_take", "config": { "media": "editorial/execution/OOL_003/firefly_take.mp4", "kenBurns": "push_in" } }
        elif cycle == 1:
            visual = { "type": "research_lapse", "config": { "query": "BACEN // SPI PROTOCOL // DICT_DIRECTORY", "source": "REGISTRO DE LIQUIDAÇÃO" } }
        elif cycle == 2:
            visual = { "type": "cyber_map", "config": { "origin": "SÃO PAULO", "intermediate": "BARUERI", "dest": "BRASÍLIA", "latency": 24 } }
        elif cycle == 3:
            visual = { "type": "iso20022_packet", "config": { "amount": "R$ 1,00", "latencyMs": 2.8 } }
        else:
            visual = { "type": "firefly_take", "config": { "media": "editorial/execution/OOL_014/firefly_take.mp4", "kenBurns": "pan_right" } }

    voiceover = s_item.get("voiceover", "")
    subtitle = (voiceover[:75] + "...") if len(voiceover) > 75 else voiceover

    compiled_scenes.append({
        "id": s_id,
        "from": scene["start_frame"],
        "durationInFrames": scene["duration_frames"],
        "voiceover": voiceover,
        "chapterId": s_item.get("chapter_id", "CH01"),
        "visual": visual,
        "hud": {
            "sceneNumber": f"CENA {idx + 1:02d}",
            "title": s_item.get("attention_role", "INVESTIGAÇÃO"),
            "subtitle": subtitle.upper(),
            "latencyMs": 12 + (idx * 3) % 120,
            "systemStressPercent": 20 + (idx * 7) % 75,
            "sourceText": "FONTE: BANCO CENTRAL DO BRASIL / SPI / RTM"
        }
    })

ts_output = f"""// Gerado automaticamente pelo compilador de Timeline Dinâmica
export interface CompiledSceneItem {{
  id: string;
  from: number;
  durationInFrames: number;
  voiceover: string;
  chapterId: string;
  visual: {{
    type: string;
    config?: any;
  }};
  hud: {{
    sceneNumber: string;
    title: string;
    subtitle: string;
    latencyMs: number;
    systemStressPercent: number;
    sourceText: string;
  }};
}}

export const EPISODE_01_TIMELINE_TOTAL_FRAMES = {timeline_sync["total_frames"]};

export const EPISODE_01_SCENES: CompiledSceneItem[] = {json.dumps(compiled_scenes, indent=2, ensure_ascii=False)};
"""

with open("remotion/episode01TimelineData.ts", "w", encoding="utf-8") as f:
    f.write(ts_output)

print("🎉 remotion/episode01TimelineData.ts compilado com 42 cenas dinâmicas!")

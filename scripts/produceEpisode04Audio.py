import os
import sys
import json
import asyncio
import subprocess
import shutil
import edge_tts

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

EPISODE_ID = "OOL-EP04-GPS-TEMPO"
PROD_DIR = os.path.abspath(f"runs/{EPISODE_ID}")
EDITORIAL_DIR = os.path.join(PROD_DIR, "editorial")
POSTPROD_DIR = os.path.join(PROD_DIR, "postproduction")
SCENES_AUDIO_DIR = os.path.join(POSTPROD_DIR, "scenes_audio")
PUBLIC_EP04_DIR = os.path.abspath("public/postproduction_ep04")

os.makedirs(SCENES_AUDIO_DIR, exist_ok=True)
os.makedirs(PUBLIC_EP04_DIR, exist_ok=True)

# Voz documental padrão (profunda, formal, investigativa)
VOICE_NAME = "pt-BR-AntonioNeural" # Antonio Neural (Voz investigativa e solene)
FPS = 30

async def generate_scene_audio(text: str, out_path: str):
    # Ajuste de velocidade e tom para tom documental investigativo
    communicate = edge_tts.Communicate(text, VOICE_NAME, rate="-4%", pitch="-2Hz")
    await communicate.save(out_path)

async def main():
    script_path = os.path.join(EDITORIAL_DIR, "06-script-approved.json")
    with open(script_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    scenes = data["scenes"]
    print("══════════════════════════════════════════════════════════════════")
    print(f"🎙️ GERANDO NARRAÇÃO AUDIO MASTER: {EPISODE_ID}")
    print(f"📌 Total de Cenas: {len(scenes)}")
    print(f"🎙️ Voz: {VOICE_NAME}")
    print("══════════════════════════════════════════════════════════════════\n")

    concat_list = []
    scene_sync_manifest = []
    total_frames = 0

    for idx, s in enumerate(scenes, 1):
        s_id = s["scene_id"]
        # Formata para SC_001
        sc_num = int(s_id.replace("OOL_", ""))
        sc_name = f"SC_{sc_num:03d}"
        text = s["text"]
        out_file = os.path.join(SCENES_AUDIO_DIR, f"{sc_name}.mp3")

        print(f"[{idx:02d}/{len(scenes):02d}] Sintetizando áudio para {sc_name}...")
        await generate_scene_audio(text, out_file)

        # Mede duração exata com ffprobe
        probe_cmd = f"ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 \"{out_file}\""
        duration_str = subprocess.check_output(probe_cmd, shell=True, text=True).strip()
        duration_sec = float(duration_str)
        duration_frames = int(round(duration_sec * FPS))

        scene_sync_manifest.append({
            "sceneId": sc_name,
            "originalSceneId": s_id,
            "chapterId": s.get("chapter", "CH01"),
            "name": s.get("name", f"Cena {idx}"),
            "text": text,
            "durationSeconds": duration_sec,
            "durationFrames": duration_frames,
            "startFrame": total_frames,
            "endFrame": total_frames + duration_frames
        })

        total_frames += duration_frames
        concat_list.append(f"file '{out_file.replace(chr(92), '/')}'")

    # Gera o narration.mp3 concatenado
    concat_txt_path = os.path.join(POSTPROD_DIR, "concat_list.txt")
    with open(concat_txt_path, "w", encoding="utf-8") as f:
        f.write("\n".join(concat_list))

    master_narration = os.path.join(POSTPROD_DIR, "narration.mp3")
    ffmpeg_concat_cmd = f"ffmpeg -y -f concat -safe 0 -i \"{concat_txt_path}\" -c:a libmp3lame -b:a 192k \"{master_narration}\""
    subprocess.check_call(ffmpeg_concat_cmd, shell=True)

    # Mede a duração final do arquivo master
    probe_final = f"ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 \"{master_narration}\""
    final_sec = float(subprocess.check_output(probe_final, shell=True, text=True).strip())

    # Salva o manifesto de sincronização JSON
    sync_json_path = os.path.join(POSTPROD_DIR, "scene_timeline_sync.json")
    with open(sync_json_path, "w", encoding="utf-8") as f:
        json.dump({
            "episodeId": EPISODE_ID,
            "totalScenes": len(scenes),
            "totalFrames": total_frames,
            "totalDurationSeconds": final_sec,
            "fps": FPS,
            "scenes": scene_sync_manifest
        }, f, indent=2, ensure_ascii=False)

    # Exporta para TypeScript para consumo pelo Remotion (remotion/episode04TimelineData.ts)
    ts_content = f"""// AUTO-GERADO: Sincronização de Linha do Tempo para EP04 - GPS & TEMPO
export interface Episode04SceneData {{
  sceneId: string;
  originalSceneId: string;
  chapterId: string;
  name: string;
  text: string;
  durationSeconds: number;
  durationFrames: number;
  startFrame: number;
  endFrame: number;
}}

export const EPISODE_04_TOTAL_FRAMES = {total_frames};
export const EPISODE_04_TOTAL_DURATION_SECONDS = {final_sec:.2f};
export const EPISODE_04_FPS = {FPS};

export const EPISODE_04_SCENES: Episode04SceneData[] = {json.dumps(scene_sync_manifest, indent=2, ensure_ascii=False)};
"""
    with open("remotion/episode04TimelineData.ts", "w", encoding="utf-8") as f:
        f.write(ts_content)

    # Copia para pasta pública acessível pelo Remotion
    shutil.copyfile(master_narration, os.path.join(PUBLIC_EP04_DIR, "narration.mp3"))
    shutil.copyfile(sync_json_path, os.path.join(PUBLIC_EP04_DIR, "scene_timeline_sync.json"))

    print("\n══════════════════════════════════════════════════════════════════")
    print("🎉 MASTER NARRATION GERADO COM SUCESSO!")
    print(f"⏱️ Duração Master: {final_sec:.2f}s ({final_sec/60:.2f} minutos / {total_frames} frames)")
    print(f"📁 Arquivo Master: {master_narration}")
    print(f"📊 Timeline Remotion: remotion/episode04TimelineData.ts")
    print("══════════════════════════════════════════════════════════════════\n")

if __name__ == "__main__":
    asyncio.run(main())

import asyncio
import json
import os
import sys
import argparse
import edge_tts

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

# Presets oficiais de vozes em Português para documentários
DOCUMENTARY_VOICE_PRESETS = {
    "antonio": {
        "voice_id": "pt-BR-AntonioNeural",
        "gender": "Masculino",
        "description": "Voz oficial do canal O Outro Lado. Tom sóbrio, grave, firme, investigativo.",
        "default_rate": "+0%",
        "default_pitch": "+0Hz"
    },
    "francisca": {
        "voice_id": "pt-BR-FranciscaNeural",
        "gender": "Feminino",
        "description": "Tom jornalístico maduro, sério e de alta credibilidade documental.",
        "default_rate": "+0%",
        "default_pitch": "+0Hz"
    },
    "thalita": {
        "voice_id": "pt-BR-ThalitaNeural",
        "gender": "Feminino",
        "description": "Tom profundo e investigativo, ideal para mistérios, finanças e tecnologia.",
        "default_rate": "+0%",
        "default_pitch": "+0Hz"
    },
    "valerio": {
        "voice_id": "pt-BR-ValerioNeural",
        "gender": "Masculino",
        "description": "Narrador clássico de história e documentários em estilo History/Discovery.",
        "default_rate": "+0%",
        "default_pitch": "-2Hz"
    },
    "nicolau": {
        "voice_id": "pt-BR-NicolauNeural",
        "gender": "Masculino",
        "description": "Voz profunda com peso cinematográfico.",
        "default_rate": "-2%",
        "default_pitch": "-3Hz"
    },
    "fabio": {
        "voice_id": "pt-BR-FabioNeural",
        "gender": "Masculino",
        "description": "Tom técnico, científico e preciso para engenharia.",
        "default_rate": "+0%",
        "default_pitch": "+0Hz"
    },
    "giovanna": {
        "voice_id": "pt-BR-GiovannaNeural",
        "gender": "Feminino",
        "description": "Voz moderna, clara e com ótima articulação para documentários explicativos.",
        "default_rate": "+0%",
        "default_pitch": "+0Hz"
    },
    "humberto": {
        "voice_id": "pt-BR-HumbertoNeural",
        "gender": "Masculino",
        "description": "Voz encorpada de rádio e jornalismo investigativo.",
        "default_rate": "+0%",
        "default_pitch": "+0Hz"
    },
    "julio": {
        "voice_id": "pt-BR-JulioNeural",
        "gender": "Masculino",
        "description": "Tom narrativo contemporâneo para histórias de negócios e tecnologia.",
        "default_rate": "+0%",
        "default_pitch": "+0Hz"
    },
    "leticia": {
        "voice_id": "pt-BR-LeticiaNeural",
        "gender": "Feminino",
        "description": "Narradora expressiva para contar histórias imersivas.",
        "default_rate": "+0%",
        "default_pitch": "+0Hz"
    }
}

async def generate_narration(voice_key: str = "antonio", custom_rate: str = "+0%", custom_pitch: str = "+0Hz"):
    preset = DOCUMENTARY_VOICE_PRESETS.get(voice_key.lower())
    if preset:
        voice_id = preset["voice_id"]
        rate = custom_rate if custom_rate != "+0%" else preset["default_rate"]
        pitch = custom_pitch if custom_pitch != "+0Hz" else preset["default_pitch"]
    else:
        voice_id = voice_key  # Permite passar diretamente o ID (ex: pt-BR-AntonioNeural)
        rate = custom_rate
        pitch = custom_pitch

    execution_plan_path = os.path.join("runs", "OOL-EP01-PIX", "editorial", "execution", "episode.execution.json")
    if not os.path.exists(execution_plan_path):
        print(f"Erro: {execution_plan_path} não encontrado")
        sys.exit(1)

    with open(execution_plan_path, "r", encoding="utf-8") as f:
        plan = json.load(f)

    execution_dir = os.path.join("runs", "OOL-EP01-PIX", "editorial", "execution")
    postprod_dir = os.path.join("runs", "OOL-EP01-PIX", "postproduction")
    audio_scenes_dir = os.path.join(postprod_dir, "scenes_audio")
    os.makedirs(audio_scenes_dir, exist_ok=True)

    full_script_parts = []
    scene_manifests = []

    print("══════════════════════════════════════════════════════════════════")
    print(f"🎙️ VOICEBOX DOCUMENTÁRIO — CANAL O OUTRO LADO")
    print(f"📌 Voz Selecionada: {voice_id} (Rate: {rate} | Pitch: {pitch})")
    print(f"🎬 Total de Cenas: {len(plan['scenes'])}")
    print("══════════════════════════════════════════════════════════════════\n")

    for relative_scene_path in plan["scenes"]:
        full_scene_path = os.path.join(execution_dir, relative_scene_path)
        with open(full_scene_path, "r", encoding="utf-8") as sf:
            scene_data = json.load(sf)

        scene_id = scene_data["scene_id"]
        voiceover = scene_data.get("voiceover", "").strip()
        if not voiceover:
            continue

        full_script_parts.append(voiceover)
        scene_audio_path = os.path.join(audio_scenes_dir, f"{scene_id}.mp3")

        # Gera o áudio individual da cena
        communicate = edge_tts.Communicate(voiceover, voice_id, rate=rate, pitch=pitch)
        await communicate.save(scene_audio_path)

        scene_manifests.append({
            "scene_id": scene_id,
            "voiceover": voiceover,
            "audio_file": scene_audio_path,
            "byte_size": os.path.getsize(scene_audio_path)
        })
        print(f"  ✅ [{scene_id}] Áudio gerado ({len(voiceover.split())} palavras)")

    # Gera a narração mestre contínua
    master_script = "\n\n".join(full_script_parts)
    master_audio_path = os.path.join(postprod_dir, "narration.mp3")
    master_communicate = edge_tts.Communicate(master_script, voice_id, rate=rate, pitch=pitch)
    await master_communicate.save(master_audio_path)

    # Copia para a pasta public do Remotion
    pub_postprod_dir = os.path.join("public", "postproduction")
    os.makedirs(pub_postprod_dir, exist_ok=True)
    pub_master_path = os.path.join(pub_postprod_dir, "narration.mp3")
    with open(master_audio_path, "rb") as sf, open(pub_master_path, "wb") as df:
        df.write(sf.read())

    manifest = {
        "status": "NARRATION_GENERATED",
        "voice": voice_id,
        "rate": rate,
        "pitch": pitch,
        "cadence_wpm": 146.1,
        "total_scenes": len(scene_manifests),
        "total_words": len(master_script.split()),
        "master_audio_path": master_audio_path,
        "master_byte_size": os.path.getsize(master_audio_path),
        "scenes": scene_manifests
    }

    manifest_path = os.path.join(postprod_dir, "narration-manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as mf:
        json.dump(manifest, mf, indent=2, ensure_ascii=False)

    print(f"\n🎉 NARRAÇÃO MESTRE CONCLUÍDA:")
    print(f"📁 Master Audio: {master_audio_path} ({len(master_script.split())} palavras)")
    print(f"📄 Manifesto: {manifest_path}\n")

def list_presets():
    print("\n══════════════════════════════════════════════════════════════════")
    print("🎙️ PRESETS DE VOZES EM PORTUGUÊS (VOICEBOX DOCUMENTÁRIO)")
    print("══════════════════════════════════════════════════════════════════")
    for key, p in DOCUMENTARY_VOICE_PRESETS.items():
        print(f"🔑 Chave: {key:<12} | ID: {p['voice_id']:<24} | {p['gender']:<9} | {p['description']}")
    print("══════════════════════════════════════════════════════════════════\n")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Voicebox Documentário — Gerador de Narração em Português")
    parser.add_argument("--voice", type=str, default="antonio", help="Chave do preset (ex: antonio, francisca, thalita, valerio) ou Voice ID completo")
    parser.add_argument("--rate", type=str, default="+0%", help="Ajuste de velocidade (ex: -5%, +0%, +5%)")
    parser.add_argument("--pitch", type=str, default="+0Hz", help="Ajuste de tom (ex: -2Hz, +0Hz, +2Hz)")
    parser.add_argument("--list", action="store_true", help="Lista todas as vozes e presets disponíveis")

    args = parser.parse_args()

    if args.list:
        list_presets()
    else:
        asyncio.run(generate_narration(voice_key=args.voice, custom_rate=args.rate, custom_pitch=args.pitch))

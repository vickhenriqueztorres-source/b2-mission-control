import os
import sys
import json
import urllib.request
import time
import subprocess
import shutil

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

API_KEYS_POOL = [
    "sk_45c79defa2fcb2ca405843dc26b1fa7ad1bb0b691cf2fa13",
    "sk_a918e026c233a750355a9104d8b75aefac3dda68249bd447",
    "sk_4e1e236ebcbb440102e1c940f72b03613714f4451eb0b186",
    "sk_9459866952a61014ded640b61827f135c239c1cc74507ce9"
]

VOICE_ID = "iP95p4xoKVk53GoZ742B"  # Chris - ElevenLabs
BASE_URL = "https://api.elevenlabs.io/v1"

EPISODE_ID = "OOL-EP02-CABOS"
PROD_DIR = os.path.abspath(f"runs/{EPISODE_ID}")
EDITORIAL_DIR = os.path.join(PROD_DIR, "editorial")
POSTPROD_DIR = os.path.join(PROD_DIR, "postproduction")
SCENES_AUDIO_DIR = os.path.join(POSTPROD_DIR, "scenes_audio")
PUBLIC_EP02_DIR = os.path.abspath("public/postproduction_ep02")

os.makedirs(EDITORIAL_DIR, exist_ok=True)
os.makedirs(SCENES_AUDIO_DIR, exist_ok=True)
os.makedirs(PUBLIC_EP02_DIR, exist_ok=True)

# 42 CENAS EM 6 CAPÍTULOS
EPISODE_SCENES = [
    # --- CAPÍTULO 1: O MITO DO SATÉLITE & O CLIQUE INVISÍVEL ---
    {"scene_id": "OOL_001", "chapter": "CH01", "name": "O Mito do Espaço", "type": "firefly_take", "text": "Quando você dá play em um vídeo em quatro k no celular, a maioria das pessoas imagina que esse sinal viaja até um satélite no espaço."},
    {"scene_id": "OOL_002", "chapter": "CH01", "name": "A Realidade Física", "type": "cinematic_parallax", "text": "Mas a realidade física é completamente diferente. Menos de um por cento de todo o tráfego da internet mundial usa satélites."},
    {"scene_id": "OOL_003", "chapter": "CH01", "name": "A Viagem Subaquática", "type": "firefly_take", "text": "Quase cem por cento dos dados que você consome agora estão viajando por baixo d'água, no leito escuro do Oceano Atlântico."},
    {"scene_id": "OOL_004", "chapter": "CH01", "name": "A Velocidade da Luz", "type": "kinetic_counter", "text": "Pulsos de laser infravermelho cruzando milhares de quilômetros a duzentos mil quilômetros por segundo dentro de tubos de vidro puro."},
    {"scene_id": "OOL_005", "chapter": "CH01", "name": "O Ponto de Partida", "type": "firefly_take", "text": "Tudo começa no momento exato em que seu dedo toca a tela e uma requisição de dados é disparada."},
    {"scene_id": "OOL_006", "chapter": "CH01", "name": "A Rota dos Servidores", "type": "cyber_map", "text": "O sinal sai do seu provedor, atravessa a rede nacional e ruma para a borda do continente."},
    {"scene_id": "OOL_007", "chapter": "CH01", "name": "O Ponto de Mergulho", "type": "firefly_take", "text": "Onde uma estrutura monumental, porém invisível, aguarda na areia para mergulhar no abismo."},

    # --- CAPÍTULO 2: A ANATOMIA DO CABO DE 25MM (RAIO-X 3D) ---
    {"scene_id": "OOL_008", "chapter": "CH02", "name": "A Espessura Inacreditável", "type": "submarine_cable_3d", "text": "Esta é a peça central de toda a internet moderna: um cabo com apenas vinte e cinco milímetros de diâmetro."},
    {"scene_id": "OOL_009", "chapter": "CH02", "name": "A Escala Real", "type": "firefly_take", "text": "Ele tem a mesma espessura de uma mangueira de jardim comum, mas carrega o tráfego de duzentos milhões de brasileiros."},
    {"scene_id": "OOL_010", "chapter": "CH02", "name": "As 7 Camadas Blindadas", "type": "submarine_cable_3d", "text": "Para sobreviver no fundo do mar, ele é construído em sete camadas milimetricamente projetadas."},
    {"scene_id": "OOL_011", "chapter": "CH02", "name": "O Polietileno e o Aço", "type": "laser_dossier", "text": "Uma capa de polietileno externa protege contra a água salgada, envolta por fios de aço helicoidais de altíssima tração."},
    {"scene_id": "OOL_012", "chapter": "CH02", "name": "O Tubo de Cobre e Energia", "type": "submarine_cable_3d", "text": "Por dentro, um tubo de cobre maciço conduz dez mil volts de corrente contínua para alimentar a rede."},
    {"scene_id": "OOL_013", "chapter": "CH02", "name": "A Vaselina Hidrofóbica", "type": "firefly_take", "text": "Uma barreira de vaselina sintética impede que a água penetre caso a blindagem externa seja rompida."},
    {"scene_id": "OOL_014", "chapter": "CH02", "name": "O Núcleo de Fibras de Sílica", "type": "submarine_cable_3d", "text": "E no centro exato, doze pares de fibras ópticas de sílica ultra-pura, cada uma mais fina que um fio de cabelo humano."},

    # --- CAPÍTULO 3: O ABISMO ATLÂNTICO & REPETIDORES DE ÉRBIO ---
    {"scene_id": "OOL_015", "chapter": "CH03", "name": "A Descida a 4.000 Metros", "type": "atlantic_bathymetry_map", "text": "O cabo desce a profundidades de até quatro mil metros no leito do Oceano Atlântico."},
    {"scene_id": "OOL_016", "chapter": "CH03", "name": "A Pressão Esmagadora", "type": "firefly_take", "text": "A essa profundidade, a pressão passa de quatrocentas atmosferas, quatrocentos quilos por centímetro quadrado."},
    {"scene_id": "OOL_017", "chapter": "CH03", "name": "A Escuridão e a Física", "type": "cinematic_parallax", "text": "Na escuridão gelada, um problema da física quântica ameaça a transmissão: a luz laser perde força a cada quilômetro."},
    {"scene_id": "OOL_018", "chapter": "CH03", "name": "O Repetidor Óptico", "type": "erbium_amplifier", "text": "É aqui que entram os repetidores submarinos, cilindros de titânio instalados a cada oitenta quilômetros."},
    {"scene_id": "OOL_019", "chapter": "CH03", "name": "A Fibra Dopada com Érbio", "type": "erbium_amplifier", "text": "Eles usam fibras dopadas com o elemento químico Érbio para amplificar os fótons diretamente."},
    {"scene_id": "OOL_020", "chapter": "CH03", "name": "Sem Conversão Eletrônica", "type": "laser_dossier", "text": "A luz é amplificada sem nunca ser convertida em eletricidade, mantendo duzentos terabits por segundo fluindo sem interrupção."},
    {"scene_id": "OOL_021", "chapter": "CH03", "name": "A Linha de Alta Voltagem", "type": "firefly_take", "text": "Os dez mil volts enviados da praia mantêm esses amplificadores ligados vinte e quatro horas por dia no fundo do oceano."},

    # --- CAPÍTULO 4: AS ESTAÇÕES DE ATERRISAGEM (PRAIA GRANDE / FORTALEZA) ---
    {"scene_id": "OOL_022", "chapter": "CH04", "name": "Os Pontos Neurais do Brasil", "type": "atlantic_bathymetry_map", "text": "No Brasil, existem duas grandes portas de entrada internacionais: Praia Grande em São Paulo e Fortaleza no Ceará."},
    {"scene_id": "OOL_023", "chapter": "CH04", "name": "A Praia do Futuro", "type": "firefly_take", "text": "Na Praia do Futuro em Fortaleza, chegam nada menos que dezesseis cabos submarinos internacionais."},
    {"scene_id": "OOL_024", "chapter": "CH04", "name": "A Chegada na Areia", "type": "cinematic_parallax", "text": "O cabo sai do mar, passa por baixo da areia através de galerias de concreto armado e entra na estação de aterrisagem."},
    {"scene_id": "OOL_025", "chapter": "CH04", "name": "Os Búnkers CLS", "type": "firefly_take", "text": "As Cable Landing Stations são búnkers blindados com geradores a diesel e sistemas redundantes de energia."},
    {"scene_id": "OOL_026", "chapter": "CH04", "name": "A Separação dos Sinais", "type": "laser_dossier", "text": "Aqui, os feixes de luz são desacoplados por multiplexadores ópticos e distribuídos pelo território nacional."},
    {"scene_id": "OOL_027", "chapter": "CH04", "name": "A Conexão com o IX.br", "type": "cyber_map", "text": "As fibras se conectam diretamente ao ponto de troca de tráfego de São Paulo, o maior do hemisfério sul."},
    {"scene_id": "OOL_028", "chapter": "CH04", "name": "A Pulsação Contínua", "type": "firefly_take", "text": "Mais de trinta terabits por segundo chegam e saem do país a cada instante através dessas estações."},

    # --- CAPÍTULO 5: AMEAÇA CRÍTICA, ÂNCORAS & BGP EM 15MS ---
    {"scene_id": "OOL_029", "chapter": "CH05", "name": "Os Inimigos Submarinos", "type": "firefly_take", "text": "Apesar de toda a blindagem, o sistema enfrenta perigos constantes no fundo do mar."},
    {"scene_id": "OOL_030", "chapter": "CH05", "name": "O Impacto das Âncoras", "type": "cinematic_parallax", "text": "A maior ameaça são âncoras de navios cargueiros de cinquenta toneladas arrastadas acidentalmente pelo fundo."},
    {"scene_id": "OOL_031", "chapter": "CH05", "name": "O Momento da Ruptura", "type": "bgp_failover_inspector", "text": "Quando um cabo submarino é rompido, milhares de fibras de vidro se partem instantaneamente."},
    {"scene_id": "OOL_032", "chapter": "CH05", "name": "A Resposta do Protocolo BGP", "type": "bgp_failover_inspector", "text": "Mas a internet brasileira não cai. Em menos de quinze milissegundos, o protocolo BGP detecta a perda do feixe de luz."},
    {"scene_id": "OOL_033", "chapter": "CH05", "name": "O Desvio Automático", "type": "cyber_map", "text": "O tráfego é instantaneamente redirecionado para cabos paralelos como o Monet, EllaLink ou Seabras-1."},
    {"scene_id": "OOL_034", "chapter": "CH05", "name": "Os Navios de Reparo", "type": "firefly_take", "text": "Para consertar a falha, navios especializados com robôs submarinos operados remotamente são despachados ao local."},
    {"scene_id": "OOL_035", "chapter": "CH05", "name": "A Fusão das Fibras no Mar", "type": "laser_dossier", "text": "O cabo quebrado é içado à superfície e emendado fio a fio com microscópios de alta precisão em alto-mar."},

    # --- CAPÍTULO 6: CONCLUSÃO: A CIVILIZAÇÃO NOS 25MM ---
    {"scene_id": "OOL_036", "chapter": "CH06", "name": "A Fragilidade e a Força", "type": "submarine_cable_3d", "text": "É fascinante e assustador perceber a fragilidade da infraestrutura que sustenta o mundo digital."},
    {"scene_id": "OOL_037", "chapter": "CH06", "name": "A Dependência Invisível", "type": "firefly_take", "text": "Bancos, hospitais, empresas, transações e a nossa comunicação cotidiana dependem desse fino tubo de vidro no fundo do oceano."},
    {"scene_id": "OOL_038", "chapter": "CH06", "name": "Sem Fios Invisíveis", "type": "cinematic_parallax", "text": "Não existe nuvem sem cabo. Não existe internet sem essa teia de aço e vidro deitada no abismo."},
    {"scene_id": "OOL_039", "chapter": "CH06", "name": "A Engenharia Oculta", "type": "firefly_take", "text": "Uma das maiores obras de engenharia da história da humanidade, funcionando em silêncio absoluto sob quatro mil metros de água."},
    {"scene_id": "OOL_040", "chapter": "CH06", "name": "O Próximo Clique", "type": "kinetic_counter", "text": "Da próxima vez que você assistir a um vídeo ou enviar uma mensagem, lembre-se do caminho que esses fótons percorreram."},
    {"scene_id": "OOL_041", "chapter": "CH06", "name": "O Outro Lado Revelado", "type": "firefly_take", "text": "Porque a verdadeira tecnologia não está apenas na tela que você segura nas mãos."},
    {"scene_id": "OOL_042", "chapter": "CH06", "name": "A Assinatura do Canal", "type": "firefly_take", "text": "Ela está no outro lado. Onde a máquina invisível nunca para de operar."}
]

# SALVA O SCRIPT OFICIAL DO EPISÓDIO
with open(os.path.join(EDITORIAL_DIR, "06-script-approved.json"), "w", encoding="utf-8") as f:
    json.dump({"episode_id": EPISODE_ID, "scenes": EPISODE_SCENES}, f, indent=2, ensure_ascii=False)

print("══════════════════════════════════════════════════════════════════")
print("🎙️ GERADOR ELEVENLABS — EPISÓDIO 02: CABOS SUBMARINOS")
print(f"📌 Total de Cenas: {len(EPISODE_SCENES)}")
print(f"🔑 Chaves Disponíveis no Pool: {len(API_KEYS_POOL)}")
print(f"🎙️ Voice: Chris ({VOICE_ID})")
print("══════════════════════════════════════════════════════════════════\n")

current_key_idx = 0
concat_list = []
scene_sync_manifest = []
total_frames = 0
FPS = 30

for idx, s in enumerate(EPISODE_SCENES, 1):
    s_id = s["scene_id"]
    text = s["text"]
    out_file = os.path.join(SCENES_AUDIO_DIR, f"{s_id}.mp3")

    print(f"[{idx:02d}/42] Gerando áudio para {s_id}...")
    print(f"   📝 Texto: \"{text}\"")

    success = False
    for attempt in range(len(API_KEYS_POOL)):
        key = API_KEYS_POOL[current_key_idx]
        url = f"{BASE_URL}/text-to-speech/{VOICE_ID}"
        headers = {
            "xi-api-key": key,
            "Content-Type": "application/json",
            "Accept": "audio/mpeg"
        }
        payload = {
            "text": text,
            "model_id": "eleven_multilingual_v2",
            "voice_settings": {
                "stability": 0.50,
                "similarity_boost": 0.75,
                "style": 0.0,
                "use_speaker_boost": True
            }
        }
        req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), headers=headers, method="POST")

        try:
            with urllib.request.urlopen(req) as response:
                if response.status == 200:
                    with open(out_file, "wb") as out_f:
                        out_f.write(response.read())
                    print(f"   ✅ Áudio salvo com sucesso (Chave #{current_key_idx + 1})")
                    success = True
                    break
        except Exception as e:
            print(f"   ⚠️ Falha com Chave #{current_key_idx + 1}: {e}")
            current_key_idx = (current_key_idx + 1) % len(API_KEYS_POOL)
            print(f"   🔄 Rotacionando para Chave #{current_key_idx + 1}...")
            time.sleep(1)

    if not success:
        print(f"   ❌ Erro crítico ao gerar cena {s_id}. Interrompendo.")
        sys.exit(1)

    # Mede duração com ffprobe
    probe_cmd = f"ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 \"{out_file}\""
    duration_str = subprocess.check_output(probe_cmd, shell=True, text=True).strip()
    duration_sec = float(duration_str)
    duration_frames = int(round(duration_sec * FPS))

    scene_sync_manifest.append({
        "scene_id": s_id,
        "chapter_id": s["chapter"],
        "name": s["name"],
        "type": s["type"],
        "text": text,
        "duration_seconds": duration_sec,
        "duration_frames": duration_frames,
        "start_frame": total_frames,
        "end_frame": total_frames + duration_frames
    })

    total_frames += duration_frames
    concat_list.append(f"file '{out_file.replace(chr(92), '/')}'")
    time.sleep(0.3)

# Cria arquivo concat_list.txt e gera o master narration.mp3
concat_txt_path = os.path.join(POSTPROD_DIR, "concat_list.txt")
with open(concat_txt_path, "w", encoding="utf-8") as f:
    f.write("\n".join(concat_list))

master_narration = os.path.join(POSTPROD_DIR, "narration.mp3")
ffmpeg_concat_cmd = f"ffmpeg -y -f concat -safe 0 -i \"{concat_txt_path}\" -c copy \"{master_narration}\""
subprocess.check_call(ffmpeg_concat_cmd, shell=True)

# Salva o manifesto de sincronização da timeline
sync_json_path = os.path.join(POSTPROD_DIR, "scene_timeline_sync.json")
with open(sync_json_path, "w", encoding="utf-8") as f:
    json.dump({
        "episode_id": EPISODE_ID,
        "total_scenes": len(EPISODE_SCENES),
        "total_frames": total_frames,
        "total_duration_seconds": total_frames / FPS,
        "fps": FPS,
        "scenes": scene_sync_manifest
    }, f, indent=2, ensure_ascii=False)

# Copia para public/postproduction_ep02 para acesso no Remotion
shutil.copyfile(master_narration, os.path.join(PUBLIC_EP02_DIR, "narration.mp3"))
shutil.copyfile(sync_json_path, os.path.join(PUBLIC_EP02_DIR, "scene_timeline_sync.json"))

print("\n══════════════════════════════════════════════════════════════════")
print("🎉 LOCUÇÃO E TIMELINE SINCRONIZADA GERADAS COM SUCESSO!")
print(f"⏱️ Duração Total: {total_frames / FPS:.2f} segundos ({total_frames} frames @ 30fps)")
print(f"📁 Master Narration: {master_narration}")
print(f"📊 Timeline Sync: {sync_json_path}")
print("══════════════════════════════════════════════════════════════════\n")

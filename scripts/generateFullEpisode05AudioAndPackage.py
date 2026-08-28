import os
import sys
import json
import time
import urllib.request
import subprocess

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

API_KEYS = [
    "sk_c27c4c44ba3f64f2c332c50d3e728f8ac10bfe093e5c3db9",
    "sk_2669c44e115a2130ca8521b2824e9bf3572d7cb236904906",
    "sk_44731b62917a45c2e10555c2c31b5ad90f256e9263738ada"
]

VOICE_CHRIS = "iP95p4xoKVk53GoZ742B"
MODEL_ID = "eleven_multilingual_v2"

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
RUN_DIR = os.path.join(BASE_DIR, "runs", "OOL-EP05-RADAR-ASFALTO")
POST_DIR = os.path.join(RUN_DIR, "postproduction")
AUDIO_DIR = os.path.join(POST_DIR, "scenes_audio")
PUBLIC_POST_DIR = os.path.join(BASE_DIR, "public", "postproduction")

os.makedirs(AUDIO_DIR, exist_ok=True)
os.makedirs(PUBLIC_POST_DIR, exist_ok=True)

# 50 Cenas com Narração Completa, Sóbria e Magnética
SCRIPT_SCENES = [
    # CAPÍTULO 1: O Clarão na Escuridão & O Mito da Câmera (Cenas 1 a 7)
    {
        "sceneId": "OOL_001",
        "chapterId": "CH01",
        "chapterTitle": "O Clarão na Escuridão & O Mito da Câmera",
        "name": "O Gatilho da Frenagem Noturna",
        "callout": "118 KM/H",
        "motionMode": "slow_push_in",
        "voiceoverText": "Você está dirigindo em uma rodovia deserta à noite. O velocímetro marca cento e dezoito quilômetros por hora."
    },
    {
        "sceneId": "OOL_002",
        "chapterId": "CH01",
        "chapterTitle": "O Clarão na Escuridão & O Mito da Câmera",
        "name": "A Sombra da Haste no Horizonte",
        "motionMode": "dramatic_pull_out",
        "voiceoverText": "De repente, no topo da colina, surge a silhueta inconfundível de uma haste metálica sobre a pista."
    },
    {
        "sceneId": "OOL_003",
        "chapterId": "CH01",
        "chapterTitle": "O Clarão na Escuridão & O Mito da Câmera",
        "name": "O Reflexo do Pedal de Freio",
        "motionMode": "crash_push_in",
        "voiceoverText": "O reflexo imediato de qualquer motorista é afundar o pé no freio, torcendo para que a velocidade caia a tempo."
    },
    {
        "sceneId": "OOL_004",
        "chapterId": "CH01",
        "chapterTitle": "O Clarão na Escuridão & O Mito da Câmera",
        "name": "O Clarão Estroboscópico",
        "motionMode": "slow_push_in",
        "voiceoverText": "Mas na maioria das vezes, quando você enxerga a câmera no poste, a decisão sobre a sua infração já foi tomada."
    },
    {
        "sceneId": "OOL_005",
        "chapterId": "CH01",
        "chapterTitle": "O Clarão na Escuridão & O Mito da Câmera",
        "name": "A Ilusão do Olhar Ótico",
        "motionMode": "cinematic_drift",
        "voiceoverText": "Existe uma ilusão coletiva de que o radar é apenas uma lente inteligente apontada para o asfalto."
    },
    {
        "sceneId": "OOL_006",
        "chapterId": "CH01",
        "chapterTitle": "O Clarão na Escuridão & O Mito da Câmera",
        "name": "A Velocidade do Disparo",
        "callout": "1/10.000s",
        "motionMode": "slow_push_in",
        "voiceoverText": "Acreditamos que uma câmera comum está filmando a pista e medindo os carros por processamento de imagem."
    },
    {
        "sceneId": "OOL_007",
        "chapterId": "CH01",
        "chapterTitle": "O Clarão na Escuridão & O Mito da Câmera",
        "name": "A Verdade Debaixo dos Pneus",
        "motionMode": "dramatic_pull_out",
        "voiceoverText": "A realidade é muito mais fria e invisível. A câmera no alto é apenas a última testemunha de um crime calculado no chão."
    },

    # CAPÍTULO 2: A Máquina Escondida no Asfalto (Cenas 8 a 15)
    {
        "sceneId": "OOL_008",
        "chapterId": "CH02",
        "chapterTitle": "A Máquina Escondida no Asfalto",
        "name": "O Corte com Disco de Diamante",
        "motionMode": "slow_push_in",
        "voiceoverText": "Meses antes do radar ser ligado, uma máquina corta o asfalto com discos de diamante em ranhuras milimétricas."
    },
    {
        "sceneId": "OOL_009",
        "chapterId": "CH02",
        "chapterTitle": "A Máquina Escondida no Asfalto",
        "name": "A Inserção do Cabo de Cobre",
        "motionMode": "pan_right",
        "voiceoverText": "Dentro dessas fendas profundas, técnicos inserem bobinas de cobre puro revestidas com resina epóxi de alta densidade."
    },
    {
        "sceneId": "OOL_010",
        "chapterId": "CH02",
        "chapterTitle": "A Máquina Escondida no Asfalto",
        "name": "A Geometria dos 3 Metros",
        "callout": "3,00 METROS",
        "motionMode": "slow_push_in",
        "voiceoverText": "São instalados exatamente três laços indutivos em sequência, separados por uma distância rígida de três metros."
    },
    {
        "sceneId": "OOL_011",
        "chapterId": "CH02",
        "chapterTitle": "A Máquina Escondida no Asfalto",
        "name": "O Sensor Piezoelétrico de Quartzo",
        "motionMode": "pan_left",
        "voiceoverText": "Entre esses laços, lâminas piezoelétricas contendo cristais de quartzo são cravadas no concreto da rodovia."
    },
    {
        "sceneId": "OOL_012",
        "chapterId": "CH02",
        "chapterTitle": "A Máquina Escondida no Asfalto",
        "name": "A Corrente de Alta Frequência",
        "motionMode": "cinematic_drift",
        "voiceoverText": "Um oscilador eletrônico injeta uma corrente contínua de alta frequência nesses laços subterrâneos."
    },
    {
        "sceneId": "OOL_013",
        "chapterId": "CH02",
        "chapterTitle": "A Máquina Escondida no Asfalto",
        "name": "O Campo Magnético Invisível",
        "motionMode": "slow_push_in",
        "voiceoverText": "Esse fluxo de elétrons cria um campo eletromagnético constante que paira a poucos centímetros acima da pista."
    },
    {
        "sceneId": "OOL_014",
        "chapterId": "CH02",
        "chapterTitle": "A Máquina Escondida no Asfalto",
        "name": "A Armadilha Eletromagnética",
        "motionMode": "dramatic_pull_out",
        "voiceoverText": "O asfalto aparentemente inerte se transforma em uma armadilha eletromagnética em repouso permanente."
    },
    {
        "sceneId": "OOL_015",
        "chapterId": "CH02",
        "chapterTitle": "A Máquina Escondida no Asfalto",
        "name": "O Cronômetro Subterrâneo",
        "callout": "60.000 µs",
        "motionMode": "crash_push_in",
        "voiceoverText": "Aguardando apenas a passagem da massa de aço do seu automóvel para despertar seus microprocessadores."
    },

    # CAPÍTULO 3: O Cálculo dos Microssegundos (Cenas 16 a 24)
    {
        "sceneId": "OOL_016",
        "chapterId": "CH03",
        "chapterTitle": "O Cálculo dos Microssegundos",
        "name": "A Indutância Deformada",
        "motionMode": "slow_push_in",
        "voiceoverText": "Quando o chassi metálico do carro entra sobre o primeiro laço, a indutância do circuito sofre uma queda abrupta."
    },
    {
        "sceneId": "OOL_017",
        "chapterId": "CH03",
        "chapterTitle": "O Cálculo dos Microssegundos",
        "name": "O Disparo do Tempo Zero",
        "motionMode": "pan_right",
        "voiceoverText": "No exato instante em que a frequência se altera, a placa controladora registra o tempo inicial com precisão atômica."
    },
    {
        "sceneId": "OOL_018",
        "chapterId": "CH03",
        "chapterTitle": "O Cálculo dos Microssegundos",
        "name": "A Pressão sobre o Cristal",
        "motionMode": "slow_push_in",
        "voiceoverText": "Milissegundos depois, os pneus dianteiros comprimem o sensor piezoelétrico, gerando uma descarga elétrica por pressão."
    },
    {
        "sceneId": "OOL_019",
        "chapterId": "CH03",
        "chapterTitle": "O Cálculo dos Microssegundos",
        "name": "A Validação de Eixos e Categoria",
        "motionMode": "cinematic_drift",
        "voiceoverText": "Esse pulso de pressão confirma que o objeto é um veículo real, classificando o número de eixos e o peso estimado."
    },
    {
        "sceneId": "OOL_020",
        "chapterId": "CH03",
        "chapterTitle": "O Cálculo dos Microssegundos",
        "name": "A Entrada no Segundo Laço",
        "motionMode": "slow_push_in",
        "voiceoverText": "O veículo continua seu deslocamento e cruza o segundo laço indutivo, localizado exatamente três metros à frente."
    },
    {
        "sceneId": "OOL_021",
        "chapterId": "CH03",
        "chapterTitle": "O Cálculo dos Microssegundos",
        "name": "O Registro do Tempo Final",
        "motionMode": "crash_push_in",
        "voiceoverText": "Uma segunda variação de indutância é capturada, gravando o tempo final da passagem em microssegundos."
    },
    {
        "sceneId": "OOL_022",
        "chapterId": "CH03",
        "chapterTitle": "O Cálculo dos Microssegundos",
        "name": "O Processador Subterrâneo",
        "motionMode": "pan_left",
        "voiceoverText": "Dentro do gabinete blindado à beira da pista, um microprocessador dedicado executa o cálculo instantâneo."
    },
    {
        "sceneId": "OOL_023",
        "chapterId": "CH03",
        "chapterTitle": "O Cálculo dos Microssegundos",
        "name": "A Equação da Velocidade",
        "callout": "V = ΔS / ΔT",
        "motionMode": "slow_push_in",
        "voiceoverText": "A distância fixa dividida pelo intervalo de tempo decorrido revela a velocidade escalar exata do veículo."
    },
    {
        "sceneId": "OOL_024",
        "chapterId": "CH03",
        "chapterTitle": "O Cálculo dos Microssegundos",
        "name": "A Sentença em Microssegundos",
        "motionMode": "dramatic_pull_out",
        "voiceoverText": "Se a velocidade medida ultrapassar o limite calibrado da via, o sistema emite o sinal de gatilho para a câmera."
    },

    # CAPÍTULO 4: A Foto Noturna e a Leitura OCR (Cenas 25 a 33)
    {
        "sceneId": "OOL_025",
        "chapterId": "CH04",
        "chapterTitle": "A Foto Noturna e a Leitura OCR",
        "name": "O Gatilho Ótico Acionado",
        "motionMode": "slow_push_in",
        "voiceoverText": "O sinal elétrico sobe pelo poste metálico através de um cabo de fibra ótica imune a interferências."
    },
    {
        "sceneId": "OOL_026",
        "chapterId": "CH04",
        "chapterTitle": "A Foto Noturna e a Leitura OCR",
        "name": "O Flash Infravermelho Invisível",
        "motionMode": "crash_push_in",
        "voiceoverText": "No alto da estrutura, um canhão de luz estroboscópica infravermelha dispara em um comprimento de onda invisível ao olho humano."
    },
    {
        "sceneId": "OOL_027",
        "chapterId": "CH04",
        "chapterTitle": "A Foto Noturna e a Leitura OCR",
        "name": "A Iluminação da Chapa Refletiva",
        "motionMode": "pan_right",
        "voiceoverText": "A luz invisível atinge as microesferas de vidro retrorrefletivas da placa Mercosul na traseira do automóvel."
    },
    {
        "sceneId": "OOL_028",
        "chapterId": "CH04",
        "chapterTitle": "A Foto Noturna e a Leitura OCR",
        "name": "O Obturador Global Eletrônico",
        "motionMode": "slow_push_in",
        "voiceoverText": "O sensor industrial da câmera abre seu obturador global por apenas um décimo de milésimo de segundo."
    },
    {
        "sceneId": "OOL_029",
        "chapterId": "CH04",
        "chapterTitle": "A Foto Noturna e a Leitura OCR",
        "name": "A Foto Perfeita Sem Borrão",
        "motionMode": "cinematic_drift",
        "voiceoverText": "Mesmo que o veículo esteja a cento e oitenta quilômetros por hora, a imagem congelada é matematicamente nítida."
    },
    {
        "sceneId": "OOL_030",
        "chapterId": "CH04",
        "chapterTitle": "A Foto Noturna e a Leitura OCR",
        "name": "O Reconhecimento Ótico de Caracteres",
        "callout": "RECONHECIMENTO 99.4%",
        "motionMode": "slow_push_in",
        "voiceoverText": "O software de OCR isola os sete caracteres alfanuméricos da placa com uma taxa de precisão de noventa e nove por cento."
    },
    {
        "sceneId": "OOL_031",
        "chapterId": "CH04",
        "chapterTitle": "A Foto Noturna e a Leitura OCR",
        "name": "A Coleta de Telemetria e GPS",
        "motionMode": "pan_left",
        "voiceoverText": "Simultaneamente, o sistema anexa as coordenadas geográficas, a velocidade aferida, a data e a temperatura da pista."
    },
    {
        "sceneId": "OOL_032",
        "chapterId": "CH04",
        "chapterTitle": "A Foto Noturna e a Leitura OCR",
        "name": "A Criptografia SHA-256",
        "motionMode": "slow_push_in",
        "voiceoverText": "Todo o pacote de dados é selado com um hash criptográfico inviolável, garantindo que a prova não seja adulterada."
    },
    {
        "sceneId": "OOL_033",
        "chapterId": "CH04",
        "chapterTitle": "A Foto Noturna e a Leitura OCR",
        "name": "O Envio Seguro ao Servidor Central",
        "motionMode": "dramatic_pull_out",
        "voiceoverText": "Em menos de um segundo, o dossiê da infração é transmitido via conexão segura aos servidores do órgão de trânsito."
    },

    # CAPÍTULO 5: O Gargalo Físico e a Margem do INMETRO (Cenas 34 a 42)
    {
        "sceneId": "OOL_034",
        "chapterId": "CH05",
        "chapterTitle": "O Gargalo Físico e a Margem do INMETRO",
        "name": "O Asfalto sob o Calor Extremo",
        "motionMode": "slow_push_in",
        "voiceoverText": "Mas a física do mundo real não é um laboratório perfeito. O asfalto de uma rodovia sofre dilatações severas."
    },
    {
        "sceneId": "OOL_035",
        "chapterId": "CH05",
        "chapterTitle": "O Gargalo Físico e a Margem do INMETRO",
        "name": "A Deformação das Fendas",
        "motionMode": "pan_right",
        "voiceoverText": "Sob o sol de meio-dia, o pavimento pode ultrapassar sessenta graus, expandindo a distância entre os laços indutivos."
    },
    {
        "sceneId": "OOL_036",
        "chapterId": "CH05",
        "chapterTitle": "O Gargalo Físico e a Margem do INMETRO",
        "name": "A Vibração de Cargas Pesadas",
        "motionMode": "slow_push_in",
        "voiceoverText": "A passagem constante de carretas de quarenta toneladas gera vibrações e microfraturas nos cristais de quartzo."
    },
    {
        "sceneId": "OOL_037",
        "chapterId": "CH05",
        "chapterTitle": "O Gargalo Físico e a Margem do INMETRO",
        "name": "O Ruído Eletromagnético",
        "motionMode": "cinematic_drift",
        "voiceoverText": "Tempestades e descargas elétricas atmosféricas também podem induzir correntes espúrias no solo."
    },
    {
        "sceneId": "OOL_038",
        "chapterId": "CH05",
        "chapterTitle": "O Gargalo Físico e a Margem do INMETRO",
        "name": "A Rigidez Regulatória do INMETRO",
        "motionMode": "slow_push_in",
        "voiceoverText": "É por essa razão que o INMETRO impõe normas metrológicas extremamente rigorosas para a homologação de radares."
    },
    {
        "sceneId": "OOL_039",
        "chapterId": "CH05",
        "chapterTitle": "O Gargalo Físico e a Margem do INMETRO",
        "name": "O Terceiro Laço de Verificação",
        "motionMode": "pan_left",
        "voiceoverText": "O terceiro laço indutivo existe exclusivamente para auditar os dois primeiros em uma validação cruzada contínua."
    },
    {
        "sceneId": "OOL_040",
        "chapterId": "CH05",
        "chapterTitle": "O Gargalo Físico e a Margem do INMETRO",
        "name": "O Descarte Automático da Medição",
        "motionMode": "crash_push_in",
        "voiceoverText": "Se a diferença temporal entre os sensores ultrapassar um milésimo de segundo, a medição é sumariamente descartada."
    },
    {
        "sceneId": "OOL_041",
        "chapterId": "CH05",
        "chapterTitle": "O Gargalo Físico e a Margem do INMETRO",
        "name": "A Margem de Erro Legal",
        "callout": "±7 KM/H",
        "motionMode": "slow_push_in",
        "voiceoverText": "A tolerância legal de sete quilômetros por hora não é um benefício ao condutor, mas a proteção física contra a incerteza do hardware."
    },
    {
        "sceneId": "OOL_042",
        "chapterId": "CH05",
        "chapterTitle": "O Gargalo Físico e a Margem do INMETRO",
        "name": "A Blindagem Jurídica do Sistema",
        "motionMode": "dramatic_pull_out",
        "voiceoverText": "Garantindo que nenhuma autuação seja emitida sem que a evidência física seja incontestável."
    },

    # CAPÍTULO 6: O Outro Lado da Velocidade (Cenas 43 a 50)
    {
        "sceneId": "OOL_043",
        "chapterId": "CH06",
        "chapterTitle": "O Outro Lado da Velocidade",
        "name": "A Rede Invisível nas Estradas",
        "motionMode": "slow_push_in",
        "voiceoverText": "Milhares desses nós de telemetria cobrem a malha rodoviária do país, operando de forma silenciosa dia e noite."
    },
    {
        "sceneId": "OOL_044",
        "chapterId": "CH06",
        "chapterTitle": "O Outro Lado da Velocidade",
        "name": "O Fluxo Contínuo de Dados",
        "motionMode": "pan_right",
        "voiceoverText": "Eles monitoram o fluxo de tráfego, identificam veículos roubados e calculam a dinâmica do transporte em tempo real."
    },
    {
        "sceneId": "OOL_045",
        "chapterId": "CH06",
        "chapterTitle": "O Outro Lado da Velocidade",
        "name": "A Conexão entre o Físico e o Digital",
        "motionMode": "slow_push_in",
        "voiceoverText": "Um monumento invisível da engenharia civil e eletrônica integrado diretamente no solo que sustentamos."
    },
    {
        "sceneId": "OOL_046",
        "chapterId": "CH06",
        "chapterTitle": "O Outro Lado da Velocidade",
        "name": "O Carro se Afastando na Noite",
        "motionMode": "cinematic_drift",
        "voiceoverText": "Na próxima vez que você cruzar uma haste de radar em uma rodovia escura, lembre-se do que está sob suas rodas."
    },
    {
        "sceneId": "OOL_047",
        "chapterId": "CH06",
        "chapterTitle": "O Outro Lado da Velocidade",
        "name": "Os Campos Magnéticos Pulsando",
        "motionMode": "slow_push_in",
        "voiceoverText": "Você não estará sendo vigiado apenas por uma câmera no alto de um poste."
    },
    {
        "sceneId": "OOL_048",
        "chapterId": "CH06",
        "chapterTitle": "O Outro Lado da Velocidade",
        "name": "O Cálculo Perpétuo no Asfalto",
        "motionMode": "dramatic_pull_out",
        "voiceoverText": "Você estará interagindo com campos magnéticos, cristais comprimidos e equações calculadas em microssegundos."
    },
    {
        "sceneId": "OOL_049",
        "chapterId": "CH06",
        "chapterTitle": "O Outro Lado da Velocidade",
        "name": "O Mundo Oculto da Infraestrutura",
        "motionMode": "slow_push_in",
        "voiceoverText": "Porque tudo o que parece simples na superfície esconde uma máquina colossal do outro lado."
    },
    {
        "sceneId": "OOL_050",
        "chapterId": "CH06",
        "chapterTitle": "O Outro Lado da Velocidade",
        "name": "A Assinatura Oficial",
        "callout": "INVESTIGAR. REVELAR. COMPREENDER.",
        "motionMode": "slow_push_in",
        "voiceoverText": "Investigar. Revelar. Compreender."
    }
]

# Atualizar documentary-edit-package.json
edit_pkg_path = os.path.join(RUN_DIR, "editorial", "execution", "documentary-edit-package.json")
with open(edit_pkg_path, "w", encoding="utf-8") as f:
    json.dump({"episodeId": "OOL-EP05-RADAR-ASFALTO", "scenes": SCRIPT_SCENES}, f, indent=2, ensure_ascii=False)
print(f"✅ documentary-edit-package.json atualizado com {len(SCRIPT_SCENES)} cenas de roteiro completo!")

# Função para chamar a API ElevenLabs
key_idx = 0
def call_elevenlabs(text, output_path):
    global key_idx
    for attempt in range(len(API_KEYS) * 3):
        k = API_KEYS[key_idx % len(API_KEYS)]
        url = f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_CHRIS}"
        headers = {
            "xi-api-key": k,
            "Content-Type": "application/json",
            "Accept": "audio/mpeg"
        }
        body = json.dumps({
            "text": text,
            "model_id": MODEL_ID,
            "voice_settings": {
                "stability": 0.48,
                "similarity_boost": 0.85,
                "style": 0.15,
                "use_speaker_boost": True
            }
        }).encode("utf-8")

        try:
            req = urllib.request.Request(url, data=body, headers=headers, method="POST")
            with urllib.request.urlopen(req, timeout=30) as resp:
                if resp.status == 200:
                    with open(output_path, "wb") as f:
                        f.write(resp.read())
                    return True
        except Exception as e:
            print(f"  ⚠️ Chave {key_idx % len(API_KEYS)} ({k[:8]}...) falhou: {e}. Rotacionando chave...")
            key_idx += 1
            time.sleep(1)

    return False

# Limpar e forçar a regeneração real de todas as 50 cenas
print(f"\n🎙️ GERANDO ÁUDIO REAL DE TODAS AS 50 CENAS COM ELEVENLABS CHRIS ({VOICE_CHRIS})...")
scene_timings = []
current_frame = 0
FPS = 30

for idx, sc in enumerate(SCRIPT_SCENES):
    sc_id = sc["sceneId"]
    out_file = os.path.join(AUDIO_DIR, f"{sc_id}.mp3")
    text = sc["voiceoverText"]

    # Forçar chamada do ElevenLabs
    print(f"[{idx+1}/50] Gerando áudio para {sc_id} ({len(text)} chars)...")
    ok = call_elevenlabs(text, out_file)
    if not ok:
        print(f"❌ Falha crítica ao gerar áudio para {sc_id}")
        sys.exit(1)

    # Medir a duração exata do áudio gerado
    probe_cmd = ['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'json', out_file]
    probe = subprocess.run(probe_cmd, capture_output=True, text=True)
    dur_sec = float(json.loads(probe.stdout)['format']['duration'])
    
    # Adicionar padding de 0.6s de respiração natural para o ritmo de montagem 35mm
    scene_dur_sec = max(3.5, dur_sec + 0.6)
    dur_frames = int(round(scene_dur_sec * FPS))

    scene_timings.append({
        "sceneId": sc_id,
        "name": sc["name"],
        "chapterId": sc["chapterId"],
        "chapterTitle": sc["chapterTitle"],
        "callout": sc.get("callout"),
        "motionMode": sc.get("motionMode", "slow_push_in"),
        "audioDurationSeconds": round(dur_sec, 3),
        "sceneDurationSeconds": round(scene_dur_sec, 3),
        "startFrame": current_frame,
        "durationFrames": dur_frames,
        "audioPath": f"postproduction/scenes_audio/{sc_id}.mp3"
    })
    
    print(f"  ✅ {sc_id}: áudio = {dur_sec:.2f}s | cena = {scene_dur_sec:.2f}s ({dur_frames} frames)")
    current_frame += dur_frames
    time.sleep(0.2)

total_duration_sec = current_frame / FPS
print(f"\n📊 Total de Cenas: {len(scene_timings)} | Duração Total: {total_duration_sec:.2f}s ({total_duration_sec/60:.2f} min) | Total Frames: {current_frame}")

# Salvar scene_timings.json
timings_path = os.path.join(POST_DIR, "scene_timings.json")
with open(timings_path, "w", encoding="utf-8") as f:
    json.dump({
        "episodeId": "OOL-EP05-RADAR-ASFALTO",
        "totalDurationSeconds": round(total_duration_sec, 2),
        "totalDurationFrames": current_frame,
        "scenes": scene_timings
    }, f, indent=2, ensure_ascii=False)
print(f"✅ scene_timings.json gravado com sucesso!")

# Concatenar todos os áudios individuais no narration_raw.mp3
concat_txt_path = os.path.join(POST_DIR, "concat_list.txt")
with open(concat_txt_path, "w", encoding="utf-8") as f:
    for item in scene_timings:
        sc_id = item["sceneId"]
        f.write(f"file 'scenes_audio/{sc_id}.mp3'\n")

narration_raw = os.path.join(POST_DIR, "narration_raw.mp3")
narration_norm = os.path.join(POST_DIR, "narration.mp3")

subprocess.run([
    'ffmpeg', '-y', '-f', 'concat', '-safe', '0',
    '-i', concat_txt_path,
    '-c', 'copy',
    narration_raw
], check=True)

# Normalizar áudio da narração master para -16.0 LUFS
print(f"🎚️ Normalizando narração master para -16.0 LUFS...")
subprocess.run([
    'ffmpeg', '-y',
    '-i', narration_raw,
    '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11',
    '-b:a', '192k',
    narration_norm
], check=True)

# Copiar para public
import shutil
shutil.copy2(narration_norm, os.path.join(PUBLIC_POST_DIR, "narration.mp3"))
print(f"🎉 Locução real ElevenLabs Chris gerada e calibrada com sucesso!")

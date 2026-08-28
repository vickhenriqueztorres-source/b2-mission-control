import json
import os

timings_path = r"runs/OOL-EP02-CABOS/postproduction/scene_timings.json"
with open(timings_path, "r", encoding="utf-8") as f:
    timings = json.load(f)

# Scene visual subjects and types mapping
scene_types = [
    ("SC_001", "CH01", "O Mito do Satélite", "firefly_take", "Dedo tocando tela smartphone 4K"),
    ("SC_002", "CH01", "A Ilusão Orbital", "cinematic_parallax", "Satélites em órbita vs latência"),
    ("SC_003", "CH01", "O Abismo Atlântico", "firefly_take", "Mergulho no leito marinho escuro"),
    ("SC_004", "CH01", "Os 25 Milímetros", "cable_cross_section_3d", "Tubo cilíndrico de 25mm na areia"),
    ("SC_005", "CH01", "Escala da Mangueira", "cinematic_parallax", "Comparação física com mangueira"),
    ("SC_006", "CH01", "A Linha Invisível", "bathymetry_map", "Cabos submarinos convergindo ao Brasil"),
    ("SC_007", "CH01", "A Física Quântica", "kinetic_counter", "Pulso de fótons laser a 200.000 km/s"),
    ("SC_008", "CH01", "Entrando no Laboratório", "firefly_take", "Microscópio eletrônico e corte de sílica"),

    ("SC_009", "CH02", "Anatomia das 7 Camadas", "cable_cross_section_3d", "Raio-X volumétrico das camadas"),
    ("SC_010", "CH02", "Polietileno de Alta Densidade", "cinematic_parallax", "Polietileno anti-corrosão 25 anos"),
    ("SC_011", "CH02", "Armadura de Aço Trançado", "cable_cross_section_3d", "Fios helicoidais de aço 50 toneladas"),
    ("SC_012", "CH02", "Condutor de Cobre 10.000V", "cinematic_parallax", "Tubo de cobre 10.000V contínuos"),
    ("SC_013", "CH02", "Barreira de Policarbonato", "cable_cross_section_3d", "Gel hidrofóbico estanque"),
    ("SC_014", "CH02", "O Núcleo de Sílica Pura", "cinematic_parallax", "12 pares de fibras do tamanho de cabelo"),
    ("SC_015", "CH02", "Capacidade DWDM 250 Tbps", "kinetic_counter", "Espectro DWDM 250 Terabits por segundo"),
    ("SC_016", "CH02", "O Paradoxo da Distância", "firefly_take", "Ponta de fibra emitindo luz no escuro"),

    ("SC_017", "CH03", "Pressão a 4.000 Metros", "bathymetry_map", "Profundímetro 400 atmosferas"),
    ("SC_018", "CH03", "Atenuação de Fótons", "cinematic_parallax", "Decaimento da luz no vidro"),
    ("SC_019", "CH03", "Repetidores EDFA Submarinos", "erbium_amplifier", "Cilindro de titânio EDFA a cada 80km"),
    ("SC_020", "CH03", "Átomos de Érbio Excitados", "erbium_amplifier", "Dopagem com Érbio e laser de bombeamento"),
    ("SC_021", "CH03", "Emissão Estimulada Quântica", "erbium_amplifier", "Multiplicação de fótons coerentes"),
    ("SC_022", "CH03", "Alimentação de 10.000 Volts", "cinematic_parallax", "Injeção de alta voltagem pelas praias"),
    ("SC_023", "CH03", "Oceano como Circuito Terra", "bathymetry_map", "Loop elétrico fechado pela água salgada"),
    ("SC_024", "CH03", "Chegada à Costa", "firefly_take", "Cabo emergindo e entrando na galeria"),

    ("SC_025", "CH04", "Fortaleza e Praia Grande", "bathymetry_map", "Os dois corações de fibra do Brasil"),
    ("SC_026", "CH04", "O Segundo Maior Hub Global", "cinematic_parallax", "16 cabos na Praia do Futuro"),
    ("SC_027", "CH04", "Perfuração Direcional", "firefly_take", "Duto subterrâneo sob as ondas"),
    ("SC_028", "CH04", "O Bunker da Landing Station", "firefly_take", "Bunker blindado com segurança militar"),
    ("SC_029", "CH04", "Unidade PFE e Filtros DWDM", "cinematic_parallax", "Painel de alta tensão e separação óptica"),
    ("SC_030", "CH04", "Subida da Serra do Mar", "bathymetry_map", "Fibras terrestres até São Paulo"),
    ("SC_031", "CH04", "O Gigante IX.br (30 Tbps)", "kinetic_counter", "Maior troca de tráfego do mundo"),
    ("SC_032", "CH04", "A Ameaça das 50.000 Toneladas", "firefly_take", "Navio cargueiro jogando âncora"),

    ("SC_033", "CH05", "O Impacto da Âncora", "firefly_take", "Âncora colidindo com o cabo submarino"),
    ("SC_034", "CH05", "Ruptura Total de Fibras", "cinematic_parallax", "Feixes de laser dissipando na água"),
    ("SC_035", "CH05", "Alarme Loss of Signal", "bgp_inspector", "Alarme vermelho no NOC em milissegundos"),
    ("SC_036", "CH05", "Telemetria Laser OTDR", "bgp_inspector", "Laser OTDR medindo ponto exato em km"),
    ("SC_037", "CH05", "A Inteligência Autônoma BGP", "bgp_inspector", "Roteadores recalculando rotas"),
    ("SC_038", "CH05", "Failover em 14.2 Milissegundos", "kinetic_counter", "Cronômetro atômico travando em 14.2ms"),
    ("SC_039", "CH05", "Mobilização do Navio de Reparo", "firefly_take", "Navio de cabos navegando no Atlântico"),
    ("SC_040", "CH05", "Robô ROV a 4.000 Metros", "firefly_take", "Robô cortando e içando as pontas"),
    ("SC_041", "CH05", "Fusão de Precisão em Sala Limpa", "cinematic_parallax", "Arco voltaico fundindo sílica microscópica"),
    ("SC_042", "CH05", "Junta de Titânio e Retorno", "firefly_take", "Cabo selado devolvido ao abismo"),

    ("SC_043", "CH06", "A Ilusão da Nuvem Etérea", "bathymetry_map", "Terra à noite com artérias de luz"),
    ("SC_044", "CH06", "A Densidade Física do Vidro", "cinematic_parallax", "Reflexo no vidro de alta pureza"),
    ("SC_045", "CH06", "Conexão Humana Global", "firefly_take", "Metrópole conectada sobre leito oceânico"),
    ("SC_046", "CH06", "A Fragilidade dos 25mm", "cable_cross_section_3d", "Corte das 7 camadas em alta tensão"),
    ("SC_047", "CH06", "O Outro Lado da Máquina", "cinematic_parallax", "Tipografia O Outro Lado Chiaroscuro"),
    ("SC_048", "CH06", "Investigar. Revelar. Compreender.", "firefly_take", "Selo editorial de engenharia"),
    ("SC_049", "CH06", "Ponte para Próximas Revelações", "cinematic_parallax", "Grade de episódios futuros"),
    ("SC_050", "CH06", "Fade Out Final", "firefly_take", "Luz de laser desaparecendo no escuro")
]

timeline_data = []
total_frames = 0

for i, t in enumerate(timings):
    scene_id = t["sceneId"]
    meta = next((item for item in scene_types if item[0] == scene_id), (scene_id, "CH01", f"Cena {i+1}", "firefly_take", "Cena documental"))
    
    start_f = t["startFrame"]
    dur_f = t["durationFrames"]
    end_f = start_f + dur_f
    total_frames = max(total_frames, end_f)
    
    timeline_data.append({
        "scene_id": scene_id,
        "chapter_id": meta[1],
        "name": meta[2],
        "type": meta[3],
        "text": meta[4],
        "duration_seconds": t["durationSeconds"],
        "duration_frames": dur_f,
        "start_frame": start_f,
        "end_frame": end_f
    })

ts_content = f"""export interface EpisodeSceneTimeline {{
  readonly scene_id: string;
  readonly chapter_id: string;
  readonly name: string;
  readonly type: string;
  readonly text: string;
  readonly duration_seconds: number;
  readonly duration_frames: number;
  readonly start_frame: number;
  readonly end_frame: number;
}}

export const EPISODE_02_SCENES: readonly EpisodeSceneTimeline[] = {json.dumps(timeline_data, indent=2)};

export const EPISODE_02_TOTAL_FRAMES = {total_frames};
"""

with open(r"remotion/episode02TimelineData.ts", "w", encoding="utf-8") as f_out:
    f_out.write(ts_content)

print(f"Generated remotion/episode02TimelineData.ts with {len(timeline_data)} scenes, total frames: {total_frames}")

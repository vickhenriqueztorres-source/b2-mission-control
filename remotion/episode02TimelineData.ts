export interface EpisodeSceneTimeline {
  readonly scene_id: string;
  readonly chapter_id: string;
  readonly name: string;
  readonly type: string;
  readonly text: string;
  readonly duration_seconds: number;
  readonly duration_frames: number;
  readonly start_frame: number;
  readonly end_frame: number;
}

export const EPISODE_02_SCENES: readonly EpisodeSceneTimeline[] = [
  {
    "scene_id": "SC_001",
    "chapter_id": "CH01",
    "name": "O Mito do Sat\u00e9lite",
    "type": "firefly_take",
    "text": "Dedo tocando tela smartphone 4K",
    "duration_seconds": 10.913379,
    "duration_frames": 342,
    "start_frame": 0,
    "end_frame": 342
  },
  {
    "scene_id": "SC_002",
    "chapter_id": "CH01",
    "name": "A Ilus\u00e3o Orbital",
    "type": "cinematic_parallax",
    "text": "Sat\u00e9lites em \u00f3rbita vs lat\u00eancia",
    "duration_seconds": 11.842177,
    "duration_frames": 370,
    "start_frame": 342,
    "end_frame": 712
  },
  {
    "scene_id": "SC_003",
    "chapter_id": "CH01",
    "name": "O Abismo Atl\u00e2ntico",
    "type": "firefly_take",
    "text": "Mergulho no leito marinho escuro",
    "duration_seconds": 8.591383,
    "duration_frames": 272,
    "start_frame": 712,
    "end_frame": 984
  },
  {
    "scene_id": "SC_004",
    "chapter_id": "CH01",
    "name": "Os 25 Mil\u00edmetros",
    "type": "cable_cross_section_3d",
    "text": "Tubo cil\u00edndrico de 25mm na areia",
    "duration_seconds": 11.052698,
    "duration_frames": 346,
    "start_frame": 984,
    "end_frame": 1330
  },
  {
    "scene_id": "SC_005",
    "chapter_id": "CH01",
    "name": "Escala da Mangueira",
    "type": "cinematic_parallax",
    "text": "Compara\u00e7\u00e3o f\u00edsica com mangueira",
    "duration_seconds": 8.405624,
    "duration_frames": 267,
    "start_frame": 1330,
    "end_frame": 1597
  },
  {
    "scene_id": "SC_006",
    "chapter_id": "CH01",
    "name": "A Linha Invis\u00edvel",
    "type": "bathymetry_map",
    "text": "Cabos submarinos convergindo ao Brasil",
    "duration_seconds": 8.591383,
    "duration_frames": 272,
    "start_frame": 1597,
    "end_frame": 1869
  },
  {
    "scene_id": "SC_007",
    "chapter_id": "CH01",
    "name": "A F\u00edsica Qu\u00e2ntica",
    "type": "kinetic_counter",
    "text": "Pulso de f\u00f3tons laser a 200.000 km/s",
    "duration_seconds": 5.944308,
    "duration_frames": 193,
    "start_frame": 1869,
    "end_frame": 2062
  },
  {
    "scene_id": "SC_008",
    "chapter_id": "CH01",
    "name": "Entrando no Laborat\u00f3rio",
    "type": "firefly_take",
    "text": "Microsc\u00f3pio eletr\u00f4nico e corte de s\u00edlica",
    "duration_seconds": 6.130068,
    "duration_frames": 198,
    "start_frame": 2062,
    "end_frame": 2260
  },
  {
    "scene_id": "SC_009",
    "chapter_id": "CH02",
    "name": "Anatomia das 7 Camadas",
    "type": "cable_cross_section_3d",
    "text": "Raio-X volum\u00e9trico das camadas",
    "duration_seconds": 8.312744,
    "duration_frames": 264,
    "start_frame": 2260,
    "end_frame": 2524
  },
  {
    "scene_id": "SC_010",
    "chapter_id": "CH02",
    "name": "Polietileno de Alta Densidade",
    "type": "cinematic_parallax",
    "text": "Polietileno anti-corros\u00e3o 25 anos",
    "duration_seconds": 8.219864,
    "duration_frames": 261,
    "start_frame": 2524,
    "end_frame": 2785
  },
  {
    "scene_id": "SC_011",
    "chapter_id": "CH02",
    "name": "Armadura de A\u00e7o Tran\u00e7ado",
    "type": "cable_cross_section_3d",
    "text": "Fios helicoidais de a\u00e7o 50 toneladas",
    "duration_seconds": 9.287982,
    "duration_frames": 293,
    "start_frame": 2785,
    "end_frame": 3078
  },
  {
    "scene_id": "SC_012",
    "chapter_id": "CH02",
    "name": "Condutor de Cobre 10.000V",
    "type": "cinematic_parallax",
    "text": "Tubo de cobre 10.000V cont\u00ednuos",
    "duration_seconds": 9.148662,
    "duration_frames": 289,
    "start_frame": 3078,
    "end_frame": 3367
  },
  {
    "scene_id": "SC_013",
    "chapter_id": "CH02",
    "name": "Barreira de Policarbonato",
    "type": "cable_cross_section_3d",
    "text": "Gel hidrof\u00f3bico estanque",
    "duration_seconds": 9.287982,
    "duration_frames": 293,
    "start_frame": 3367,
    "end_frame": 3660
  },
  {
    "scene_id": "SC_014",
    "chapter_id": "CH02",
    "name": "O N\u00facleo de S\u00edlica Pura",
    "type": "cinematic_parallax",
    "text": "12 pares de fibras do tamanho de cabelo",
    "duration_seconds": 9.845261,
    "duration_frames": 310,
    "start_frame": 3660,
    "end_frame": 3970
  },
  {
    "scene_id": "SC_015",
    "chapter_id": "CH02",
    "name": "Capacidade DWDM 250 Tbps",
    "type": "kinetic_counter",
    "text": "Espectro DWDM 250 Terabits por segundo",
    "duration_seconds": 13.281814,
    "duration_frames": 413,
    "start_frame": 3970,
    "end_frame": 4383
  },
  {
    "scene_id": "SC_016",
    "chapter_id": "CH02",
    "name": "O Paradoxo da Dist\u00e2ncia",
    "type": "firefly_take",
    "text": "Ponta de fibra emitindo luz no escuro",
    "duration_seconds": 4.551111,
    "duration_frames": 151,
    "start_frame": 4383,
    "end_frame": 4534
  },
  {
    "scene_id": "SC_017",
    "chapter_id": "CH03",
    "name": "Press\u00e3o a 4.000 Metros",
    "type": "bathymetry_map",
    "text": "Profund\u00edmetro 400 atmosferas",
    "duration_seconds": 9.055782,
    "duration_frames": 286,
    "start_frame": 4534,
    "end_frame": 4820
  },
  {
    "scene_id": "SC_018",
    "chapter_id": "CH03",
    "name": "Atenua\u00e7\u00e3o de F\u00f3tons",
    "type": "cinematic_parallax",
    "text": "Decaimento da luz no vidro",
    "duration_seconds": 7.383946,
    "duration_frames": 236,
    "start_frame": 4820,
    "end_frame": 5056
  },
  {
    "scene_id": "SC_019",
    "chapter_id": "CH03",
    "name": "Repetidores EDFA Submarinos",
    "type": "erbium_amplifier",
    "text": "Cilindro de tit\u00e2nio EDFA a cada 80km",
    "duration_seconds": 11.563537,
    "duration_frames": 361,
    "start_frame": 5056,
    "end_frame": 5417
  },
  {
    "scene_id": "SC_020",
    "chapter_id": "CH03",
    "name": "\u00c1tomos de \u00c9rbio Excitados",
    "type": "erbium_amplifier",
    "text": "Dopagem com \u00c9rbio e laser de bombeamento",
    "duration_seconds": 10.820499,
    "duration_frames": 339,
    "start_frame": 5417,
    "end_frame": 5756
  },
  {
    "scene_id": "SC_021",
    "chapter_id": "CH03",
    "name": "Emiss\u00e3o Estimulada Qu\u00e2ntica",
    "type": "erbium_amplifier",
    "text": "Multiplica\u00e7\u00e3o de f\u00f3tons coerentes",
    "duration_seconds": 9.241542,
    "duration_frames": 292,
    "start_frame": 5756,
    "end_frame": 6048
  },
  {
    "scene_id": "SC_022",
    "chapter_id": "CH03",
    "name": "Alimenta\u00e7\u00e3o de 10.000 Volts",
    "type": "cinematic_parallax",
    "text": "Inje\u00e7\u00e3o de alta voltagem pelas praias",
    "duration_seconds": 10.541859,
    "duration_frames": 331,
    "start_frame": 6048,
    "end_frame": 6379
  },
  {
    "scene_id": "SC_023",
    "chapter_id": "CH03",
    "name": "Oceano como Circuito Terra",
    "type": "bathymetry_map",
    "text": "Loop el\u00e9trico fechado pela \u00e1gua salgada",
    "duration_seconds": 8.359184,
    "duration_frames": 265,
    "start_frame": 6379,
    "end_frame": 6644
  },
  {
    "scene_id": "SC_024",
    "chapter_id": "CH03",
    "name": "Chegada \u00e0 Costa",
    "type": "firefly_take",
    "text": "Cabo emergindo e entrando na galeria",
    "duration_seconds": 4.92263,
    "duration_frames": 162,
    "start_frame": 6644,
    "end_frame": 6806
  },
  {
    "scene_id": "SC_025",
    "chapter_id": "CH04",
    "name": "Fortaleza e Praia Grande",
    "type": "bathymetry_map",
    "text": "Os dois cora\u00e7\u00f5es de fibra do Brasil",
    "duration_seconds": 8.591383,
    "duration_frames": 272,
    "start_frame": 6806,
    "end_frame": 7078
  },
  {
    "scene_id": "SC_026",
    "chapter_id": "CH04",
    "name": "O Segundo Maior Hub Global",
    "type": "cinematic_parallax",
    "text": "16 cabos na Praia do Futuro",
    "duration_seconds": 8.591383,
    "duration_frames": 272,
    "start_frame": 7078,
    "end_frame": 7350
  },
  {
    "scene_id": "SC_027",
    "chapter_id": "CH04",
    "name": "Perfura\u00e7\u00e3o Direcional",
    "type": "firefly_take",
    "text": "Duto subterr\u00e2neo sob as ondas",
    "duration_seconds": 8.498503,
    "duration_frames": 269,
    "start_frame": 7350,
    "end_frame": 7619
  },
  {
    "scene_id": "SC_028",
    "chapter_id": "CH04",
    "name": "O Bunker da Landing Station",
    "type": "firefly_take",
    "text": "Bunker blindado com seguran\u00e7a militar",
    "duration_seconds": 10.07746,
    "duration_frames": 317,
    "start_frame": 7619,
    "end_frame": 7936
  },
  {
    "scene_id": "SC_029",
    "chapter_id": "CH04",
    "name": "Unidade PFE e Filtros DWDM",
    "type": "cinematic_parallax",
    "text": "Painel de alta tens\u00e3o e separa\u00e7\u00e3o \u00f3ptica",
    "duration_seconds": 9.845261,
    "duration_frames": 310,
    "start_frame": 7936,
    "end_frame": 8246
  },
  {
    "scene_id": "SC_030",
    "chapter_id": "CH04",
    "name": "Subida da Serra do Mar",
    "type": "bathymetry_map",
    "text": "Fibras terrestres at\u00e9 S\u00e3o Paulo",
    "duration_seconds": 7.894785,
    "duration_frames": 251,
    "start_frame": 8246,
    "end_frame": 8497
  },
  {
    "scene_id": "SC_031",
    "chapter_id": "CH04",
    "name": "O Gigante IX.br (30 Tbps)",
    "type": "kinetic_counter",
    "text": "Maior troca de tr\u00e1fego do mundo",
    "duration_seconds": 10.07746,
    "duration_frames": 317,
    "start_frame": 8497,
    "end_frame": 8814
  },
  {
    "scene_id": "SC_032",
    "chapter_id": "CH04",
    "name": "A Amea\u00e7a das 50.000 Toneladas",
    "type": "firefly_take",
    "text": "Navio cargueiro jogando \u00e2ncora",
    "duration_seconds": 6.687347,
    "duration_frames": 215,
    "start_frame": 8814,
    "end_frame": 9029
  },
  {
    "scene_id": "SC_033",
    "chapter_id": "CH05",
    "name": "O Impacto da \u00c2ncora",
    "type": "firefly_take",
    "text": "\u00c2ncora colidindo com o cabo submarino",
    "duration_seconds": 12.120816,
    "duration_frames": 378,
    "start_frame": 9029,
    "end_frame": 9407
  },
  {
    "scene_id": "SC_034",
    "chapter_id": "CH05",
    "name": "Ruptura Total de Fibras",
    "type": "cinematic_parallax",
    "text": "Feixes de laser dissipando na \u00e1gua",
    "duration_seconds": 9.798821,
    "duration_frames": 308,
    "start_frame": 9407,
    "end_frame": 9715
  },
  {
    "scene_id": "SC_035",
    "chapter_id": "CH05",
    "name": "Alarme Loss of Signal",
    "type": "bgp_inspector",
    "text": "Alarme vermelho no NOC em milissegundos",
    "duration_seconds": 7.012426,
    "duration_frames": 225,
    "start_frame": 9715,
    "end_frame": 9940
  },
  {
    "scene_id": "SC_036",
    "chapter_id": "CH05",
    "name": "Telemetria Laser OTDR",
    "type": "bgp_inspector",
    "text": "Laser OTDR medindo ponto exato em km",
    "duration_seconds": 10.959819,
    "duration_frames": 343,
    "start_frame": 9940,
    "end_frame": 10283
  },
  {
    "scene_id": "SC_037",
    "chapter_id": "CH05",
    "name": "A Intelig\u00eancia Aut\u00f4noma BGP",
    "type": "bgp_inspector",
    "text": "Roteadores recalculando rotas",
    "duration_seconds": 7.291066,
    "duration_frames": 233,
    "start_frame": 10283,
    "end_frame": 10516
  },
  {
    "scene_id": "SC_038",
    "chapter_id": "CH05",
    "name": "Failover em 14.2 Milissegundos",
    "type": "kinetic_counter",
    "text": "Cron\u00f4metro at\u00f4mico travando em 14.2ms",
    "duration_seconds": 9.659501,
    "duration_frames": 304,
    "start_frame": 10516,
    "end_frame": 10820
  },
  {
    "scene_id": "SC_039",
    "chapter_id": "CH05",
    "name": "Mobiliza\u00e7\u00e3o do Navio de Reparo",
    "type": "firefly_take",
    "text": "Navio de cabos navegando no Atl\u00e2ntico",
    "duration_seconds": 7.941224,
    "duration_frames": 253,
    "start_frame": 10820,
    "end_frame": 11073
  },
  {
    "scene_id": "SC_040",
    "chapter_id": "CH05",
    "name": "Rob\u00f4 ROV a 4.000 Metros",
    "type": "firefly_take",
    "text": "Rob\u00f4 cortando e i\u00e7ando as pontas",
    "duration_seconds": 7.244626,
    "duration_frames": 232,
    "start_frame": 11073,
    "end_frame": 11305
  },
  {
    "scene_id": "SC_041",
    "chapter_id": "CH05",
    "name": "Fus\u00e3o de Precis\u00e3o em Sala Limpa",
    "type": "cinematic_parallax",
    "text": "Arco voltaico fundindo s\u00edlica microsc\u00f3pica",
    "duration_seconds": 10.17034,
    "duration_frames": 320,
    "start_frame": 11305,
    "end_frame": 11625
  },
  {
    "scene_id": "SC_042",
    "chapter_id": "CH05",
    "name": "Junta de Tit\u00e2nio e Retorno",
    "type": "firefly_take",
    "text": "Cabo selado devolvido ao abismo",
    "duration_seconds": 6.222948,
    "duration_frames": 201,
    "start_frame": 11625,
    "end_frame": 11826
  },
  {
    "scene_id": "SC_043",
    "chapter_id": "CH06",
    "name": "A Ilus\u00e3o da Nuvem Et\u00e9rea",
    "type": "bathymetry_map",
    "text": "Terra \u00e0 noite com art\u00e9rias de luz",
    "duration_seconds": 7.430385,
    "duration_frames": 237,
    "start_frame": 11826,
    "end_frame": 12063
  },
  {
    "scene_id": "SC_044",
    "chapter_id": "CH06",
    "name": "A Densidade F\u00edsica do Vidro",
    "type": "cinematic_parallax",
    "text": "Reflexo no vidro de alta pureza",
    "duration_seconds": 9.148662,
    "duration_frames": 289,
    "start_frame": 12063,
    "end_frame": 12352
  },
  {
    "scene_id": "SC_045",
    "chapter_id": "CH06",
    "name": "Conex\u00e3o Humana Global",
    "type": "firefly_take",
    "text": "Metr\u00f3pole conectada sobre leito oce\u00e2nico",
    "duration_seconds": 9.798821,
    "duration_frames": 308,
    "start_frame": 12352,
    "end_frame": 12660
  },
  {
    "scene_id": "SC_046",
    "chapter_id": "CH06",
    "name": "A Fragilidade dos 25mm",
    "type": "cable_cross_section_3d",
    "text": "Corte das 7 camadas em alta tens\u00e3o",
    "duration_seconds": 9.845261,
    "duration_frames": 310,
    "start_frame": 12660,
    "end_frame": 12970
  },
  {
    "scene_id": "SC_047",
    "chapter_id": "CH06",
    "name": "O Outro Lado da M\u00e1quina",
    "type": "cinematic_parallax",
    "text": "Tipografia O Outro Lado Chiaroscuro",
    "duration_seconds": 4.597551,
    "duration_frames": 152,
    "start_frame": 12970,
    "end_frame": 13122
  },
  {
    "scene_id": "SC_048",
    "chapter_id": "CH06",
    "name": "Investigar. Revelar. Compreender.",
    "type": "firefly_take",
    "text": "Selo editorial de engenharia",
    "duration_seconds": 3.900952,
    "duration_frames": 132,
    "start_frame": 13122,
    "end_frame": 13254
  },
  {
    "scene_id": "SC_049",
    "chapter_id": "CH06",
    "name": "Ponte para Pr\u00f3ximas Revela\u00e7\u00f5es",
    "type": "cinematic_parallax",
    "text": "Grade de epis\u00f3dios futuros",
    "duration_seconds": 7.987664,
    "duration_frames": 254,
    "start_frame": 13254,
    "end_frame": 13508
  },
  {
    "scene_id": "SC_050",
    "chapter_id": "CH06",
    "name": "Fade Out Final",
    "type": "firefly_take",
    "text": "Luz de laser desaparecendo no escuro",
    "duration_seconds": 1.486077,
    "duration_frames": 90,
    "start_frame": 13508,
    "end_frame": 13598
  }
];

export const EPISODE_02_TOTAL_FRAMES = 13598;

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execSync } from 'child_process';
import { Logger } from '../event-hub/logger';
import { ProductionSafetyGuard } from '../config/productionSafetyGuard';
import { DocumentaryEditorAgent } from '../hsl/editorial/documentaryEditorAgent';
import { StartFrameGenerator, StartFrameGenerationItem } from '../hsl/startframe/startFrameGenerator';
import { FireflyAdapter } from '../adapters/fireflyAdapter';
import { SoundDesignPlanner } from '../sound-agent/planner/sound-design-planner';
import { SceneMood } from '../sound-agent/types/scene-analysis.types';
import { ThumbnailPlanner } from '../packaging-agent/planner/thumbnail-planner';
import { DescriptionAndSeoPlanner } from '../packaging-agent/planner/description-seo-planner';
import { MasterDocumentaryOrchestrator } from '../orchestrator/masterDocumentaryOrchestrator';

// Definição Completa de 50 Cenas do Documentário Oficial (5m30s a 6m30s)
const EPISODE_02_SCENES = [
  // ─── CAPÍTULO 1: O MITO DO SATÉLITE E O CLIQUE EM 4K (00:00 - 00:50) ───
  {
    sceneId: 'SC_001',
    chapterId: 'CH_001',
    chapterTitle: 'O Mito do Satélite e o Clique em 4K',
    narrativeFunction: 'hook_opening',
    visualSubject: 'Dedo tocando a tela de um smartphone em ambiente escuro chiaroscuro com reflexos ciano',
    voiceoverText: 'Neste exato segundo, você aperta o play em um vídeo em quatro k no seu celular. E você provavelmente acredita que esse sinal veio do céu, transmitido por satélites no espaço.'
  },
  {
    sceneId: 'SC_002',
    chapterId: 'CH_001',
    chapterTitle: 'O Mito do Satélite e o Clique em 4K',
    narrativeFunction: 'reveal_paradox',
    visualSubject: 'Constelação de satélites no espaço sideral com linhas tênues e fading em vermelho',
    voiceoverText: 'Mas isso é uma ilusão. Menos de um por cento do tráfego global da internet passa por satélites. Eles são lentos demais e não aguentam a demanda de bilhões de pessoas simultâneas.'
  },
  {
    sceneId: 'SC_003',
    chapterId: 'CH_001',
    chapterTitle: 'O Mito do Satélite e o Clique em 4K',
    narrativeFunction: 'introduce_mechanism',
    visualSubject: 'Câmera mergulhando em águas oceânicas escuras com feixe de laser laranja no leito marinho',
    voiceoverText: 'A realidade física é muito mais impressionante e assustadora: noventa e nove por cento de todos os dados do planeta viajam no fundo do mar.'
  },
  {
    sceneId: 'SC_004',
    chapterId: 'CH_001',
    chapterTitle: 'O Mito do Satélite e o Clique em 4K',
    narrativeFunction: 'scale_contrast',
    visualSubject: 'Tubo cilíndrico de 25 milímetros repousando sobre areia e rochas abissais escuras',
    voiceoverText: 'Toda a economia digital, as transações bancárias e as redes sociais do Brasil dependem de tubos de apenas vinte e cinco milímetros deitados no abismo do Oceano Atlântico.'
  },
  {
    sceneId: 'SC_005',
    chapterId: 'CH_001',
    chapterTitle: 'O Mito do Satélite e o Clique em 4K',
    narrativeFunction: 'deep_tech_context',
    visualSubject: 'Mão com luva industrial segurando um pedaço de cabo submarino mostrando sua espessura fina',
    voiceoverText: 'A espessura de uma mangueira de jardim comum. É essa fina linha de vidro e aço que separa o Brasil de um apagão de comunicação instantâneo.'
  },
  {
    sceneId: 'SC_006',
    chapterId: 'CH_001',
    chapterTitle: 'O Mito do Satélite e o Clique em 4K',
    narrativeFunction: 'visual_investigation',
    visualSubject: 'Costa brasileira à noite com linhas de luz submarinas convergindo para o litoral de São Paulo e Ceará',
    voiceoverText: 'Bem-vindo ao Outro Lado da Internet. Hoje vamos dissecar a monumental infraestrutura física oculta que conecta o Brasil ao resto do mundo.'
  },
  {
    sceneId: 'SC_007',
    chapterId: 'CH_001',
    chapterTitle: 'O Mito do Satélite e o Clique em 4K',
    narrativeFunction: 'physics_premise',
    visualSubject: 'Pulso de fótons laser viajando dentro de um núcleo de sílica de 9 micrômetros',
    voiceoverText: 'Como um feixe de luz viaja seis mil quilômetros sob pressão esmagadora sem se perder no caminho?'
  },
  {
    sceneId: 'SC_008',
    chapterId: 'CH_001',
    chapterTitle: 'O Mito do Satélite e o Clique em 4K',
    narrativeFunction: 'chapter_handoff',
    visualSubject: 'Bancada técnica de laboratório com microscópio eletrônico focado no corte do cabo',
    voiceoverText: 'Para entender esse milagre da engenharia, precisamos primeiro abrir as sete camadas de blindagem desse cabo.'
  },

  // ─── CAPÍTULO 2: A ANATOMIA DOS 25MM // RAIO-X 3D (00:50 - 01:45) ───
  {
    sceneId: 'SC_009',
    chapterId: 'CH_002',
    chapterTitle: 'A Anatomia dos 25mm // Raio-X 3D',
    narrativeFunction: 'technical_xray_intro',
    visualSubject: 'Raio-X 3D volumétrico da seção transversal do cabo com camadas se expandindo',
    voiceoverText: 'Olhando por fora, parece apenas uma borracha preta. Mas por dentro, o cabo submarino é uma obra de arte da ciência dos materiais.'
  },
  {
    sceneId: 'SC_010',
    chapterId: 'CH_002',
    chapterTitle: 'A Anatomia dos 25mm // Raio-X 3D',
    narrativeFunction: 'layer_1_polyethylene',
    visualSubject: 'Camada externa de polietileno de alta densidade brilhando sob luz rasante',
    voiceoverText: 'A camada externa é feita de polietileno de alta densidade, resistente à água salgada e à corrosão química por mais de vinte e cinco anos.'
  },
  {
    sceneId: 'SC_011',
    chapterId: 'CH_002',
    chapterTitle: 'A Anatomia dos 25mm // Raio-X 3D',
    narrativeFunction: 'layer_2_steel_armor',
    visualSubject: 'Fios trançados de aço de alta resistência mecânica formando uma armadura helicoidal',
    voiceoverText: 'Logo abaixo, fios de aço trançados helicoidalmente garantem que o cabo resista a tensões mecânicas de dezenas de toneladas durante o lançamento pelo navio.'
  },
  {
    sceneId: 'SC_012',
    chapterId: 'CH_002',
    chapterTitle: 'A Anatomia dos 25mm // Raio-X 3D',
    narrativeFunction: 'layer_3_copper_conductor',
    visualSubject: 'Tubo de cobre contínuo brilhante conduzindo corrente elétrica de alta voltagem',
    voiceoverText: 'Em seguida, um tubo de cobre contínuo que não transporta dados, mas conduz dez mil volts de corrente contínua para alimentar os repetidores no fundo do mar.'
  },
  {
    sceneId: 'SC_013',
    chapterId: 'CH_002',
    chapterTitle: 'A Anatomia dos 25mm // Raio-X 3D',
    narrativeFunction: 'layer_4_polycarbonate_jelly',
    visualSubject: 'Câmara estanque de policarbonato preenchida com gel de silicone hidrofóbico',
    voiceoverText: 'No centro, uma barreira de policarbonato e gel de petróleo hidrofóbico que impede que qualquer gota de água atinja o núcleo caso a carcaça seja perfurada.'
  },
  {
    sceneId: 'SC_014',
    chapterId: 'CH_002',
    chapterTitle: 'A Anatomia dos 25mm // Raio-X 3D',
    narrativeFunction: 'layer_5_optical_core',
    visualSubject: 'Doze pares de filamentos de fibra óptica de vidro puro emitindo luz laser colorida',
    voiceoverText: 'E no coração de tudo, onde a mágica acontece: doze pares de fibras ópticas de sílica ultra-pura, cada uma com a espessura de um fio de cabelo humano.'
  },
  {
    sceneId: 'SC_015',
    chapterId: 'CH_002',
    chapterTitle: 'A Anatomia dos 25mm // Raio-X 3D',
    narrativeFunction: 'quantum_capacity',
    visualSubject: 'Espectro de comprimentos de onda DWDM dividindo a luz em dezenas de canais paralelos',
    voiceoverText: 'Através da tecnologia de multiplexação por comprimento de onda, esses doze pares transmitem duzentos e cinquenta Terabits por segundo. Isso é equivalente a transmitir milhões de vídeos em quatro k simultaneamente.'
  },
  {
    sceneId: 'SC_016',
    chapterId: 'CH_002',
    chapterTitle: 'A Anatomia dos 25mm // Raio-X 3D',
    narrativeFunction: 'engineering_paradox',
    visualSubject: 'Visão macroscópica da ponta da fibra de vidro brilhando no escuro absoluto',
    voiceoverText: 'Mas como fazer essa luz percorrer milhares de quilômetros na escuridão sem desaparecer?'
  },

  // ─── CAPÍTULO 3: O ABISMO A 4.000M E OS REPETIDORES DE 10.000V (01:45 - 02:40) ───
  {
    sceneId: 'SC_017',
    chapterId: 'CH_003',
    chapterTitle: 'O Abismo a 4.000m e os Repetidores de 10.000V',
    narrativeFunction: 'ocean_depth_context',
    visualSubject: 'Profundímetro digital descendo de zero a quatro mil metros no Atlântico escuro',
    voiceoverText: 'A quatro mil metros de profundidade, a pressão da água é de quatrocentas atmosferas. Isso é equivalente ao peso de um elefante sobre cada centímetro quadrado do cabo.'
  },
  {
    sceneId: 'SC_018',
    chapterId: 'CH_003',
    chapterTitle: 'O Abismo a 4.000m e os Repetidores de 10.000V',
    narrativeFunction: 'optical_attenuation',
    visualSubject: 'Feixe de laser diminuindo de intensidade gradualmente ao longo de uma haste de vidro',
    voiceoverText: 'Mesmo no vidro mais puro do mundo, os fótons de luz sofrem atenuação física natural a cada quilômetro percorrido.'
  },
  {
    sceneId: 'SC_019',
    chapterId: 'CH_003',
    chapterTitle: 'O Abismo a 4.000m e os Repetidores de 10.000V',
    narrativeFunction: 'introduce_edfa',
    visualSubject: 'Cilindro de titânio submarino hermético conectado ao cabo repousando no leito marinho',
    voiceoverText: 'A cada oitenta quilômetros no leito marinho, existe um repetidor óptico EDFA: um cilindro blindado de titânio que regenera o sinal sem converter a luz em eletricidade.'
  },
  {
    sceneId: 'SC_020',
    chapterId: 'CH_003',
    chapterTitle: 'O Abismo a 4.000m e os Repetidores de 10.000V',
    narrativeFunction: 'erbium_physics',
    visualSubject: 'Átomos de Érbio em suspensão sendo excitados por um laser de bombeamento verde e laranja',
    voiceoverText: 'Dentro do repetidor, a fibra óptica é dopada com um elemento químico raro chamado Érbio. Um laser de bombeamento excita esses átomos de Érbio.'
  },
  {
    sceneId: 'SC_021',
    chapterId: 'CH_003',
    chapterTitle: 'O Abismo a 4.000m e os Repetidores de 10.000V',
    narrativeFunction: 'stimulated_emission',
    visualSubject: 'Fótons fracos entrando e saindo multiplicados em avalanche de luz coerente',
    voiceoverText: 'Quando o sinal fraco vindo do Brasil passa por essa fibra dopada, ele estimula a emissão de novos fótons idênticos, amplificando a luz instantaneamente.'
  },
  {
    sceneId: 'SC_022',
    chapterId: 'CH_003',
    chapterTitle: 'O Abismo a 4.000m e os Repetidores de 10.000V',
    narrativeFunction: 'power_feed_system',
    visualSubject: 'Estação de energia em terra com transformadores gigantescos gerando dez mil volts contínuos',
    voiceoverText: 'Para alimentar dezenas desses repetidores em série no meio do oceano, as estações terrestres injetam até dez mil volts de corrente contínua através do tubo de cobre do cabo.'
  },
  {
    sceneId: 'SC_023',
    chapterId: 'CH_003',
    chapterTitle: 'O Abismo a 4.000m e os Repetidores de 10.000V',
    narrativeFunction: 'earth_return_grounding',
    visualSubject: 'Anodo gigante de aterramento no fundo do oceano fechando o circuito elétrico global',
    voiceoverText: 'E o circuito elétrico de retorno é a própria água salgada do mar e a crosta terrestre, fechando um loop elétrico colossal de milhares de quilômetros.'
  },
  {
    sceneId: 'SC_024',
    chapterId: 'CH_003',
    chapterTitle: 'O Abismo a 4.000m e os Repetidores de 10.000V',
    narrativeFunction: 'handoff_landing_station',
    visualSubject: 'Cabo emergindo do mar e entrando em uma galeria subterrânea na praia',
    voiceoverText: 'Mas de onde essa energia sai e para onde essa torrente de dados vai quando chega à praia?'
  },

  // ─── CAPÍTULO 4: AS ESTAÇÕES DE ATERRISAGEM // FORTALEZA E PRAIA GRANDE (02:40 - 03:35) ───
  {
    sceneId: 'SC_025',
    chapterId: 'CH_004',
    chapterTitle: 'As Estações de Aterrisagem: Fortaleza e Praia Grande',
    narrativeFunction: 'map_overview_brazil',
    visualSubject: 'Mapa aerofotogramétrico do Brasil com rotas submarinas ancorando em Fortaleza e Praia Grande',
    voiceoverText: 'No mapa da internet mundial, o Brasil possui dois corações vitais: a Praia do Futuro em Fortaleza e a cidade de Praia Grande no litoral paulista.'
  },
  {
    sceneId: 'SC_026',
    chapterId: 'CH_004',
    chapterTitle: 'As Estações de Aterrisagem: Fortaleza e Praia Grande',
    narrativeFunction: 'fortaleza_hub',
    visualSubject: 'Vista aérea cinematográfica de Fortaleza com dezesseis cabos submarinos convergindo para o litoral',
    voiceoverText: 'Fortaleza é o segundo maior hub de cabos submarinos do planeta Terra. Dezesseis sistemas internacionais de fibra óptica aterrissam diretamente naquela praia.'
  },
  {
    sceneId: 'SC_027',
    chapterId: 'CH_004',
    chapterTitle: 'As Estações de Aterrisagem: Fortaleza e Praia Grande',
    narrativeFunction: 'beach_manhole_pipeline',
    visualSubject: 'Tubo de aço PEAD enterrado a três metros de profundidade sob a areia da praia',
    voiceoverText: 'O cabo sai do mar por um duto subterrâneo de perfuração direcional horizontal, passando por baixo das ondas e dos banhistas sem ser notado.'
  },
  {
    sceneId: 'SC_028',
    chapterId: 'CH_004',
    chapterTitle: 'As Estações de Aterrisagem: Fortaleza e Praia Grande',
    narrativeFunction: 'cable_landing_station_interior',
    visualSubject: 'Interior de bunker de concreto armado com portas blindadas e racks de telecomunicações',
    voiceoverText: 'Ele entra na Cable Landing Station: um bunker de concreto armado, protegido contra inundações, tempestades e ataques físicos, com segurança biométrica militar.'
  },
  {
    sceneId: 'SC_029',
    chapterId: 'CH_004',
    chapterTitle: 'As Estações de Aterrisagem: Fortaleza e Praia Grande',
    narrativeFunction: 'pfe_power_equipment',
    visualSubject: 'Equipamento de alimentação PFE de alta tensão com indicadores de voltagem digital',
    voiceoverText: 'Lá dentro fica a unidade de alimentação de energia que bombeia a alta tensão para o oceano e os equipamentos de terminação óptica que separam os comprimentos de onda.'
  },
  {
    sceneId: 'SC_030',
    chapterId: 'CH_004',
    chapterTitle: 'As Estações de Aterrisagem: Fortaleza e Praia Grande',
    narrativeFunction: 'terrestrial_backbone_route',
    visualSubject: 'Rede de fibra terrestre subterrânea subindo a Serra do Mar ao longo de rodovias',
    voiceoverText: 'De Praia Grande e Fortaleza, cabos terrestres blindados sobem a serra até os gigantescos datacenters de Barueri e São Paulo.'
  },
  {
    sceneId: 'SC_031',
    chapterId: 'CH_004',
    chapterTitle: 'As Estações de Aterrisagem: Fortaleza e Praia Grande',
    narrativeFunction: 'ix_br_interconnection',
    visualSubject: 'Roteadores centrais do IX.br piscando intensamente com tráfego de trinta Terabits',
    voiceoverText: 'Onde o tráfego é distribuído pelo IX ponto br, o maior ponto de troca de tráfego de internet do mundo, com picos superiores a trinta Terabits por segundo.'
  },
  {
    sceneId: 'SC_032',
    chapterId: 'CH_004',
    chapterTitle: 'As Estações de Aterrisagem: Fortaleza e Praia Grande',
    narrativeFunction: 'vulnerability_transition',
    visualSubject: 'Navio cargueiro gigante ancorando perto da costa com âncora descendo para o fundo',
    voiceoverText: 'Tudo parece sólido e perfeito. Até que um navio de cinquenta mil toneladas joga sua âncora no lugar errado.'
  },

  // ─── CAPÍTULO 5: ÂNCORAS, TUBARÕES E FAILOVER BGP EM 15MS (03:35 - 04:45) ───
  {
    sceneId: 'SC_033',
    chapterId: 'CH_005',
    chapterTitle: 'Âncoras, Tubarões e o Redirecionamento BGP em 15ms',
    narrativeFunction: 'anchor_threat_reality',
    visualSubject: 'Âncora de aço maciço arrastando no fundo do oceano e atingindo o cabo submarino',
    voiceoverText: 'Apesar de histórias populares sobre mordidas de tubarão, mais de setenta por cento de todos os cortes de cabos submarinos são causados por âncoras de navios cargueiros e redes de pesca de arrasto.'
  },
  {
    sceneId: 'SC_034',
    chapterId: 'CH_005',
    chapterTitle: 'Âncoras, Tubarões e o Redirecionamento BGP em 15ms',
    narrativeFunction: 'severed_cable_physics',
    visualSubject: 'Cabo rompido no leito marinho com feixes de laser se dissipando na água escura',
    voiceoverText: 'Quando uma âncora de cinquenta toneladas atinge o cabo a toda velocidade, a blindagem de aço é esmagada e os núcleos de fibra óptica se rompem instantaneamente.'
  },
  {
    sceneId: 'SC_035',
    chapterId: 'CH_005',
    chapterTitle: 'Âncoras, Tubarões e o Redirecionamento BGP em 15ms',
    narrativeFunction: 'loss_of_signal_alarm',
    visualSubject: 'Centro de Operações de Rede com telas vermelhas indicando perda de sinal Loss of Signal',
    voiceoverText: 'No mesmo milissegundo, a estação em terra detecta o alarme de perda total de sinal óptico e o curto-circuito de alta tensão.'
  },
  {
    sceneId: 'SC_036',
    chapterId: 'CH_005',
    chapterTitle: 'Âncoras, Tubarões e o Redirecionamento BGP em 15ms',
    narrativeFunction: 'otdr_laser_ranging',
    visualSubject: 'Gráfico de pulso OTDR traçando a distância exata da ruptura em quilômetros',
    voiceoverText: 'Um instrumento chamado OTDR dispara pulsos de laser de medição e calcula, com precisão de poucos metros, exatamente a quantos quilômetros da praia o cabo foi cortado.'
  },
  {
    sceneId: 'SC_037',
    chapterId: 'CH_005',
    chapterTitle: 'Âncoras, Tubarões e o Redirecionamento BGP em 15ms',
    narrativeFunction: 'bgp_autonomous_routing',
    visualSubject: 'Grafo de roteadores BGP recalculando rotas com linhas ciano desviando de um ponto vermelho',
    voiceoverText: 'Enquanto isso, a internet não pode parar. O protocolo BGP entra em ação de forma autônoma nos roteadores de borda.'
  },
  {
    sceneId: 'SC_038',
    chapterId: 'CH_005',
    chapterTitle: 'Âncoras, Tubarões e o Redirecionamento BGP em 15ms',
    narrativeFunction: 'sub_15ms_failover',
    visualSubject: 'Cronômetro atômico travando em quatorze vírgula dois milissegundos',
    voiceoverText: 'Em apenas quatorze vírgula dois milissegundos, todo o tráfego que viajava pelo cabo rompido é redirecionado para rotas alternativas, como o cabo Monet ou EllaLink.'
  },
  {
    sceneId: 'SC_039',
    chapterId: 'CH_005',
    chapterTitle: 'Âncoras, Tubarões e o Redirecionamento BGP em 15ms',
    narrativeFunction: 'repair_ship_mobilization',
    visualSubject: 'Navio especializado de reparo de cabos de telecomunicações navegando em mar revolto',
    voiceoverText: 'Para consertar o dano, um navio especializado de reparo é mobilizado. Ele pode levar semanas para alcançar o local exato no oceano.'
  },
  {
    sceneId: 'SC_040',
    chapterId: 'CH_005',
    chapterTitle: 'Âncoras, Tubarões e o Redirecionamento BGP em 15ms',
    narrativeFunction: 'rov_underwater_robot',
    visualSubject: 'Robô submarino ROV com garras mecânicas e holofotes cortando e resgatando o cabo no abismo',
    voiceoverText: 'Um robô submarino desce a quatro mil metros, corta a seção danificada e traz as duas pontas do cabo para o convés do navio.'
  },
  {
    sceneId: 'SC_041',
    chapterId: 'CH_005',
    chapterTitle: 'Âncoras, Tubarões e o Redirecionamento BGP em 15ms',
    narrativeFunction: 'fusion_splicing_cleanroom',
    visualSubject: 'Técnico em sala limpa microscópica fundindo fibras de vidro com arco voltaico de precisão',
    voiceoverText: 'Em uma sala limpa climatizada dentro do navio, engenheiros fundem as fibras de vidro microscópicas uma a uma com arcos voltaicos de altíssima precisão.'
  },
  {
    sceneId: 'SC_042',
    chapterId: 'CH_005',
    chapterTitle: 'Âncoras, Tubarões e o Redirecionamento BGP em 15ms',
    narrativeFunction: 'return_to_seabed',
    visualSubject: 'Cabo reparado e selado com junta de titânio sendo devolvido ao fundo do oceano',
    voiceoverText: 'O cabo é selado com uma junta de titânio e devolvido ao fundo do mar para continuar operando por mais décadas.'
  },

  // ─── CAPÍTULO 6: CONCLUSÃO: A FRAGILIDADE DOS 25 MILÍMETROS (04:45 - 05:40) ───
  {
    sceneId: 'SC_043',
    chapterId: 'CH_006',
    chapterTitle: 'Conclusão: A Fragilidade dos 25 Milímetros',
    narrativeFunction: 'philosophical_recap',
    visualSubject: 'Visão orbital da Terra à noite com todas as rotas submarinas iluminadas como artérias de luz',
    voiceoverText: 'Nós nos acostumamos a tratar a tecnologia digital como algo etéreo, sem peso, que simplesmente flutua no ar.'
  },
  {
    sceneId: 'SC_044',
    chapterId: 'CH_006',
    chapterTitle: 'Conclusão: A Fragilidade dos 25 Milímetros',
    narrativeFunction: 'material_reality',
    visualSubject: 'Macro fotografia do vidro puro da fibra óptica refletindo luz de laser âmbar',
    voiceoverText: 'Mas a verdade é que toda a civilização da informação é profundamente física, pesada e dependente de infraestruturas industriais monumentais.'
  },
  {
    sceneId: 'SC_045',
    chapterId: 'CH_006',
    chapterTitle: 'Conclusão: A Fragilidade dos 25 Milímetros',
    narrativeFunction: 'human_connection',
    visualSubject: 'Pessoas em uma metrópole conectadas a seus celulares enquanto feixes de luz viajam sob seus pés',
    voiceoverText: 'Cada mensagem que você envia para alguém do outro lado do mundo, cada vídeo que assiste e cada pagamento que realiza cruza a escuridão do leito do oceano.'
  },
  {
    sceneId: 'SC_046',
    chapterId: 'CH_006',
    chapterTitle: 'Conclusão: A Fragilidade dos 25 Milímetros',
    narrativeFunction: 'deep_tech_summary',
    visualSubject: 'Corte transversal do cabo com todas as camadas rotuladas em ciano e laranja',
    voiceoverText: 'Sustentado por vinte e cinco milímetros de polietileno, aço, cobre energizado a dez mil volts e filamentos de vidro mais finos que um fio de cabelo.'
  },
  {
    sceneId: 'SC_047',
    chapterId: 'CH_006',
    chapterTitle: 'Conclusão: A Fragilidade dos 25 Milímetros',
    narrativeFunction: 'brand_authority',
    visualSubject: 'Tipografia cinemática O OUTRO LADO com iluminação Chiaroscuro 35mm',
    voiceoverText: 'Essa é a máquina invisível que nunca dorme e que mantém o Brasil conectado ao futuro.'
  },
  {
    sceneId: 'SC_048',
    chapterId: 'CH_006',
    chapterTitle: 'Conclusão: A Fragilidade dos 25 Milímetros',
    narrativeFunction: 'closing_call_to_action',
    visualSubject: 'Logotipo oficial de O Outro Lado sobre fundo preto carbono com selo editorial',
    voiceoverText: 'Isso é O Outro Lado. Investigar. Revelar. Compreender.'
  },
  {
    sceneId: 'SC_049',
    chapterId: 'CH_006',
    chapterTitle: 'Conclusão: A Fragilidade dos 25 Milímetros',
    narrativeFunction: 'playlist_bridge',
    visualSubject: 'Grid de episódios futuros de infraestruturas invisíveis no Brasil',
    voiceoverText: 'Se você quer continuar descobrindo o que acontece depois que você clica, compra ou aperta, inscreva-se no canal e ative as notificações.'
  },
  {
    sceneId: 'SC_050',
    chapterId: 'CH_006',
    chapterTitle: 'Conclusão: A Fragilidade dos 25 Milímetros',
    narrativeFunction: 'final_fade_out',
    visualSubject: 'Ponto de luz de fibra óptica diminuindo até o preto absoluto',
    voiceoverText: 'Até a próxima investigação.'
  }
];

async function main() {
  Logger.info('PipelineRootFix', '🚀 INICIANDO GERAÇÃO MASTER DO EPISÓDIO 02 (CABOS SUBMARINOS) COM O MOTOR CORRIGIDO');

  const orchestrator = new MasterDocumentaryOrchestrator();

  // Agrupamento dos 6 capítulos
  const chaptersMap = new Map<string, typeof EPISODE_02_SCENES>();
  for (const sc of EPISODE_02_SCENES) {
    if (!chaptersMap.has(sc.chapterId)) {
      chaptersMap.set(sc.chapterId, []);
    }
    chaptersMap.get(sc.chapterId)!.push(sc);
  }

  const chapters = Array.from(chaptersMap.entries()).map(([chId, scenes]) => ({
    chapterId: chId,
    chapterTitle: scenes[0].chapterTitle,
    focus: scenes[0].narrativeFunction,
    scenes
  }));

  const result = await orchestrator.runFullEpisode({
    episodeId: 'OOL-EP02-CABOS',
    title: 'Os Cabos Submarinos: A Máquina Invisível que Conecta o Brasil à Internet',
    theme: 'Infraestrutura Submarina de Internet e Física Óptica',
    centralQuestion: 'O que acontece no fundo do mar quando você dá play em um vídeo em 4K no celular?',
    primaryConsequence: 'Risco de Ruptura por Âncoras e Redirecionamento BGP Autônomo em 15 Milissegundos',
    objectOrFlow: 'Feixe de fótons laser viajando por cabo submarino de 25mm a 4.000m de profundidade',
    systemBeingAnalyzed: 'Sistema global de cabos submarinos, repetidores EDFA e estações de aterrisagem no Brasil',
    heroVisual: 'Raio-X 3D das 7 camadas de blindagem mecânica do cabo submarino de 25mm e mapa batimétrico atlântico',
    targetDurationMinutes: 5.5,
    chapters
  });

  Logger.info('PipelineRootFix', `🎉 PRODUÇÃO MASTER CONCLUÍDA COM SUCESSO!`);
  Logger.info('PipelineRootFix', `Episódio: ${result.episodeId}`);
  Logger.info('PipelineRootFix', `Total de Cenas: ${result.totalScenes}`);
  Logger.info('PipelineRootFix', `Duração Total: ${result.totalDurationSeconds}s (~${(result.totalDurationSeconds / 60).toFixed(1)} min)`);
  Logger.info('PipelineRootFix', `Resumo de Publicação: ${result.publicationSummaryPath}`);
}

main().catch(err => {
  console.error('❌ FALHA NO MOTOR DE PRODUÇÃO:', err);
  process.exit(1);
});

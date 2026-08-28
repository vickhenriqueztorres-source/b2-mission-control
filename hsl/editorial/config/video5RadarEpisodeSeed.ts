import { HslEpisodeSeed, HslEditorialSceneSeed } from '../types/editorial';

export interface RadarChapterDef {
  chapter_id: string;
  title: string;
  focus: string;
  scenes: Array<{
    scene_id: string;
    name: string;
    narrative_function: string;
    visual_subject: string;
    voiceover_text: string;
    take_type?: 'KEYFRAME_DOSSIER' | 'CINEMATIC_TAKE';
    integrated_text?: string;
  }>;
}

export const RADAR_ASFALTO_CHAPTERS: RadarChapterDef[] = [
  {
    chapter_id: 'CH01',
    title: 'O Clarão na Escuridão & O Mito da Câmera',
    focus: 'O susto do motorista ao ver a lombada ou radar, e a desconstrução da crença popular de que a câmera calcula a velocidade.',
    scenes: [
      {
        scene_id: 'OOL_001',
        name: 'O Gatilho da Frenagem',
        narrative_function: 'hook',
        visual_subject: 'Interior de carro em rodovia escura à noite, velocímetro iluminado em ciano marcando 118 km/h sob chuva fina',
        voiceover_text: 'Você está dirigindo à noite em uma rodovia deserta. De repente, uma placa surge na escuridão e você pisa no freio por puro reflexo.'
      },
      {
        scene_id: 'OOL_002',
        name: 'O Clarão Vermelho',
        narrative_function: 'tension',
        visual_subject: 'Pórtico de radar industrial na névoa disparando um pulso infravermelho vermelho escuro no asfalto molhado',
        voiceover_text: 'Muitos motoristas já sentiram aquele frio na espinha ao ver um clarão vermelho no retrovisor, acreditando que uma câmera no poste calculou sua velocidade.'
      },
      {
        scene_id: 'OOL_003',
        name: 'O Mito do Olho Eletrônico',
        narrative_function: 'reframe',
        visual_subject: 'Close macro 35mm em lente de câmera industrial com anel de leds infravermelhos e telemetria laser',
        voiceover_text: 'Mas a maioria das pessoas não sabe que a câmera montada no poste é cega para a sua velocidade. Ela não mede absolutamente nada.'
      },
      {
        scene_id: 'OOL_004',
        name: 'O Registro Instantâneo',
        narrative_function: 'hardware_reveal',
        visual_subject: 'Display industrial em chassi metálico escuro com alerta em vermelho e texto embutido',
        voiceover_text: 'A câmera é apenas a testemunha final de um julgamento físico que durou menos de um décimo de segundo.',
        take_type: 'KEYFRAME_DOSSIER',
        integrated_text: 'FLASH // DISPARO A 1/10.000s'
      },
      {
        scene_id: 'OOL_005',
        name: 'A Revelação da Pista',
        narrative_function: 'revelation',
        visual_subject: 'Corte transversal 35mm no asfalto da rodovia revelando ranhuras preenchidas com resina preta e cabos de cobre',
        voiceover_text: 'O verdadeiro radar não está em cima do poste. Ele está enterrado sob as suas rodas, esculpido dentro do próprio asfalto.'
      },
      {
        scene_id: 'OOL_006',
        name: 'O Corte de Diamante',
        narrative_function: 'engineering_intro',
        visual_subject: 'Máquina serra de disco de diamante cortando ranhuras retangulares perfeitas no asfalto sob vapor de água',
        voiceover_text: 'Para transformar a rodovia em um sensor gigante, equipes de engenharia usam serras com ponta de diamante para rasgar o pavimento.'
      },
      {
        scene_id: 'OOL_007',
        name: 'O Nascimento do Sensor',
        narrative_function: 'transition_to_map',
        visual_subject: 'Bobina de cabo de cobre de alta pureza sendo inserida em sulco de 5 centímetros de profundidade na pista',
        voiceover_text: 'Dentro dessas fendas, operários instalam uma armadilha eletromagnética invisível que nunca dorme.'
      }
    ]
  },
  {
    chapter_id: 'CH02',
    title: 'O Mapa do Asfalto: Laços Indutivos & Cristais de Quartzo',
    focus: 'A anatomia dos 3 sensores subterrâneos, o campo magnético ativo e a física dos laços indutivos.',
    scenes: [
      {
        scene_id: 'OOL_008',
        name: 'A Geometria dos Três Laços',
        narrative_function: 'macro_map',
        visual_subject: 'Vista aérea cinematográfica 35mm de rodovia à noite com linhas esquemáticas ciano mostrando os três laços na faixa',
        voiceover_text: 'Em cada faixa monitorada, a engenharia desenha um padrão geométrico rigoroso: três laços retangulares perfeitamente alinhados.'
      },
      {
        scene_id: 'OOL_009',
        name: 'A Distância Inegociável',
        narrative_function: 'quantification',
        visual_subject: 'Painel de blueprint de engenharia rodoviária com cotas em laser ciano e medição métrica embutida',
        voiceover_text: 'A distância entre a borda do primeiro laço e a borda do segundo é fixada em exatamente três metros, com tolerância milimétrica.',
        take_type: 'KEYFRAME_DOSSIER',
        integrated_text: '3 METROS // DISTÂNCIA PADRÃO'
      },
      {
        scene_id: 'OOL_010',
        name: 'O Laço Indutivo por Dentro',
        narrative_function: 'hardware_deep_dive',
        visual_subject: 'Raio-x 35mm do interior do asfalto com bobina de cobre emitindo campo magnético oscilante em laranja vapor de sódio',
        voiceover_text: 'Cada laço é composto por voltas contínuas de fio de cobre, formando uma bobina indutiva conectada a um circuito ressonante.'
      },
      {
        scene_id: 'OOL_011',
        name: 'A Frequência de Silêncio',
        narrative_function: 'physics_explanation',
        visual_subject: 'Gabinete eletrônico de beira de pista com osciloscópio mostrando onda senoidal estável de 20 kHz em laser ciano',
        voiceover_text: 'Uma corrente alternada de alta frequência percorre o laço constantemente, criando um campo eletromagnético invisível acima do asfalto.'
      },
      {
        scene_id: 'OOL_012',
        name: 'O Equilíbrio Invisível',
        narrative_function: 'sensor_baseline',
        visual_subject: 'Pista vazia na penumbra com o campo magnético pulsando em baixa intensidade aguardando a aproximação de veículos',
        voiceover_text: 'Enquanto nenhum veículo passa, a indutância do circuito permanece estável. O sistema está em repouso calibrado.'
      },
      {
        scene_id: 'OOL_013',
        name: 'O Sensor Piezoelétrico',
        narrative_function: 'piezo_reveal',
        visual_subject: 'Sensor em barra de alumínio escuro com cristais de quartzo embutidos emitindo glow de pressão quando comprimidos',
        voiceover_text: 'Em radares de pesagem e classificação, uma lâmina de quartzo piezoelétrico é adicionada para medir a deformação mecânica do peso dos eixos.'
      },
      {
        scene_id: 'OOL_014',
        name: 'O Gabinete Blindado',
        narrative_function: 'processor_housing',
        visual_subject: 'Armário blindado de aço galvanizado à beira da rodovia, trancado e operando com refrigeração passiva sob a chuva',
        voiceover_text: 'Toda essa malha subterrânea converge para um gabinete blindado à beira da estrada, onde um computador industrial de tempo real processa os sinais.'
      }
    ]
  },
  {
    chapter_id: 'CH03',
    title: 'A Passagem do Veículo: O Cálculo em Microssegundos',
    focus: 'A física da perturbação do campo magnético, o disparo dos relógios internos e a fórmula matemática da velocidade.',
    scenes: [
      {
        scene_id: 'OOL_015',
        name: 'A Chegada da Massa Metálica',
        narrative_function: 'action_trigger',
        visual_subject: 'Pneu dianteiro de veículo esportivo atingindo a linha do primeiro laço indutivo com linhas de fluxo magnético distorcendo',
        voiceover_text: 'No instante em que a carcaça de aço do seu carro entra sobre o primeiro laço, a massa metálica perturba as linhas de fluxo magnético.',
        take_type: 'KEYFRAME_DOSSIER',
        integrated_text: 'ΔT = 60.000 µs'
      },
      {
        scene_id: 'OOL_016',
        name: 'A Corrente de Foucault',
        narrative_function: 'physics_mechanism',
        visual_subject: 'Chassi inferior do automóvel com correntes parasitas de Foucault brilhando em neon ciano sobre o metal',
        voiceover_text: 'O metal do chassi induz correntes parasitas que alteram instantaneamente a indutância total da bobina enterrada.'
      },
      {
        scene_id: 'OOL_017',
        name: 'O Disparo do Cronômetro',
        narrative_function: 'clock_trigger',
        visual_subject: 'Processador de sinal digital (DSP) em placa de circuito industrial disparando relógio de quartzo em microssegundos',
        voiceover_text: 'A queda de indutância gera um pulso elétrico agudo. O microcontrolador registra o evento no instante T-zero e inicia o cronômetro.'
      },
      {
        scene_id: 'OOL_018',
        name: 'A Travessia dos Três Metros',
        narrative_function: 'motion_traverse',
        visual_subject: 'Câmera em alta velocidade ao nível do solo acompanhando o pneu cruzando a distância de 3 metros entre os sensores',
        voiceover_text: 'O carro continua se deslocando pela pista, cobrindo o intervalo fixo de três metros até o segundo laço indutivo.'
      },
      {
        scene_id: 'OOL_019',
        name: 'O Segundo Impacto Magnético',
        narrative_function: 'second_trigger',
        visual_subject: 'Segundo laço indutivo no asfalto acendendo em pulso laranja no momento exato em que o pneu dianteiro o cruza',
        voiceover_text: 'Ao atingir o segundo laço, uma nova perturbação é detectada e o cronômetro é travado no instante T-um.'
      },
      {
        scene_id: 'OOL_020',
        name: 'A Diferença de Tempo',
        narrative_function: 'time_delta',
        visual_subject: 'Gráfico de onda digital na tela do computador de campo mostrando o delta de tempo com precisão de 0,0001 segundo',
        voiceover_text: 'A máquina agora possui dois dados irrefutáveis: a distância física conhecida e o tempo exato decorrido entre os dois pulsos.'
      },
      {
        scene_id: 'OOL_021',
        name: 'A Matemática Pura',
        narrative_function: 'formula_deduction',
        visual_subject: 'Close-up na tela com o cálculo da velocidade se formando em tipografia laser nítida com fundo de código binário',
        voiceover_text: 'Em menos de um milissegundo, a equação fundamental da física é executada: velocidade é igual à distância dividida pelo tempo.'
      },
      {
        scene_id: 'OOL_022',
        name: 'A Prova da Velocidade',
        narrative_function: 'speed_verdict',
        visual_subject: 'Display com a fórmula clássica da cinemática em destaque laranja sobre diagrama vetorial de aceleração',
        voiceover_text: 'Se o veículo levou noventa milissegundos para cruzar três metros, sua velocidade calculada foi de cento e vinte quilômetros por hora.',
        take_type: 'KEYFRAME_DOSSIER',
        integrated_text: 'V = ΔS / ΔT'
      },
      {
        scene_id: 'OOL_023',
        name: 'O Terceiro Laço de Validação',
        narrative_function: 'redundancy_check',
        visual_subject: 'Terceiro laço indutivo da faixa acionando um canal secundário de telemetria para dupla checagem',
        voiceover_text: 'Mas a lei exige segurança total: um terceiro laço realiza a mesma medição para cruzar os resultados e eliminar falsos positivos.'
      }
    ]
  },
  {
    chapter_id: 'CH04',
    title: 'O Olho da Lei: Câmera Estroboscópica, OCR & Película 3M',
    focus: 'O disparo da câmera em 1/10.000s, a tecnologia da placa retrorrefletiva e a leitura por visão computacional.',
    scenes: [
      {
        scene_id: 'OOL_024',
        name: 'A Ordem de Disparo',
        narrative_function: 'shutter_trigger',
        visual_subject: 'Cabo coaxial blindado enviando sinal de disparo elétrico TTL do gabinete para o topo do poste em alta velocidade',
        voiceover_text: 'Se a velocidade apurada ultrapassar o limite da via, o processador envia um comando elétrico imediato para o topo do poste.'
      },
      {
        scene_id: 'OOL_025',
        name: 'O Obturador Global',
        narrative_function: 'sensor_shutter',
        visual_subject: 'Sensor CMOS industrial de alta sensibilidade abrindo seu obturador global em 1 sobre 10.000 de segundo',
        voiceover_text: 'A câmera aciona um obturador global ultra-rápido, capaz de congelar qualquer movimento sem a distorção típica de celulares.'
      },
      {
        scene_id: 'OOL_026',
        name: 'O Iluminador Infravermelho',
        narrative_function: 'infrared_pulse',
        visual_subject: 'Matriz de LEDs infravermelhos de 850 nanômetros disparando feixe invisível a olho humano iluminando a traseira do carro',
        voiceover_text: 'Simultaneamente, um iluminador infravermelho invisível ao olho humano banha o veículo com luz estroboscópica.'
      },
      {
        scene_id: 'OOL_027',
        name: 'O Segredo da Placa',
        narrative_function: 'retroreflective_physics',
        visual_subject: 'Macro extremo 35mm na superfície da placa Mercosul revelando milhares de microesferas de vidro prismáticas',
        voiceover_text: 'É aqui que a ótica entra em ação: as placas automotivas são cobertas por uma película retrorrefletiva microprismática.'
      },
      {
        scene_id: 'OOL_028',
        name: 'O Retorno Direto da Luz',
        narrative_function: 'light_return',
        visual_subject: 'Feixe de luz infravermelha batendo nas microesferas da placa e voltando exatamente para o sensor da câmera',
        voiceover_text: 'Em vez de espalhar a luz para os lados, a placa devolve quase cem por cento dos fótons diretamente para a lente da câmera.'
      },
      {
        scene_id: 'OOL_029',
        name: 'A Imagem de Alto Contraste',
        narrative_function: 'ocr_capture',
        visual_subject: 'Fotografia monocromática nítida em preto e branco gerada pelo sensor com os caracteres da placa em contraste absoluto',
        voiceover_text: 'Mesmo a duzentos quilômetros por hora e sob tempestade, a placa aparece cristalina, como se o carro estivesse perfeitamente parado.'
      },
      {
        scene_id: 'OOL_030',
        name: 'A Rede Neural de OCR',
        narrative_function: 'neural_ocr',
        visual_subject: 'Interface de visão computacional destacando caracteres alfanuméricos com caixas delimitadoras em ciano laser',
        voiceover_text: 'O algoritmo de reconhecimento óptico de caracteres segmenta cada letra e número em microssegundos com noventa e nove por cento de precisão.',
        take_type: 'KEYFRAME_DOSSIER',
        integrated_text: 'OCR // LEITURA DE PLACA'
      },
      {
        scene_id: 'OOL_031',
        name: 'O Pacote de Evidência',
        narrative_function: 'evidence_package',
        visual_subject: 'Arquivo criptografado sendo montado com a foto da visão ampla, close da placa, velocidade medida e carimbo de tempo',
        voiceover_text: 'Um pacote digital criptografado é criado na hora, contendo a foto panorâmica, o recorte da placa, a telemetria dos sensores e a hora exata.'
      }
    ]
  },
  {
    chapter_id: 'CH05',
    title: 'O Limite do INMETRO & O Ponto de Falha no Asfalto',
    focus: 'A calibração legal, a dilatação do asfalto no calor de 60°C, a margem de erro de 7 km/h e o descarte de medições instáveis.',
    scenes: [
      {
        scene_id: 'OOL_032',
        name: 'A Temperatura do Pavimento',
        narrative_function: 'thermal_hazard',
        visual_subject: 'Câmera térmica mostrando o asfalto rodoviário a 65 graus Celsius sob sol escaldante distorcendo a pista',
        voiceover_text: 'Mas a física da rodovia é implacável: o asfalto não é um laboratório controlado. No verão brasileiro, o pavimento atinge mais de sessenta graus.'
      },
      {
        scene_id: 'OOL_033',
        name: 'A Dilatação do Asfalto',
        narrative_function: 'material_strain',
        visual_subject: 'Microfissuras no asfalto ao redor da ranhura de resina se expandindo sob o tráfego pesado de carretas',
        voiceover_text: 'Com o calor extremo e o peso constante de caminhões de quarenta toneladas, o pavimento se deforma e as ranhuras podem se mover milímetros.'
      },
      {
        scene_id: 'OOL_034',
        name: 'O Risco do Milímetro',
        narrative_function: 'precision_threat',
        visual_subject: 'Simulação computacional mostrando como uma variação de 2 centímetros na distância altera o cálculo da velocidade',
        voiceover_text: 'Se a distância real entre os laços mudar alguns centímetros, o cálculo de velocidade será matematicamente corrompido.'
      },
      {
        scene_id: 'OOL_035',
        name: 'A Autocalibração Térmica',
        narrative_function: 'compensation_system',
        visual_subject: 'Sensor de temperatura embutido no gabinete ajustando os parâmetros de frequência de amostragem da bobina',
        voiceover_text: 'Por isso, os equipamentos modernos monitoram a impedância de base e compensam a variação térmica do cobre continuamente.'
      },
      {
        scene_id: 'OOL_036',
        name: 'A Auditoria do INMETRO',
        narrative_function: 'legal_metrology',
        visual_subject: 'Caminhão de calibração oficial do INMETRO com rodas instrumentadas e antenas de medição a laser aferindo a pista',
        voiceover_text: 'Todo radar em operação no país precisa ser inspecionado periodicamente pelo INMETRO com veículos padrão de alta precisão.'
      },
      {
        scene_id: 'OOL_037',
        name: 'O Teste da Pista',
        narrative_function: 'calibration_run',
        visual_subject: 'Veículo de inspeção passando sobre os laços a velocidades exatas com telemetria via satélite conferindo o erro',
        voiceover_text: 'Dez passagens em velocidades diferentes são realizadas. Se o erro for superior a um por cento, o radar é lacrado e desativado.'
      },
      {
        scene_id: 'OOL_038',
        name: 'A Margem Legal de 7 km/h',
        narrative_function: 'legal_tolerance',
        visual_subject: 'Tabela oficial da resolução do Contran com destaque em laser laranja para a tolerância de 7 km/h',
        voiceover_text: 'É exatamente para cobrir essas microvariações da física do asfalto que a lei aplica a famosa tolerância de sete quilômetros por hora.',
        take_type: 'KEYFRAME_DOSSIER',
        integrated_text: 'MARGEM INMETRO: ±7 KM/H'
      },
      {
        scene_id: 'OOL_039',
        name: 'O Descarte Automático',
        narrative_function: 'automatic_discard',
        visual_subject: 'Tela de processador descartando registro de medição com alerta de inconsistência de fase entre os laços',
        voiceover_text: 'Se dois veículos cruzarem os laços ao mesmo tempo ou se houver oscilação elétrica, o sistema descarta o registro para evitar multas indevidas.'
      },
      {
        scene_id: 'OOL_040',
        name: 'O Lacre Criptográfico',
        narrative_function: 'cryptographic_seal',
        visual_subject: 'Assinatura digital ICP-Brasil sendo gravada no metadado da imagem com chave de 2048 bits inviolável',
        voiceover_text: 'As infrações válidas recebem uma assinatura digital criptográfica que impede qualquer adulteração humana posterior.'
      }
    ]
  },
  {
    chapter_id: 'CH06',
    title: 'A Conclusão Causal: O Relógio de Asfalto',
    focus: 'A síntese final de que o radar é um instrumento de medição de tempo, a escala invisível das cidades e a assinatura do canal.',
    scenes: [
      {
        scene_id: 'OOL_041',
        name: 'A Rede Oculta da Cidade',
        narrative_function: 'city_scale',
        visual_subject: 'Timelapse cinematográfico noturno em 35mm da Marginal Pinheiros com milhares de carros fluindo sob viadutos',
        voiceover_text: 'Nas grandes capitais, milhares desses sensores operam dia e noite, monitorando milhões de veículos a cada minuto.'
      },
      {
        scene_id: 'OOL_042',
        name: 'Muito Além das Multas',
        narrative_function: 'traffic_data',
        visual_subject: 'Centro de controle de tráfego (CET) com painel monumental escuro mostrando fluxo de veículos em tempo real',
        voiceover_text: 'Eles não servem apenas para fiscalizar: os laços indutivos são os sensores que alimentam os semáforos inteligentes e controlam o fluxo urbano.'
      },
      {
        scene_id: 'OOL_043',
        name: 'A Engenharia da Precisão',
        narrative_function: 'engineering_tribute',
        visual_subject: 'Close 35mm no corte do asfalto com chuva escorrendo sobre o selo de resina sob a luz âmbar dos postes',
        voiceover_text: 'Uma combinação improvável de corte de pedra, eletromagnetismo do século dezenove e redes neurais modernas.'
      },
      {
        scene_id: 'OOL_044',
        name: 'A Ilusão da Câmera',
        narrative_function: 'final_reframe',
        visual_subject: 'Pórtico de radar visto de costas contra o horizonte ao amanhecer com névoa baixa na rodovia',
        voiceover_text: 'Da próxima vez que você passar por um radar na rodovia e olhar para o poste com desconfiança...'
      },
      {
        scene_id: 'OOL_045',
        name: 'O Olhar para o Chão',
        narrative_function: 'final_focus',
        visual_subject: 'Câmera focando no asfalto onde as marcas sutis dos laços cortados aparecem sob o sol nascente',
        voiceover_text: '...lembre-se de que a máquina que mediu o seu tempo não estava olhando para você lá de cima.'
      },
      {
        scene_id: 'OOL_046',
        name: 'A Máquina Subterrânea',
        narrative_function: 'summary_statement',
        visual_subject: 'Pulso de luz laranja correndo subterrâneo pelos cabos até o armário eletrônico na beira da estrada',
        voiceover_text: 'Ela estava debaixo das suas rodas, contando microssegundos no silêncio escuro do pavimento.'
      },
      {
        scene_id: 'OOL_047',
        name: 'O Relógio do Asfalto',
        narrative_function: 'philosophical_payoff',
        visual_subject: 'Plano geral monumental de rodovia cortando serra encoberta por neblina chiaroscuro 35mm',
        voiceover_text: 'Porque no mundo invisível da infraestrutura, a velocidade nada mais é do que uma fração de tempo congelada na matéria.'
      },
      {
        scene_id: 'OOL_048',
        name: 'A Curiosidade Revelada',
        narrative_function: 'channel_transition',
        visual_subject: 'Close na fenda do asfalto emitindo brilho de corte a laser em laranja incandescente (#FF5500)',
        voiceover_text: 'Isso é o que acontece depois que você acelera, freia e segue viagem.'
      },
      {
        scene_id: 'OOL_049',
        name: 'O Chamado à Compreensão',
        narrative_function: 'cta_hook',
        visual_subject: 'Linha de laser ciano (#00F0FF) desenhando o símbolo de corte industrial no centro da tela escura',
        voiceover_text: 'Descubra a engenharia oculta por trás de tudo o que sustenta a sua rotina.'
      },
      {
        scene_id: 'OOL_050',
        name: 'A Assinatura do Canal',
        narrative_function: 'brand_signature',
        visual_subject: 'Fundo preto absoluto (#060709) com o laser laranja cortando o símbolo Split Core e a tipografia oficial em ciano',
        voiceover_text: 'O Outro Lado. Investigar. Revelar. Compreender.',
        take_type: 'KEYFRAME_DOSSIER',
        integrated_text: 'INVESTIGAR. REVELAR. COMPREENDER.'
      }
    ]
  }
];

const flatRadarScenes: HslEditorialSceneSeed[] = RADAR_ASFALTO_CHAPTERS.flatMap(ch =>
  ch.scenes.map(sc => ({
    scene_id: sc.scene_id,
    chapter_id: ch.chapter_id,
    chapter_title: ch.title,
    narrative_function: sc.narrative_function,
    voiceover: sc.voiceover_text,
    visual_mode: 'generated_ai' as const,
    visual_subject: sc.visual_subject,
    claim_source_ids: ['INMETRO-RADAR-PORTARIA-158-2022'],
    visual_function: 'invisible_process' as const
  }))
);

export const EPISODE_05_SEED: HslEpisodeSeed = {
  episode_id: 'OOL-EP05-RADAR-ASFALTO',
  title: 'O Outro Lado do Radar de Velocidade: A Física Invisível Dentro do Asfalto',
  format: 'SYSTEM_ANATOMY',
  target_duration_minutes: 7.6,
  central_question: 'Como um corte no asfalto mede a velocidade do seu carro em microssegundos sem depender da câmera?',
  thesis: 'O radar de trânsito é na verdade um relógio de asfalto baseado em indução magnética e perturbação de correntes de Foucault.',
  object_or_flow: 'Perturbação do campo magnético de 20 kHz por massa de aço automotiva cruzando 3 metros de distância',
  system_being_analyzed: 'Laços Indutivos Subterrâneos, Cristais Piezoelétricos, Câmeras Estroboscópicas e Metrologia Legal INMETRO',
  main_constraint: 'Dilatação térmica do asfalto sob calor de 60°C e tolerância legal de 0,001s',
  primary_consequence: 'Invalidação automática de medições duvidosas e aplicação da margem de erro de 7 km/h',
  hero_visual: 'Fenda de diamante no asfalto molhado emitindo pulso eletromagnético em laranja vapor de sódio #FF5500',
  original_interpretation: 'O motorista olha para a câmera no poste, mas o verdadeiro juiz físico está enterrado sob as suas rodas contando tempo.',
  counterargument_or_limitation: 'Sem a autocalibração contínua de impedância, o desgaste mecânico do pavimento corromperia a velocidade calculada.',
  sources: [
    {
      source_id: 'INMETRO-RADAR-PORTARIA-158-2022',
      category: 'technical',
      url: 'https://www.inmetro.gov.br/legislacao/rtac/pdf/RTAC002878.pdf',
      accessed_at: '2026-08-27',
      claims: ['Medidores de velocidade de veículos automotores utilizam laços indutivos com erro máximo admissível de +/- 7 km/h'],
      limitations: ['Exige calibração metrológica periódica em pista de ensaio']
    }
  ],
  scenes: flatRadarScenes,
  human_approval_status: 'APPROVED'
};
